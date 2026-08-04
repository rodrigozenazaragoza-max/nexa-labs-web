# Peptides Store — starter

Tienda tipo Exoma/Zelara: Next.js 14 (App Router) + Supabase + Tailwind, con
carrito, checkout y una capa de pagos desacoplada (`lib/payment.ts`) para
conectar Monelo (u otro gateway de alto riesgo) cuando tengas cuenta.

## 0. Antes de lanzar — no es opcional

Este starter incluye age/research-use gate, badges "Not for Human Use" y
disclaimers, pero **no sustituye revisión legal**. Antes de publicar:
revisa `checklist_cumplimiento_peptidos.md` (generado en la conversación
anterior) y confirma con un abogado tu situación específica de importación
y venta.

## 1. Requisitos

- Node 18+
- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Vercel](https://vercel.com)
- Más adelante: cuenta con un gateway de pago que acepte research peptides
  (ej. [Monelo](https://www.monelo.mx), contacto@monelo.mx, +52 56 3634 3634)

## 2. Supabase

1. Crea un proyecto nuevo en supabase.com.
2. Ve a **SQL Editor** → pega el contenido de `supabase/schema.sql` → Run.
   Esto crea las tablas `products`, `orders`, `order_items`, activa RLS y
   mete 3 productos de ejemplo.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (¡no la expongas en el cliente!)

## 3. Variables de entorno

```
cp .env.example .env.local
```

Rellena los valores de Supabase. Deja `MONELO_SECRET_KEY` vacío por ahora —
el checkout funcionará en "modo mock" (crea la orden en Supabase y te manda
a una pantalla de éxito, sin cobrar de verdad) hasta que lo configures.

## 4. Correr en local

```
npm install
npm run dev
```

Abre http://localhost:3000 — deberías ver el catálogo con los 3 productos
de ejemplo cargados desde Supabase.

## 5. Pagos (Monelo)

Cuando tengas cuenta aprobada:

1. Solicita acceso a su API en /desarrolladores de monelo.mx.
2. Rellena `MONELO_SECRET_KEY` y `MONELO_WEBHOOK_SECRET` en `.env.local` (y
   en las variables de entorno de Vercel para producción).
3. Implementa la llamada real en `lib/payment.ts` (ya está el esqueleto y
   comentado dónde va).
4. Configura la URL de tu webhook (`/api/webhook`) en el panel de Monelo
   para que las órdenes pasen de `pending` a `paid` automáticamente.

## 6. Deploy a Netlify (ya configurado — este es el método actual)

Este proyecto usa rutas 100% dinámicas (todo se renderiza en el servidor
porque consulta Supabase en cada visita), así que Netlify necesita el
Next.js Runtime para funcionar — **no sirve subir los archivos ya
compilados a mano**, hay que dejar que Netlify corra el build.

Ya incluye `netlify.toml` con el plugin `@netlify/plugin-nextjs`
configurado. Para desplegar (o volver a desplegar tras un cambio):

1. Abre la carpeta del proyecto en VS Code y abre una terminal
   (Terminal → New Terminal).
2. Corre `npm install` (una sola vez, o cada vez que borres `node_modules`).
3. Corre:
   ```
   npx netlify-cli deploy --build --prod --site 5aa2630f-971f-4e2f-8040-770d3c5d745c
   ```
4. Si te pide iniciar sesión, se abrirá el navegador — inicia sesión con
   la cuenta de Netlify conectada al proyecto y autoriza.
5. Espera a que termine ("Deploy is live"). El sitio queda en
   https://nexa-labs-peptides.netlify.app

El flag `--build` es la parte importante: le dice a Netlify que corra
`next build` con el plugin, en vez de subir los archivos tal cual (eso
fue lo que causó el error 404 la primera vez).

## 6b. Deploy a Vercel (alternativa)

1. Sube este proyecto a un repo de GitHub.
2. Importa el repo en vercel.com → New Project.
3. Agrega las mismas variables de entorno de `.env.local` en Vercel
   (Settings → Environment Variables).
4. Deploy.

## 7. Estructura

```
app/                  rutas (App Router)
  page.tsx            home
  productos/           catálogo + [slug] detalle de producto
  carrito/             página de carrito
  checkout/            formulario + success
  api/checkout         crea la orden en Supabase + inicia pago
  api/webhook          recibe confirmación del gateway de pago
components/           Header, Footer, AgeGate, ProductCard, CartDrawer
lib/                  supabase client/server, cart context, payment.ts
supabase/schema.sql   tablas + RLS + datos de ejemplo
```

## 8. Qué falta para producción real

- [ ] Reemplazar productos de ejemplo por tu catálogo real (o un panel admin)
- [ ] Subir imágenes reales de producto (Supabase Storage) y COAs por lote
- [ ] Implementar `lib/payment.ts` con Monelo real
- [ ] Reemplazar `[TU MARCA]` / `[dirección]` en Header.tsx, Footer.tsx, layout.tsx
- [ ] Revisar Terms of Sale / Privacy Policy / RUO Policy con un abogado
      (puedes partir del `index.html` generado antes en esta conversación)
- [ ] Configurar dominio y SSL en Vercel
- [ ] Analytics (GA4/GTM) y píxeles según necesites

## 9. Editar la plantilla (colores, textos, fuentes)

- **Textos del sitio** (marca, contacto, hero, categorías, trust badges):
  edita `lib/site-config.ts`. Es un solo objeto — cambias el string y se
  refleja en todo el sitio.
- **Colores**: edita las variables al inicio de `app/globals.css`
  (`--color-primary`, `--color-ink`, etc.).
- **Tipografía**: cambia el nombre de fuente en `--font-heading` /
  `--font-body` en `app/globals.css`, y actualiza el link de Google Fonts
  en `app/layout.tsx` (`<head>`) para que cargue la fuente nueva.
- **Tamaños de texto**: variables `--text-hero`, `--text-h2`, etc. en
  `app/globals.css`.
- **Fotos de producto**: por ahora hay bloques placeholder en
  `components/Hero.tsx` y `components/ProductCard.tsx` — reemplázalos por
  `<Image>` de Next.js apuntando a Supabase Storage o a `/public`.

## 10. Newsletter con descuento (nuevo)

Al entrar al sitio (después del age gate) aparece un modal pidiendo correo a
cambio de un código de descuento. Cómo funciona:

- El correo se guarda en la tabla `subscribers` de Supabase (ya está en
  `supabase/schema.sql` — vuelve a correr ese archivo en el SQL Editor si
  ya habías corrido una versión anterior).
- El código de descuento y el porcentaje se configuran en
  `lib/site-config.ts` → `newsletter.discountCode` / `discountPercent`.
- El código se puede canjear en `/checkout` (campo "Código de descuento").
  El servidor (`app/api/checkout/route.ts`) vuelve a validar el código y
  recalcula el total — nunca confía en el descuento que manda el navegador.
- Para exportar los correos y mandarles promociones: Supabase → Table
  Editor → `subscribers` → Export CSV, o conéctalo a tu herramienta de
  email marketing vía la API de Supabase.
- Este es un solo código fijo para todos. Si más adelante quieres cupones
  distintos por usuario/campaña, cámbialo por una tabla `coupons` con
  fecha de expiración y límite de usos.

## 11. Tabs de producto (Overview / Properties / Research / Lab Results / FAQ)

Cada producto ahora tiene 4 columnas nuevas en Supabase para alimentar las
tabs de `components/ProductTabs.tsx`:

- `long_description` (texto) → tab Overview
- `properties` (JSON, array de `{label, value}`) → tab Properties
- `research_notes` (texto) → tab Research
- `faq` (JSON, array de `{question, answer}`) → tab FAQ
- La tab "Lab Results" usa los campos que ya existían (`purity`, `coa_url`)

Para editar el contenido de estas tabs **no toques el componente** — edita
directamente la fila del producto en Supabase (Table Editor → products) o
actualiza `supabase/schema.sql` con tus propios `UPDATE`.

Mantén el texto de `long_description` / `research_notes` en tono de
investigación (hallazgos, mecanismos, terminología científica) — evita
instrucciones de dosis o beneficios para humanos, es lo que más revisa la
FDA/FTC en este tipo de sitios.

## 12. Presentaciones/variantes de producto (5mg, 10mg, etc.)

Algunos productos (ej. Retatrutida) tienen varias presentaciones, cada una
con su propio precio, stock y foto — como el selector de Exoma Peptides.
Esto vive en la tabla `product_variants` (ver `supabase/schema.sql`):

- Si un producto **no** tiene filas en `product_variants`, la página usa el
  precio/stock base de la tabla `products` (ej. Agua Bacteriostática).
- Si un producto **sí** tiene variantes, aparece un selector de
  presentación en `/productos/[slug]` (`components/ProductPurchaseBox.tsx`)
  y la tarjeta del catálogo muestra "Desde $X MXN" (`components/ProductCard.tsx`).
- El carrito y el checkout ya saben leer el precio correcto de la variante
  seleccionada (`lib/cart-utils.ts`).

## 13. Cargar productos desde Excel

En vez de editar Supabase a mano, puedes mantener tu catálogo en
`catalogo-plantilla.xlsx` (incluido junto a este proyecto) y sincronizarlo
con un comando:

1. Llena las hojas **Productos** y **Variantes** del Excel (la hoja
   "Instrucciones" explica cada columna).
2. Guarda el archivo como `catalogo.xlsx` en la raíz del proyecto.
3. Corre:
   ```
   npm run import-catalog
   ```
   Esto crea los productos/variantes nuevos y actualiza los existentes
   (por `slug` en productos, por `producto + presentación` en variantes) —
   puedes correrlo las veces que quieras, es seguro repetirlo.
4. Necesitas `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` reales
   (no placeholders) en `.env.local` para que el script pueda escribir.

Las fotos **no** se suben con este script — sube tus imágenes a Supabase
Storage (o cualquier hosting) y pega la URL pública en la columna
`image_url` del Excel.

## 14. Recordatorio de agua bacteriostática

Si el carrito tiene péptidos pero no tiene el producto configurado como
diluyente (`siteConfig.diluent.slug`, por defecto `agua-bacteriostatica`),
aparece un aviso sugiriendo agregarlo (`components/DiluentReminder.tsx`),
con un botón de agregado rápido y un "Ya tengo" para descartarlo. Si tu
producto de agua tiene otro slug, cámbialo en `lib/site-config.ts`.
