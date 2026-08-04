-- Ejecuta esto en Supabase: Project > SQL Editor > New query

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null,
  category text not null,
  purity text not null default '≥99% HPLC',
  price_mxn numeric(10,2) not null,
  stock integer not null default 0,
  image_url text,
  coa_url text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  total_mxn numeric(10,2) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  confirms_research_use boolean not null default false,
  confirms_age boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  qty integer not null,
  unit_price_mxn numeric(10,2) not null
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Cualquiera puede leer el catálogo
create policy "Productos son públicos" on products for select using (true);

-- Nadie puede leer/editar orders directamente desde el navegador (solo vía API route con service role)
create policy "Sin acceso público a orders" on orders for all using (false);
create policy "Sin acceso público a order_items" on order_items for all using (false);

-- Datos de ejemplo — reemplaza con tu catálogo real
insert into products (slug, name, short_description, category, purity, price_mxn, stock, image_url) values
('bpc-157-5mg', 'BPC-157 5mg', 'Péptido de referencia para investigación de recuperación tisular.', 'Recuperación', '≥99% HPLC', 899.00, 25, null),
('tb-500-5mg', 'TB-500 5mg', 'Compuesto de referencia liofilizado para investigación in-vitro.', 'Recuperación', '≥99% HPLC', 1449.00, 20, null),
('ghk-cu-50mg', 'GHK-Cu 50mg', 'Péptido cobre-péptido para estudios de investigación dérmica.', 'Estética', '≥99% HPLC', 699.00, 30, null)
on conflict (slug) do nothing;

-- ============================================================
-- Añadido: newsletter (captura de correo con descuento) y
-- campos extendidos de producto para las tabs estilo
-- Overview / Properties / Research / Lab Results / FAQ.
-- Ejecuta esto también en el SQL Editor de Supabase.
-- ============================================================

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text default 'newsletter_modal',
  created_at timestamptz not null default now()
);

alter table subscribers enable row level security;

-- Cualquiera puede insertar su correo (el formulario público lo necesita),
-- pero nadie puede leer la lista desde el navegador.
create policy "Cualquiera puede suscribirse" on subscribers for insert with check (true);
create policy "Sin lectura pública de subscribers" on subscribers for select using (false);

alter table products add column if not exists long_description text;
alter table products add column if not exists properties jsonb not null default '[]';
alter table products add column if not exists research_notes text;
alter table products add column if not exists faq jsonb not null default '[]';

-- Ejemplo de cómo rellenar estos campos para un producto (edítalo con tus datos reales):
update products set
  long_description = 'Compuesto de referencia sintético estudiado en modelos de investigación por su interacción con vías de señalización celular. Uso exclusivo en investigación de laboratorio — no es para consumo humano ni animal.',
  properties = '[
    {"label": "Fórmula molecular", "value": "C41H63N11O10"},
    {"label": "Peso molecular", "value": "1419.5 g/mol"},
    {"label": "Secuencia", "value": "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val"},
    {"label": "Número CAS", "value": "137525-51-0"},
    {"label": "Apariencia", "value": "Polvo liofilizado"}
  ]',
  research_notes = 'Los estudios en modelos de investigación han reportado interés en las vías de señalización asociadas a este compuesto. Esta información es exclusivamente educativa y no constituye una recomendación de uso humano ni un protocolo de dosificación.',
  faq = '[
    {"question": "¿Este producto es para consumo humano?", "answer": "No. Es exclusivamente para investigación de laboratorio in-vitro."},
    {"question": "¿Incluye Certificado de Análisis (COA)?", "answer": "Sí, cada lote incluye COA verificado por HPLC y espectrometría de masas, disponible para descarga en esta página."},
    {"question": "¿Cómo se almacena?", "answer": "Se recomienda almacenamiento en congelación (-20°C), en lugar seco y protegido de la luz, antes de reconstitución."}
  ]'
where slug = 'bpc-157-5mg';

