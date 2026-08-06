'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

type SavedCard = {
  id: string;
  brand: string;
  name: string;
  last: string;
  default?: boolean;
};

// Insignia de marca de tarjeta — detecta Visa/Mastercard/Amex a partir del
// campo `brand` que ya regresa Ecart Pay y dibuja algo parecido al logo real
// en vez de un genérico 💳 para todas.
function CardBrandBadge({ brand }: { brand: string }) {
  const b = (brand || '').toLowerCase();
  if (b === 'visa') {
    return (
      <span className="flex h-6 w-10 items-center justify-center rounded bg-[#1a1f71] text-[11px] font-bold italic text-white">
        VISA
      </span>
    );
  }
  if (b === 'mastercard') {
    return (
      <span className="flex h-6 w-10 items-center justify-center rounded bg-[#f1f1f1]">
        <span className="flex">
          <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
          <span className="-ml-2 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-multiply" />
        </span>
      </span>
    );
  }
  if (b === 'amex' || b === 'american express') {
    return (
      <span className="flex h-6 w-10 items-center justify-center rounded bg-[#2671b9] text-[11px] font-bold text-white">
        AMEX
      </span>
    );
  }
  return <span className="flex h-6 w-10 items-center justify-center rounded bg-border text-xs">💳</span>;
}

