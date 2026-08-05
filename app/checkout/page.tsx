'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { siteConfig } from '@/lib/site-config';
import { formatMxn } from '@/lib/format';
import SectionHeader from '@/components/SectionHeader';
import CardCapture from '@/components/checkout/CardCapture';
import { MX_STATES, findMxStateByName } from '@/lib/mx-states';

type CpLookupStatus = 'idle' | 'loading' | 'found' | 'not-found';

export default function CheckoutPage() {
  const {
    items, totalMxn, discountMxn, finalTotalMxn, clear,
    couponInput, setCouponInput, appliedCoupon, couponMsg, applyCoupon,
  } = useCart();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('52');
  const [phone, setPhone] = useState('');

  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [colonia, setColonia] = useState('');
  const [street, setStreet] = useState('');
  const [extNumber, setExtNumber] = useState('');
  const [intNumber, setIntNumber] = useState('');
  const [references, setReferences] = useState('');

  const [cpStatus, setCpStatus] = useState<CpLookupStatus>('idle');
  const cpLookupSeq = useRef(0);

  const [agree, setAgree] = useState(false);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [paymentConfigured, setPaymentConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fullName = `${firstName} ${lastName}`.trim();

  // Busca el código postal en cuanto el cliente termina de escribir 5
  // dígitos, y llena Estado/Ciudad automáticamente (Colonia queda editable,
  // se sugiere pero no se impone porque una CP puede tener varias colonias).
  useEffect(() => {
    const digits = postalCode.replace(/\D/g, '');
    if (digits.length !== 5) {
      setCpStatus('idle');
      return;
    }
    const seq = ++cpLookupSeq.current;
    setCpStatus('loading');
    const timer = setTimeout(() => {
      fetch(`https://api.zippopotam.us/mx/${digits}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (seq !== cpLookupSeq.current) return; // respuesta vieja, ignorar
          const place = data?.places?.[0];
          if (!place) {
            setCpStatus('not-found');
            return;
          }
          setCity((prev) => prev || place['place name']);
          setColonia((prev) => prev || place['place name']);
          const matched = findMxStateByName(place.state);
          if (matched) setState(matched.code);
          setCpStatus('found');
        })
        .catch(() => {
          if (seq === cpLookupSeq.current) setCpStatus('not-found');
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [postalCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!agree) {
      setErrorMsg('Debes confirmar que eres mayor de edad y que entiendes el uso de investigación para continuar.');
      return;
    }
    if (paymentConfigured && !cardToken) {
      setErrorMsg('Agrega una tarjeta para poder confirmar el pedido.');
      return;
    }
    setLoading(true);
    try {
      const streetLine = [street, extNumber].filter(Boolean).join(' ') + (intNumber ? ` Int. ${intNumber}` : '');
      const address = `${streetLine}, ${colonia}, ${city}, ${state}, CP ${postalCode}${references ? ` — Ref: ${references}` : ''}`;
      const customer = {
        name: fullName,
        email,
        phone: phone.replace(/\D/g, ''),
        address,
        street: streetLine + (colonia ? `, ${colonia}` : ''),
        city,
        state,
        postalCode,
        confirmsResearchUse: agree,
        confirmsAge: agree,
      };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer, couponCode: appliedCoupon, cardToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido.');
      clear();
      router.push(data.payment.redirectUrl || `/checkout/success?order=${data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="mx-auto max-w-lg px-6 py-14 text-muted">Tu carrito está vacío.</p>;
  }

  const inputClass = 'w-full rounded-theme border border-border px-4 py-3 text-sm';
  const labelClass = 'mb-1 block text-xs font-semibold text-muted';

  return (
    <div>
      <SectionHeader crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Checkout' }]} title="Finaliza tu compra" />

      {/* Indicador visual de pasos — todo va en una sola página, esto es solo
          para que el cliente sepa qué tan lejos está de terminar. */}
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 px-6 pt-8 text-xs font-semibold text-muted">
        <span className="text-primary">① Contacto</span>
        <span className="h-px w-8 bg-border" />
        <span className="text-primary">② Envío</span>
        <span className="h-px w-8 bg-border" />
        <span className="text-primary">③ Pago</span>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-8 lg:grid-cols-[1.6fr_1fr]">
        <form onSubmit={submit} className="space-y-8">
          {/* 1. Contacto */}
          <section className="space-y-3 rounded-theme border border-border p-5">
            <h2 className="text-base font-semibold text-ink">1. Contacto</h2>
            <p className="text-xs text-muted">Solo para enviarte la confirmación y la guía de rastreo de tu pedido.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nombre(s)</label>
                <input required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Apellido(s)</label>
                <input required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Correo electrónico</label>
              <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <div className="flex gap-2">
                <select
                  value={phoneCountry}
                  onChange={(e) => setPhoneCountry(e.target.value)}
                  className="rounded-theme border border-border px-2 py-3 text-sm"
                >
                  <option value="52">🇲🇽 +52</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="0">🌐 Otro</option>
                </select>
                <input
                  required
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 dígitos"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">Solo para rastreo por WhatsApp.</p>
            </div>
          </section>

          {/* 2. Dirección de envío */}
          <section className="space-y-3 rounded-theme border border-border p-5">
            <h2 className="text-base font-semibold text-ink">2. Dirección de envío</h2>
            <p className="text-xs text-muted">Entrega a todo México · 1-4 días hábiles según zona.</p>

            <div>
              <label className={labelClass}>Código postal</label>
              <input
                required
                inputMode="numeric"
                maxLength={5}
                className={inputClass}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                placeholder="5 dígitos"
              />
              {cpStatus === 'loading' && <p className="mt-1 text-[11px] text-muted">Buscando...</p>}
              {cpStatus === 'found' && <p className="mt-1 text-[11px] text-primary">{city}, {MX_STATES.find((s) => s.code === state)?.name}</p>}
              {cpStatus === 'not-found' && (
                <p className="mt-1 text-[11px] text-muted">No encontramos ese código postal — llena Estado y Ciudad manualmente.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Estado</label>
                <select required className={inputClass} value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Estado</option>
                  {MX_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ciudad</label>
                <input required className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Colonia / Barrio</label>
              <input required className={inputClass} value={colonia} onChange={(e) => setColonia(e.target.value)} />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className={labelClass}>Calle</label>
                <input required className={inputClass} value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Ej: Av. Revolución" />
              </div>
              <div>
                <label className={labelClass}>Núm. Exterior</label>
                <input required className={`${inputClass} w-28`} value={extNumber} onChange={(e) => setExtNumber(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Núm. Interior (opcional)</label>
              <input className={inputClass} value={intNumber} onChange={(e) => setIntNumber(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Referencias para el repartidor (opcional)</label>
              <input className={inputClass} value={references} onChange={(e) => setReferences(e.target.value)} placeholder="Ej: portón negro, junto a farmacia, timbre 2B" />
            </div>
          </section>

          {/* 3. Método de pago */}
          <section className="space-y-3 rounded-theme border border-border p-5">
            <h2 className="text-base font-semibold text-ink">3. Método de pago</h2>
            <p className="text-xs text-muted">Selecciona cómo deseas pagar.</p>
            <div className="flex gap-2">
              <button type="button" className="flex-1 rounded-theme border border-primary bg-primary/10 py-2 text-sm font-semibold text-primary">
                💳 Tarjeta
              </button>
              <button type="button" disabled className="flex-1 rounded-theme border border-border py-2 text-sm font-semibold text-muted opacity-60">
                🏦 Transferencia SPEI (próximamente)
              </button>
            </div>

            <label className="flex items-start gap-2 rounded-theme border border-border bg-surface px-4 py-3 text-xs text-muted">
              <input type="checkbox" className="mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                Confirmo que soy mayor de 18 años y entiendo que los productos son exclusivamente para investigación científica, no para consumo humano o animal.
                {' '}Acepto*: <a href="/privacidad" target="_blank" className="underline">Privacidad</a> · <a href="/terminos" target="_blank" className="underline">Términos</a> · <a href="/envios" target="_blank" className="underline">Envíos</a> · <a href="/devoluciones" target="_blank" className="underline">Devoluciones</a>
              </span>
            </label>

            <CardCapture
              name={fullName}
              email={email}
              phone={phone.replace(/\D/g, '')}
              onTokenChange={setCardToken}
              onConfiguredChange={setPaymentConfigured}
            />

            {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

            <button disabled={loading} className="w-full rounded-theme bg-primary py-3 font-semibold text-white disabled:opacity-50">
              {loading ? 'Procesando...' : `Pagar $${formatMxn(finalTotalMxn)} MXN`}
            </button>

            <p className="text-center text-[11px] text-muted">
              ¿Prefieres confirmar el pedido por WhatsApp?{' '}
              <a
                href={`https://wa.me/${siteConfig.contact.whatsappNumber}`}
                target="_blank"
                className="font-semibold text-primary underline"
              >
                Escríbenos
              </a>
            </p>
          </section>
        </form>

        {/* Resumen del pedido */}
        <aside className="h-fit space-y-3 rounded-theme border border-border p-5 lg:sticky lg:top-24">
          <p className="text-sm font-semibold text-ink">{items.reduce((s, i) => s + i.qty, 0)} productos</p>
          <div className="flex gap-2">
            <input
              placeholder="Código de descuento"
              className="w-full rounded-theme border border-border px-3 py-2 text-xs"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button type="button" onClick={applyCoupon} className="whitespace-nowrap rounded-theme border border-border px-3 text-xs font-semibold">
              Aplicar
            </button>
          </div>
          {couponMsg && <p className={`text-xs ${appliedCoupon ? 'text-primary' : 'text-danger'}`}>{couponMsg}</p>}

          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-price">${formatMxn(totalMxn)} MXN</span>
            </div>
            {appliedCoupon && (
              <div className="flex items-center justify-between text-primary">
                <span>Descuento ({siteConfig.newsletter.discountPercent}%)</span>
                <span className="font-price">-${formatMxn(discountMxn)} MXN</span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted">
              <span>Envío</span>
              <span className="font-semibold text-primary">Gratis</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-lg font-semibold text-ink">
              <span>Total</span>
              <span className="font-price">${formatMxn(finalTotalMxn)} MXN</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
