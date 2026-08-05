'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Loader2, Star, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Address = {
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

const EMPTY_FORM = { label: 'Casa', full_name: '', phone: '', street: '', city: '', state: '', postal_code: '', is_default: false };

export default function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('customer_addresses').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: false });
    setAddresses((data as Address[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label,
      full_name: a.full_name,
      phone: a.phone ?? '',
      street: a.street,
      city: a.city,
      state: a.state,
      postal_code: a.postal_code,
      is_default: a.is_default,
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Tu sesión expiró — recarga la página.');
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase.from('customer_addresses').update(form).eq('id', editingId);
      if (updateError) {
        setError('No se pudo guardar. Intenta de nuevo.');
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('customer_addresses').insert({ ...form, user_id: user.id });
      if (insertError) {
        setError('No se pudo guardar. Intenta de nuevo.');
        setSaving(false);
        return;
      }
    }

    if (form.is_default) {
      if (editingId) {
        // Desmarca cualquier otra dirección como default; esta ya quedó en true por el update de arriba.
        await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', user.id).neq('id', editingId);
      } else {
        // Dirección nueva: primero desmarca todas, luego marca solo la recién creada.
        await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', user.id);
        const { data: latest } = await supabase
          .from('customer_addresses')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (latest) await supabase.from('customer_addresses').update({ is_default: true }).eq('id', latest.id);
      }
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta dirección?')) return;
    const supabase = createClient();
    await supabase.from('customer_addresses').delete().eq('id', id);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-theme border border-border bg-white p-10">
        <Loader2 size={20} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-sm font-bold uppercase tracking-wide text-ink">Mis direcciones</h1>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-theme bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-primary-dark"
          >
            <Plus size={14} /> Agregar dirección
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-theme border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">{editingId ? 'Editar dirección' : 'Nueva dirección'}</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Etiqueta" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Casa, Oficina…" />
            <Field label="Nombre completo" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
          </div>
          <Field label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Calle y número" value={form.street} onChange={(v) => setForm({ ...form, street: v })} required />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Ciudad" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <Field label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
            <Field label="Código postal" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} required />
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Usar como dirección predeterminada
          </label>

          {error && <p className="rounded-theme bg-danger-bg px-3 py-2 text-xs font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-theme bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar dirección
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-theme border border-dashed border-border bg-white p-10 text-center">
          <MapPin size={26} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">Aún no guardas ninguna dirección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-theme border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink">
                  <MapPin size={13} className="text-primary" /> {a.label}
                  {a.is_default && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
                      <Star size={9} /> Predeterminada
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(a)} className="text-muted hover:text-primary">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-muted hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink">{a.full_name}</p>
              <p className="text-xs text-muted">
                {a.street}, {a.city}, {a.state} {a.postal_code}
              </p>
              {a.phone && <p className="mt-1 text-xs text-muted">Tel: {a.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-theme border border-border px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