// Botón que abre el formulario oficial de Ecart Pay (en un popup) para
// capturar los datos de una tarjeta NUEVA. Los datos de la tarjeta nunca
// tocan nuestro servidor — solo recibimos un token seguro al final.
//
// Si el cliente ya compró antes, sus tarjetas guardadas en Ecart Pay se
// muestran directo aquí (sin popup) — elegir una las tokeniza al instante
// vía tokenizeEcartCard(id). Se muestra colapsado (solo la tarjeta activa,
// con una flechita para desplegar las demás) — igual que un selector de
// método de pago normal, en vez de listar todas en fila.
//
// Nota importante encontrada probando en vivo: dentro del popup de Ecart
// Pay, hacer clic en una tarjeta YA guardada de esa lista no hace nada (no
// selecciona, no dispara ningún evento) — es una limitación del propio SDK
// de Ecart Pay, no de nuestro código. Por eso el flujo real para tarjetas
// guardadas es siempre a través de esta lista de aquí, nunca dentro del
// popup — el popup solo se usa para agregar una tarjeta nueva.
//
// Detalle importante #1 (popups): los navegadores solo permiten abrir una
// ventana emergente (window.open) de forma SÍNCRONA dentro del mismo clic del
// usuario. Si esperamos una respuesta de red (crear la sesión en Ecart Pay)
// antes de abrir la ventana, el navegador la bloquea. Por eso precargamos la
// sesión en segundo plano en cuanto el cliente termina de llenar sus datos.
//
// Detalle importante #2 (evento de guardado): `window.Pay.Cards.on('cards:save',
// cb)` no dispara el callback de forma confiable — escuchamos directamente
// `window.addEventListener('message', ...)` en vez de depender de `.on()`.
export default function CardCapture({ name, email, phone, onTokenChange, onConfiguredChange }: Props) {
  const [sdkUrl, setSdkUrl] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardAdded, setCardAdded] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[] | null>(null);
  const [expanded, setExpanded] = useState(false);
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

  // En cuanto sabemos quién es el cliente en Ecart Pay, revisa si ya tiene
  // tarjetas guardadas de compras anteriores, y selecciona la predeterminada
  // automáticamente para que el cliente no tenga que hacer nada.
  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/ecartpay/cards?customerId=${encodeURIComponent(customerId)}`)
      .then((r) => r.json())
      .then((d) => {
        const cards: SavedCard[] = Array.isArray(d.cards) ? d.cards : [];
        setSavedCards(cards);
        if (cards.length > 0 && !cardAdded) {
          const def = cards.find((c) => c.default) ?? cards[0];
          selectCard(def.id, { silent: true });
        }
      })
      .catch(() => setSavedCards([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

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

      await selectCard(cardId);
      setExpanded(false);
      // Cierra la ventana emergente automáticamente — el cliente ya no
      // necesita verla, la tarjeta quedó guardada y lista para pagar.
      try {
        cardInstanceRef.current?.close?.();
      } catch {
        // si no se puede cerrar sola, no pasa nada — el cliente puede
        // cerrarla manualmente con "Close window".
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkUrl]);

  // Tokeniza una tarjeta (nueva o ya guardada) por su id y la deja lista
  // para cobrar. `silent` evita mostrar el estado de "cargando" cuando la
  // llamamos automáticamente al detectar la tarjeta predeterminada.
  const selectCard = useCallback(
    async (cardId: string, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setStatus('loading');
      setErrorMsg(null);
      try {
        const tokenRes = await fetch('/api/ecartpay/tokenize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokenData.error || 'No se pudo procesar la tarjeta.');
        setCardAdded(true);
        setSelectedCardId(cardId);
        setStatus('idle');
        onTokenChange(tokenData.token);
      } catch (err: any) {
        if (!opts?.silent) {
          setErrorMsg(err.message);
          setStatus('error');
        }
        onTokenChange(null);
      }
    },
    [onTokenChange]
  );

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
      if (data.customerId) setCustomerId(data.customerId);
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
      activeSession = await requestSession();
    }

    if (!activeSession) {
      setStatus('error');
      return;
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

  const hasSavedCards = Boolean(savedCards && savedCards.length > 0);
  const currentCard = hasSavedCards
    ? savedCards!.find((c) => c.id === selectedCardId) ?? savedCards!.find((c) => c.default) ?? savedCards![0]
    : null;
  const otherCards = hasSavedCards ? savedCards!.filter((c) => c.id !== currentCard?.id) : [];

  return (
    <div className="space-y-2">
      {currentCard && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-theme border border-primary bg-primary/5 px-4 py-3 text-left text-sm"
        >
          <span className="flex items-center gap-3">
            <CardBrandBadge brand={currentCard.brand} />
            <span>
              <span className="font-semibold text-ink">
                {currentCard.brand?.toUpperCase()} •••• {currentCard.last}
              </span>
              <span className="ml-2 text-muted">{currentCard.name}</span>
              {currentCard.default && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Predeterminada
                </span>
              )}
            </span>
          </span>
          <ChevronDown size={16} className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}

      {expanded && otherCards.length > 0 && (
        <div className="space-y-2 pl-2">
          {otherCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                selectCard(card.id);
                setExpanded(false);
              }}
              disabled={status === 'loading'}
              className="flex w-full items-center gap-3 rounded-theme border border-border px-4 py-2.5 text-left text-sm disabled:opacity-50"
            >
              <CardBrandBadge brand={card.brand} />
              <span>
                <span className="font-semibold text-ink">
                  {card.brand?.toUpperCase()} •••• {card.last}
                </span>
                <span className="ml-2 text-muted">{card.name}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {(expanded || !hasSavedCards) && (
        <button
          type="button"
          onClick={openCardForm}
          disabled={!scriptLoaded || status === 'loading'}
          className={`w-full rounded-theme border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
            cardAdded && !hasSavedCards ? 'border-primary bg-primary/10 text-primary' : 'border-primary text-primary'
          }`}
        >
          {status === 'loading'
            ? 'Procesando tarjeta...'
            : hasSavedCards
              ? '➕ Agregar otra tarjeta'
              : cardAdded
                ? 'Tarjeta agregada ✓ — cambiar tarjeta'
                : '💳 Agregar tarjeta'}
        </button>
      )}
      {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
      {!scriptLoaded && <p className="text-xs text-muted">Cargando formulario de pago seguro...</p>}
    </div>
  );
}
