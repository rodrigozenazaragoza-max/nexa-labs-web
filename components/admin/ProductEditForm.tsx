'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Check, Loader2, Plus, Trash2, FileText, ExternalLink } from 'lucide-react';
import CategorySelect from './CategorySelect';
import type { Product, ProductVariant } from '@/lib/types';

function ImageUploader({
  currentUrl,
  targetType,
  targetId,
  onUploaded,
}: {
  currentUrl: string | null;
  targetType: 'product' | 'variant';
  targetId: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('targetType', targetType);
      form.append('targetId', targetId);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen.');
      onUploaded(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-primary-light">
        {currentUrl ? (
          <Image src={currentUrl} alt="" fill className="object-cover" sizes="64px" />
        ) : null}
      </div>
      <div>
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
              if (file) handleFile(file);
            }}
          />
        </label>
        {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
      </div>
    </div>
  );
}

function CoaUploader({ productId, currentUrl }: { productId: string; currentUrl: string | null }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState(currentUrl);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('productId', productId);
      const res = await fetch('/api/admin/upload-coa', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir el certificado.');
      setUrl(data.coaUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">Certificado de Análisis (COA) — PDF</label>
      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-theme border border-border px-3 py-2 text-xs font-semibold text-ink hover:border-primary"
          >
            <FileText size={13} /> Ver COA actual <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-xs text-muted">Este producto todavía no tiene un COA subido.</span>
        )}
        <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-theme border border-border px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Subiendo...' : url ? 'Reemplazar PDF' : 'Subir PDF'}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
      <p className="mt-1 text-[11px] text-muted">
        Al subir un PDF nuevo se reemplaza automáticamente el certificado anterior de este producto y el botón
        "Ver Certificado de Análisis" en la página del producto se actualiza solo.
      </p>
    </div>
  );
}

function VariantRow({ variant }: { variant: ProductVariant }) {
  const [label, setLabel] = useState(variant.label);
  const [price, setPrice] = useState(String(variant.price_mxn));
  const [stock, setStock] = useState(String(variant.stock));
  const [imageUrl, setImageUrl] = useState(variant.image_url);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/admin/variants/${variant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, price_mxn: Number(price), stock: Number(stock) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-end gap-3 border-b border-border py-4 last:border-b-0 sm:grid-cols-[auto_1fr_auto_auto_auto]">
      <div>
        <label className="mb-1 block text-[11px] font-medium text-muted">Foto</label>
        <ImageUploader currentUrl={imageUrl} targetType="variant" targetId={variant.id} onUploaded={setImageUrl} />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-muted">Presentación</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-theme border border-border px-3 py-2 text-sm"
          placeholder="Presentación (ej. 10 mg)"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-primary">💲 Precio (MXN)</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          className="w-28 rounded-theme border-2 border-primary/40 px-3 py-2 text-sm font-semibold"
          placeholder="Precio"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-muted">Stock</label>
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          type="number"
          className="w-24 rounded-theme border border-border px-3 py-2 text-sm"
          placeholder="Stock"
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center justify-center gap-1.5 rounded-theme bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {saved ? <Check size={13} /> : null}
        {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
      </button>
    </div>
  );
}

export default function ProductEditForm({ product, categories }: { product: Product; categories: string[] }) {
  const [name, setName] = useState(product.name);
  const [shortDescription, setShortDescription] = useState(product.short_description);
  const [category, setCategory] = useState(product.category);
  const [purity, setPurity] = useState(product.purity);
  const [onSale, setOnSale] = useState(product.on_sale);
  const [price, setPrice] = useState(String(product.price_mxn));
  const [stock, setStock] = useState(String(product.stock));
  const [imageUrl, setImageUrl] = useState(product.image_url);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [variants, setVariants] = useState<ProductVariant[]>(
    [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [addingVariant, setAddingVariant] = useState(false);

  const hasVariants = variants.length > 0;

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          short_description: shortDescription,
          category,
          purity,
          on_sale: onSale,
          price_mxn: Number(price),
          stock: Number(stock),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function addVariant() {
    setAddingVariant(true);
    try {
      const res = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          label: 'Nueva presentación',
          price_mxn: 0,
          stock: 0,
          sort_order: variants.length,
        }),
      });
      const data = await res.json();
      if (res.ok) setVariants((v) => [...v, data.variant]);
    } finally {
      setAddingVariant(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-theme border border-border bg-white p-6">
        <h2 className="mb-4 font-heading text-sm font-bold text-ink">Producto</h2>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-muted">Foto principal</label>
          <ImageUploader currentUrl={imageUrl} targetType="product" targetId={product.id} onUploaded={setImageUrl} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-theme border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Categoría</label>
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

        <div className="mt-4">
          <CoaUploader productId={product.id} currentUrl={product.coa_url} />
        </div>

        {!hasVariants && (
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
        )}

        <button
          onClick={save}
          disabled={saving}
          className="mt-5 flex items-center gap-1.5 rounded-theme bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saved && <Check size={14} />}
          {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar producto'}
        </button>
      </div>

      <div className="rounded-theme border border-border bg-white p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-ink">Presentaciones</h2>
          <button
            onClick={addVariant}
            disabled={addingVariant}
            className="flex items-center gap-1.5 rounded-theme border border-primary px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-60"
          >
            <Plus size={13} /> {addingVariant ? 'Agregando...' : 'Agregar presentación'}
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">
          El precio de cada presentación (💲 recuadro verde) es el que se cobra en el sitio — cada renglón se guarda por separado con su botón "Guardar".
        </p>
        {hasVariants ? (
          variants.map((v) => <VariantRow key={v.id} variant={v} />)
        ) : (
          <p className="rounded-theme border border-dashed border-border py-6 text-center text-xs text-muted">
            Este producto no tiene presentaciones — usa el precio/stock de arriba, o agrega presentaciones (5mg/10mg/etc.) con el botón de arriba.
          </p>
        )}
      </div>
    </div>
  );
}
