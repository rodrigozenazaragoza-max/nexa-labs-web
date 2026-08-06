import Image from 'next/image';
import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { productLeadImage } from '@/lib/product-image';
import { formatMxn } from '@/lib/format';
import { ImageOff, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createServiceRoleClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .order('name');

  const list = (products ?? []) as Product[];
  const withoutPhoto = list.filter((p) => !productLeadImage(p));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 font-bold text-ink">Productos</h1>
          <p className="mt-1 text-sm text-muted">{list.length} productos en el catálogo.</p>
        </div>
      </div>

      {withoutPhoto.length > 0 && (
        <div className="mb-6 flex items-start gap-2 rounded-theme border border-warn/30 bg-warn-bg px-4 py-3 text-xs text-warn">
          <ImageOff size={16} className="mt-0.5 shrink-0" />
          <p>
            <strong>{withoutPhoto.length} producto{withoutPhoto.length === 1 ? '' : 's'}</strong> sin foto:{' '}
            {withoutPhoto.map((p) => p.name).join(', ')}.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-theme border border-border bg-white">
        {list.map((product) => {
          const image = productLeadImage(product);
          const variants = product.variants ?? [];
          const totalStock = variants.length > 0
            ? variants.reduce((sum, v) => sum + v.stock, 0)
            : product.stock;
          const minPrice = variants.length > 0
            ? Math.min(...variants.map((v) => v.price_mxn))
            : product.price_mxn;

          return (
            <Link
              key={product.id}
              href={`/admin/productos/${product.id}`}
              className="flex items-center gap-3 border-b border-border p-3 last:border-b-0 hover:bg-surface sm:gap-4 sm:p-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                {image ? (
                  <Image src={image} alt={product.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <span className="flex h-full items-center justify-center text-muted">
                    <ImageOff size={16} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                <p className="text-xs text-muted">{product.category}</p>
              </div>

              {product.on_sale && (
                <span className="rounded-full bg-sale px-2.5 py-1 text-[11px] font-bold uppercase text-white">Oferta</span>
              )}

              <div className="hidden w-24 text-right sm:block">
                <p className="font-price text-sm text-ink">${formatMxn(minPrice)}</p>
              </div>

              <div className="w-20 text-right text-xs sm:w-28">
                <span className={totalStock > 0 ? 'text-primary' : 'font-medium text-danger'}>
                  {totalStock > 0 ? `${totalStock} disponibles` : 'Agotado'}
                </span>
              </div>

              <ChevronRight size={16} className="shrink-0 text-muted" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