-- ============================================================
-- Añadido: variantes/presentaciones de producto (ej. 5mg, 10mg,
-- 15mg...), cada una con su propio precio, stock y foto —
-- como el selector de Exoma Peptides.
-- ============================================================

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,            -- ej. "10 mg"
  price_mxn numeric(10,2) not null,
  stock integer not null default 0,
  image_url text,                 -- foto específica de esta presentación (opcional)
  sku text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table product_variants enable row level security;
create policy "Variantes son públicas" on product_variants for select using (true);

-- order_items necesita registrar qué variante se compró (y guardar el
-- nombre de la variante por si luego se edita/borra en el catálogo).
alter table order_items add column if not exists variant_id uuid references product_variants(id);
alter table order_items add column if not exists variant_label text;

-- Ejemplo: convierte BPC-157 en un producto con dos presentaciones.
-- (Si ya habías corrido el schema anterior con slug 'bpc-157-5mg',
-- este UPDATE le quita el tamaño del slug para que las variantes vivan
-- debajo de un solo producto, tal como en Exoma.)
update products set slug = 'bpc-157', name = 'BPC-157' where slug = 'bpc-157-5mg';

insert into product_variants (product_id, label, price_mxn, stock, sort_order)
select id, '5 mg', 899.00, 25, 1 from products where slug = 'bpc-157'
on conflict do nothing;

insert into product_variants (product_id, label, price_mxn, stock, sort_order)
select id, '10 mg', 1649.00, 15, 2 from products where slug = 'bpc-157'
on conflict do nothing;

insert into product_variants (product_id, label, price_mxn, stock, sort_order)
select id, '15 mg', 2299.00, 0, 3 from products where slug = 'bpc-157'
on conflict do nothing;

-- ============================================================
-- Añadido: agua bacteriostática (diluyente) + recordatorio en carrito.
-- ============================================================
insert into products (slug, name, short_description, category, purity, price_mxn, stock, image_url) values
('agua-bacteriostatica', 'Agua Bacteriostática', 'Diluyente estéril para reconstitución de péptidos liofilizados en laboratorio.', 'Suministros', 'USP', 200.00, 50, null)
on conflict (slug) do nothing;

-- ============================================================
-- Añadido: constraint para que el import de Excel pueda hacer
-- upsert de variantes sin duplicar (mismo producto + misma etiqueta).
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_variants_product_label_unique'
  ) then
    alter table product_variants
      add constraint product_variants_product_label_unique unique (product_id, label);
  end if;
end $$;

-- ============================================================
-- Añadido: avisos de "vuelve a estar disponible" — cuando un
-- producto/presentación está agotado, el visitante deja su correo
-- y queda aquí guardado para que le avises manualmente por ahora.
-- ============================================================

create table if not exists stock_notifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  product_name text not null,
  name text,
  email text not null,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table stock_notifications enable row level security;
create policy "Cualquiera puede pedir aviso de stock" on stock_notifications for insert with check (true);
create policy "Sin lectura pública de stock_notifications" on stock_notifications for select using (false);

-- ============================================================
-- Añadido: marca "OFERTA" — actívala en un producto (columna
-- on_sale = true en Supabase, o en la tabla, o desde el Excel de
-- carga) y se muestra automáticamente una etiqueta roja en la
-- esquina superior derecha de su foto en catálogo y detalle.
-- ============================================================
alter table products add column if not exists on_sale boolean not null default false;

-- ============================================================
-- Añadido: número de pedido legible + datos de guía de rastreo en
-- orders, y tabla `returns` para solicitudes de devolución hechas
-- desde /faq (rastrear pedido + solicitar devolución). Esto ya se
-- aplicó directamente en tu proyecto de Supabase — este bloque queda
-- aquí solo como documentación/histórico del esquema.
-- ============================================================
alter table orders add column if not exists order_number text;
alter table orders alter column order_number
  set default ('NXL-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 6)));
alter table orders add column if not exists tracking_carrier text;
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists tracking_url text;
alter table orders add column if not exists shipped_at timestamptz;

create table if not exists returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  order_number text not null,
  customer_name text not null,
  customer_email text not null,
  reason text not null,
  details text,
  status text not null default 'pendiente' check (status in ('pendiente','aprobada','rechazada','completada')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table returns enable row level security;
create policy "Sin acceso público a returns" on returns for all using (false);
