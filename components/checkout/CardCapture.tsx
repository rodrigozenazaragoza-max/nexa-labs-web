'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Pay?: any;
  }
}

type Props = {
  name: string;
  email: string;
  phone: string;
  onTokenChange: (token: string | null) => void;
  onConfiguredChange?: (configured: boolean) => void;
};

// Botón que abre el formulario oficial de Ecart Pay (en un popup) para
// capturar los datos de la tarjeta. Los datos de la tarjeta nunca tocan
// nuestro servidor — solo recibimos un token seguro al final.
//
// Detalle importante #1 (popups): los navegadores solo permiten abrir una
// ventana emergente (window.open) de forma SÍNCRONA dentro del mismo clic del
// usuario. Si esperamos una respuesta de red (crear la sesión en Ecart Pay)
// antes de abrir la ventana, el navegador la bloquea. Por eso precargamos la
// sesión en segundo plano en cuanto el cliente termina de llenar sus datos.
//
// Detalle importante #2 (evento de guardado — encontrado probando en vivo):
// el método que documenta Ecart Pay, `window.Pay.Cards.on('cards:save', cb)`,
// NO dispara el callback de forma confiable en su SDK actual (lo confirmamos
// registrando un listener de prueba y viendo que el mensaje real de guardado
// llegaba a la ventana pero el callback de `.on()` nunca se ejecutaba). Lo
// que SÍ llega siempre es el `postMessage` crudo que la ventana emergente le
// manda a esta página. Por eso escuchamos directamente `window.addEventListener
// ('message', ...)` en vez de depender de `.on()`, filtrando por origen y
// por `data.type === 'cards:save'`.
export default function CardCapture({ name, email, phone, onTokenChange, onConfiguredChange }: Props) {
  const [sdkUrl, setSdkUrl] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardAdded, setCardAdded] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const listenerRegistered = useRef(false);
  const fetchingSession = useRef(false);
  const cardInstanceRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/ecartpay/config')
      .then((r) => r.json())
      .then((d) => {
        setSdkUrl(d.sdkUrl);
        setConfigured(Boolean(d.configured));
        onConfiguredChange?.(Boolean(d.configured));
      })
      .catch(() => {
        setConfigured(false);
        onConfiguredChange?.(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sdkUrl || !configured) return;
    if (document.querySelector(`script[src="${sdkUrl}"]`)) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setErrorMsg('No se pudo cargar el formulario de pago. Recarga la página e intenta de nuevo.');
    document.body.appendChild(script);
  }, [sdkUrl, configured]);

  // Escucha directamente los mensajes que la ventana emergente de Ecart Pay
  // le manda a esta pestaña — ver nota arriba sobre por qué no confiamos en
  // window.Pay.Cards.on(). Se registra una sola vez, en cuanto conocemos el
  // dominio del SDK (para no procesar mensajes de otros orígenes).
  useEffect(() => {
    if (!sdkUrl || listenerRegistered.current) return;
    listenerRegistered.current = true;

    let expectedOrigin: string | null = null;
    try {
      expectedOrigin = new URL(sdkUrl).origin;
    } catch {
      expectedOrigin = null;
    }

    async function handleMessage(event: MessageEvent) {
      if (expectedOrigin && event.origin !== expectedOrigin) return;
      const payload = event.data;
      if (!payload || payload.type !== 'cards:save') return;

      const cardId = payload.data?.id || payload.data?.card_id;
      if (!cardId) return;

      setStatus('loading');
      try {
        const tokenRes = await fetch('/api/ecartpay/tokenize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokenData.error || 'No se pudo procesar la tarjeta.');
        setCardAdded(true);
        setStatus('idle');
        setErrorMsg(null);
        onTokenChange(tokenData.token);
        // Cierra la ventana emergente automáticamente — el cliente ya no
        // necesita verla, la tarjeta quedó guardada y lista para pagar.
        try {
          cardInstanceRef.current?.close?.();
        } catch {
          // si no se puede cerrar sola, no pasa nada — el cliente puede
          // cerrarla manualmente con "Close window".
        }
      } catch (err: any) {
        setErrorMsg(err.message);
        setStatus('error');
        onTokenChange(null);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sdkUrl, onTokenChange]);

  const requestSession = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/ecartpay/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.session) {
        setErrorMsg(data.error || 'No se pudo preparar el formulario de pago. Verifica tus datos e intenta de nuevo.');
        return null;
      }
      setSession(data.session);
      setErrorMsg(null);
      return data.session as string;
    } catch (err) {
      setErrorMsg('No se pudo conectar con el formulario de pago. Revisa tu conexión e intenta de nuevo.');
      return null;
    }
  }, [name, email, phone]);

  // Precarga la sesión de pago en cuanto tengamos nombre/correo/teléfono
  // válidos, para que el botón pueda abrir la ventana segura al instante.
  useEffect(() => {
    if (!configured || session || fetchingSession.current) return;
    const validEmail = /\S+@\S+\.\S+/.test(email);
    if (!name.trim() || !validEmail || phone.trim().length < 8) return;

    fetchingSession.current = true;
    const timer = setTimeout(() => {
      requestSession().finally(() => {
        fetchingSession.current = false;
      });
    }, 600); // pequeño debounce para no disparar en cada tecla

    return () => clearTimeout(timer);
  }, [name, email, phone, configured, session, requestSession]);

  const openCardForm = useCallback(async () => {
    if (!name || !email || !phone) {
      setErrorMsg('Completa tu nombre, correo y teléfono antes de agregar la tarjeta.');
      return;
    }
    if (!window.Pay || !scriptLoaded) {
      setErrorMsg('El formulario de pago sigue cargando, espera un segundo e intenta de nuevo.');
      return;
    }

    setErrorMsg(null);
    setStatus('loading');

    let activeSession = session;
    if (!activeSession) {
      // La precarga en segundo plano no terminó a tiempo (o falló) — lo
      // intentamos ahora mismo como respaldo, aunque exista el riesgo de que
      // el navegador bloquee la ventana por no ser 100% síncrono con el clic.
      activeSession = await requestSession();
    }

    if (!activeSession) {
      setStatus('error');
      return; // requestSession ya dejó el mensaje de error específico
    }

    try {
      const ecartpay = window.Pay.Cards.render({});
      cardInstanceRef.current = ecartpay;
      ecartpay.session(activeSession);
      ecartpay.start();
      setStatus('idle');
    } catch (sdkErr) {
      setStatus('error');
      setErrorMsg(
        'No se pudo abrir la ventana segura de pago. Verifica que tu navegador no esté bloqueando ventanas emergentes para este sitio, y recarga la página si el problema continúa.'
      );
    }
  }, [name, email, phone, session, scriptLoaded, requestSession]);

  if (configured === null) {
    return <p className="text-xs text-muted">Cargando formulario de pago...</p>;
  }

  if (!configured) {
    return (
      <p className="rounded-theme border border-border bg-surface px-4 py-3 text-xs text-muted">
        El pago con tarjeta está en configuración. Tu pedido quedará registrado y te contactaremos para confirmar el pago.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={openCardForm}
        disabled={!scriptLoaded || status === 'loading'}
        className={`w-full rounded-theme border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
          cardAdded ? 'border-primary bg-primary/10 text-primary' : 'border-primary text-primary'
        }`}
      >
        {cardAdded
          ? 'Tarjeta agregada ✓ — cambiar tarjeta'
          : status === 'loading'
            ? 'Procesando tarjeta...'
            : '💳 Agregar tarjeta'}
      </button>
      {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
      {!scriptLoaded && <p className="text-xs text-muted">Cargando formulario de pago seguro...</p>}
    </div>
  );
}
