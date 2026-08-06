'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
import CategorySelect from './CategorySelect';

// Formulario de alta de producto. Crea el producto con precio/stock base
// (para productos sin presentaciones); si el producto sí va a tener
// presentaciones (5mg/10mg/etc.), agrégalas después desde su página de
// edición con "+ Agregar presentación" — precio y stock aquí quedan como
// respaldo por si nunca se agrega ninguna.
export default function NewProductForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [purity, setPurity] = useState('≥99% HPLC');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [onSale, setOnSale] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La foto se sube a un id temporal (no tenemos id de producto todavía);
  // Supabase Storage no necesita que el id ya exista, así que usamos un
  // identificador aleatorio solo para el nombre del archivo.
  async function handlePhoto(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('targetType', 'product');
      form.append('targetId', `nuevo-${Date.now()}`);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen.');
      setImageUrl(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError(null);
    if (!name.trim() || !category.trim()) {
      setError('Nombre y categoría son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          purity,
          short_description: shortDescription,
          price_mxn: Number(price),
          stock: Number(stock),
          on_sale: onSale,
          image_url: imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el producto.');
      router.push(`/admin/productos/${data.product.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="rounded-theme border border-border bg-white p-6">
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-muted">Foto principal</label>
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-primary-light">
            {imageUrl ? <Image src={imageUrl} alt="" fill className="object-cover" sizes="64px" /> : null}
          </div>
          <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-theme border border-border px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? 'Subiendo...' : 'Subir foto'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Nombre *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-theme border border-border px-3 py-2 text-sm" placeholder="Ej. Semaglutida" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Categoría *</label>
          <CategorySelect categories={categories} value={category} onChange={setCategory} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Pureza</label>
          <input value={purity} onChange={(e) => setPurity(e.target.value)} className="w-full rounded-theme border border-border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
          Marcar como OFERTA
        </label>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-muted">Descripción corta</label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          className="w-full rounded-theme border border-border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:w-72">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-primary">💲 Precio (MXN)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full rounded-theme border-2 border-primary/40 px-3 py-2 text-sm font-semibold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Stock</label>
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" className="w-full rounded-theme border border-border px-3 py-2 text-sm" />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Si este producto va a tener varias presentaciones (5mg/10mg/etc.), déjalo así por ahora — después de crearlo podrás agregar cada presentación con su propio precio.
      </p>

      {error && <p className="mt-3 text-xs font-medium text-danger">{error}</p>}

      <button
        onClick={save}
        disabled={saving || uploading}
        className="mt-5 flex items-center gap-1.5 rounded-theme bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Creando...' : 'Crear producto'}
      </button>
    </div>
  );
}
