'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SavedAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

type Props = {
  onSelect: (address: SavedAddress) => void;
};

// Solo se muestra si el cliente tiene sesión iniciada y ya tiene direcciones
// guardadas de compras anteriores — RLS en `customer_addresses` ya garantiza
// que cada quien solo ve las suyas, así que basta con pedir "todas".
export default function SavedAddresses({ onSelect }: Props) {
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAddresses([]);
        return;
      }
      const { data } = await supabase
        .from('customer_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      const list = (data ?? []) as SavedAddress[];
      setAddresses(list);

      const def = list.find((a) => a.is_default) ?? list[0];
      if (def) {
        setSelectedId(def.id);
        onSelect(def);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!addresses || addresses.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted">Tus direcciones guardadas</p>
      {addresses.map((addr) => (
        <button
          key={addr.id}
          type="button"
          onClick={() => {
            setSelectedId(addr.id);
            onSelect(addr);
          }}
          className={`block w-full rounded-theme border px-4 py-3 text-left text-sm ${
            selectedId === addr.id ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <span className="font-semibold text-ink">
            {addr.label}
            {addr.is_default && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Predeterminada
              </span>
            )}
          </span>
          <p className="mt-0.5 text-xs text-muted">
            {addr.street}, {addr.city}, {addr.state} CP {addr.postal_code}
          </p>
        </button>
      ))}
      <p className="text-xs text-muted">
        O llena una dirección nueva abajo — puedes guardarla para la próxima vez.
      </p>
    </div>
  );
}
