'use client';

import { useCallback, useEffect, useState } from 'react';

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
export default function CardCapture({ name, email, phone, onTokenChange, onConfiguredChange }: Props) {
  const [sdkUrl, setSdkUrl] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardAdded, setCardAdded] = useState(false);

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

  const openCardForm = useCallback(async () => {
    if (!name || !email || !phone) {
      setErrorMsg('Completa tu nombre, correo y teléfono antes de agregar la tarjeta.');
      return;
    }
    if (!window.Pay) {
      setErrorMsg('El formulario de pago sigue cargando, espera un segundo e intenta de nuevo.');
      return;
    }
    setErrorMsg(null);
    setStatus('loading');
    try {
      const res = await fetch('/api/ecartpay/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el formulario de pago.');

      const ecartpay = window.Pay.Cards.render({});
      ecartpay.on('cards:save', async (event: any) => {
        try {
          const cardId = event?.id || event?.card_id || event?.data?.id || event?.data?.card_id;
          if (!cardId) throw new Error('No se recibió la tarjeta correctamente. Intenta de nuevo.');
          const tokenRes = await fetch('/api/ecartpay/tokenize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId }),
          });
          const tokenData = await tokenRes.json();
          if (!tokenRes.ok) throw new Error(tokenData.error || 'No se pudo procesar la tarjeta.');
          setCardAdded(true);
          setStatus('idle');
          onTokenChange(tokenData.token);
        } catch (err: any) {
          setErrorMsg(err.message);
          setStatus('error');
          onTokenChange(null);
        }
      });
      ecartpay.session(data.session);
      ecartpay.start();
      setStatus('idle');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }, [name, email, phone, onTokenChange]);

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
            ? 'Abriendo formulario seguro...'
            : '💳 Agregar tarjeta'}
      </button>
      {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
      {!scriptLoaded && <p className="text-xs text-muted">Cargando formulario de pago seguro...</p>}
    </div>
  );
}
