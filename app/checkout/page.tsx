'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { itemImage, itemUnitPrice } from '@/lib/cart-utils';
import { siteConfig } from '@/lib/site-config';
import { formatMxn } from '@/lib/format';
import SectionHeader from '@/components/SectionHeader';
import CardCapture from '@/components/checkout/CardCapture';
import { MX_STATES, findMxStateByName } from '@/lib/mx-states';
import { createClient } from '@/lib/supabase/client';
import { checkPhone, maxDigitsForDialCode } from '@/lib/phone-validation';
import SavedAddresses, { type SavedAddress } from '@/components/checkout/SavedAddresses';

type CpLookupStatus = 'idle' | 'loading' | 'found' | 'not-found';

export default function CheckoutPage() {
  const {
    items, totalMxn, discountMxn, finalTotalMxn, clear,
    couponInput, setCouponInput, appliedCoupon, couponMsg, applyCoupon,
    setQty, removeItem,
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

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressLabel, setAddressLabel] = useState('Casa');

  const [agree, setAgree] = useState(false);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [paymentConfigured, setPaymentConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fullName = `${firstName} ${lastName}`.trim();

  // Si el cliente ya inició sesión, llena contacto y envío automáticamente
  // con sus datos guardados (cuenta + dirección predeterminada) — así no
  // tiene que volver a escribir todo cada vez que compra. Solo llena campos
  // que sigan vacíos, para no pisar algo que el cliente ya haya escrito.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setIsLoggedIn(true);

      if (user.email) setEmail((prev) => prev || user.email!);
      const fullNameMeta = (user.user_metadata as any)?.full_name as string | undefined;
      if (fullNameMeta) {
        const [fn, ...rest] = fullNameMeta.trim().split(' ');
        setFirstName((prev) => prev || fn || '');
        setLastName((prev) => prev || rest.join(' '));
      }

      const { data: address } = await supabase
        .from('customer_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!address) return;
      if (address.phone) setPhone((prev) => prev || address.phone.replace(/\D/g, ''));
      if (address.postal_code) setPostalCode((prev) => prev || address.postal_code);
      if (address.city) setCity((prev) => prev || address.city);
      if (address.state) {
        const matched = findMxStateByName(address.state);
        setState((prev) => prev || matched?.code || '');
      }
      if (address.street) setStreet((prev) => prev || address.street);
    });
  }, []);

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
          if (matched) setState((prev) => prev || matched.code);
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

    const phoneResult = checkPhone(phone, phoneCountry);
    if (!phoneResult.valid) {
      setPhoneTouched(true);
      setPhoneError(phoneResult.error);
      setErrorMsg('Revisa tu número de teléfono antes de continuar.');
      return;
    }

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

      // Guarda la dirección para la próxima compra — solo si el cliente
      // tiene cuenta y dejó la casilla marcada. Si falla, no interrumpe el
      // pedido (ya se cobró y se creó bien), solo no queda guardada.
      if (isLoggedIn && saveAddress) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('customer_addresses').insert({
              user_id: user.id,
              label: addressLabel || 'Casa',
              full_name: fullName,
              phone: phone.replace(/\D/g, ''),
              street: customer.street,
              city,
              state,
              postal_code: postalCode,
              is_default: true,
            });
          }
        } catch (saveErr) {
          console.error('No se pudo guardar la dirección para la próxima vez', saveErr);
        }
      }

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
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setPhoneCountry(nextCountry);
                    const max = maxDigitsForDialCode(nextCountry);
                    const trimmed = phone.slice(0, max);
                    setPhone(trimmed);
                    const result = checkPhone(trimmed, nextCountry);
                    setPhoneError(result.valid ? null : result.error);
                  }}
                  className="rounded-theme border border-border px-2 py-3 text-sm"
                >
                  <option value="52">🇲🇽 +52</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="0">🌐 Otro</option>
                </select>
                <input
                  required
                  inputMode="numeric"
                  className={`${inputClass} ${phoneTouched && phoneError ? 'border-danger' : ''}`}
                  value={phone}
                  onChange={(e) => {
                    // Nunca deja escribir más dígitos de los que el país
                    // permite — así el cliente no puede meter un número mal
                    // por accidente.
                    const digits = e.target.value.replace(/\D/g, '');
                    const max = maxDigitsForDialCode(phoneCountry);
                    const trimmed = digits.slice(0, max);
                    setPhone(trimmed);
                    const result = checkPhone(trimmed, phoneCountry);
                    setPhoneError(result.valid ? null : result.error);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="10 dígitos"
                />
              </div>
              {phoneTouched && phoneError ? (
                <p className="mt-1 text-xs text-danger">{phoneError}</p>
              ) : (
                <p className="mt-1 text-xs text-muted">Solo para rastreo por WhatsApp.</p>
              )}
            </div>
          </section>

          {/* 2. Dirección de envío */}
          <section className="space-y-3 rounded-theme border border-border p-5">
            <h2 className="text-base font-semibold text-ink">2. Dirección de envío</h2>
            <p className="text-xs text-muted">Entrega a todo México · 1-4 días hábiles según zona.</p>

            {isLoggedIn && (
              <SavedAddresses
                onSelect={(addr: SavedAddress) => {
                  setPostalCode(addr.postal_code || '');
                  setCity(addr.city || '');
                  const matched = findMxStateByName(addr.state);
                  setState(matched?.code || addr.state || '');
                  // `street` guardado ya incluye la colonia pegada con coma —
                  // lo dejamos tal cual en el campo Calle, el cliente puede
                  // ajustarlo si hace falta.
                  setStreet(addr.street || '');
                  setColonia('');
                  if (addr.phone) setPhone((prev) => prev || addr.phone!.replace(/\D/g, ''));
                }}
              />
            )}

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
              {cpStatus === 'loading' && <p className="mt-1 text-xs text-muted">Buscando...</p>}
              {cpStatus === 'found' && <p className="mt-1 text-xs text-primary">{city}, {MX_STATES.find((s) => s.code === state)?.name}</p>}
              {cpStatus === 'not-found' && (
                <p className="mt-1 text-xs text-muted">No encontramos ese código postal — llena Estado y Ciudad manualmente.</p>
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

            {isLoggedIn && (
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Guardar esta dirección como
                <input
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  disabled={!saveAddress}
                  className="w-24 rounded-theme border border-border px-2 py-1 text-xs disabled:opacity-50"
                />
                para la próxima compra
              </label>
            )}
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

            <p className="text-center text-xs text-muted">
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

        {/* Resumen del pedido — se muestra la lista real de productos (no
            solo el conteo) para que el cliente vea qué está pagando sin
            tener que abrir el carrito aparte. */}
        <aside className="h-fit space-y-3 rounded-theme border border-border p-5 lg:sticky lg:top-24">
          <p className="text-sm font-semibold text-ink">Tu pedido ({items.reduce((s, i) => s + i.qty, 0)})</p>

          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const image = itemImage(item);
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                    {image && <Image src={image} alt={item.product.name} fill className="object-cover" sizes="48px" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-ink">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-muted">{item.variant.label}</p>}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.qty - 1)}
                        aria-label="Quitar uno"
                        className="flex h-5 w-5 items-center justify-center rounded border border-border text-xs leading-none"
                      >
                        −
                      </button>
                      <span className="min-w-[14px] text-center text-xs text-muted">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.qty + 1)}
                        aria-label="Agregar uno"
                        className="flex h-5 w-5 items-center justify-center rounded border border-border text-xs leading-none"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="ml-1 text-xs text-muted underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <span className="font-price text-xs text-ink">${formatMxn(itemUnitPrice(item) * item.qty)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 border-t border-border pt-3">
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
