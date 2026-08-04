#!/usr/bin/env node
// Lee catalogo.xlsx (hojas "Productos" y "Variantes") y sincroniza los
// datos a Supabase. Uso:
//
//   npm run import-catalog                  (busca ./catalogo.xlsx)
//   node scripts/import-catalog.mjs ruta.xlsx
//
// Requiere que .env.local tenga NEXT_PUBLIC_SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY (la service role key, NO la anon key —
// este script necesita saltarse RLS para poder escribir).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SUPABASE_URL.includes('placeholder')) {
  console.error(
    'Faltan (o son placeholder) NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local.\n' +
    'Configura tu proyecto real de Supabase antes de importar.'
  );
  process.exit(1);
}

const filePath = process.argv[2] || path.join(__dirname, '..', 'catalogo.xlsx');
if (!fs.existsSync(filePath)) {
  console.error(`No se encontró el archivo: ${filePath}`);
  console.error('Coloca tu Excel en la raíz del proyecto como "catalogo.xlsx", o pásale la ruta como argumento.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const workbook = xlsx.readFile(filePath);

function sheetToRows(sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`No se encontró la hoja "${sheetName}" en el Excel.`);
  return xlsx.utils.sheet_to_json(sheet, { defval: null });
}

async function main() {
  console.log(`Leyendo ${filePath}...`);

  const productRows = sheetToRows('Productos').filter((r) => r.slug);
  const products = productRows.map((r) => ({
    slug: String(r.slug).trim(),
    name: String(r.name ?? '').trim(),
    short_description: String(r.short_description ?? '').trim(),
    category: String(r.category ?? '').trim(),
    purity: String(r.purity ?? '≥99% HPLC').trim(),
    price_mxn: Number(r.price_mxn ?? 0),
    stock: Number(r.stock ?? 0),
    image_url: r.image_url || null,
    coa_url: r.coa_url || null,
    long_description: r.long_description || null,
    research_notes: r.research_notes || null,
  }));

  console.log(`Sincronizando ${products.length} producto(s)...`);
  if (products.length > 0) {
    const { error } = await supabase.from('products').upsert(products, { onConflict: 'slug' });
    if (error) throw error;
  }

  const variantRows = sheetToRows('Variantes').filter((r) => r.product_slug && r.label);

  const { data: allProducts, error: fetchError } = await supabase.from('products').select('id, slug');
  if (fetchError) throw fetchError;
  const slugToId = Object.fromEntries(allProducts.map((p) => [p.slug, p.id]));

  const variants = [];
  for (const r of variantRows) {
    const slug = String(r.product_slug).trim();
    const productId = slugToId[slug];
    if (!productId) {
      console.warn(`  ⚠ Se ignoró la variante "${r.label}" — no existe ningún producto con slug "${slug}".`);
      continue;
    }
    variants.push({
      product_id: productId,
      label: String(r.label).trim(),
      price_mxn: Number(r.price_mxn ?? 0),
      stock: Number(r.stock ?? 0),
      image_url: r.image_url || null,
      sku: r.sku || null,
      sort_order: Number(r.sort_order ?? 0),
    });
  }

  console.log(`Sincronizando ${variants.length} variante(s)...`);
  if (variants.length > 0) {
    const { error } = await supabase
      .from('product_variants')
      .upsert(variants, { onConflict: 'product_id,label' });
    if (error) throw error;
  }

  console.log('✓ Catálogo sincronizado con éxito.');
}

main().catch((err) => {
  console.error('Error al importar el catálogo:', err.message || err);
  process.exit(1);
});
