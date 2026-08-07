import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Cliente de Supabase para Server Components y Route Handlers.
// Usa la anon key por defecto (respeta RLS) — para operaciones que deben
// saltarse RLS (como insertar orders desde el checkout, o el panel admin)
// usa createServiceRoleClient() en su lugar.
//
// Usa getAll/setAll (API recomendada de @supabase/ssr) para que las
// sesiones de auth de clientes (login/registro en /login) se lean y
// refresquen correctamente. El setAll puede fallar si se llama desde un
// Server Component puro (no puede escribir cookies) — se ignora ahí porque
// el middleware ya se encarga de refrescar la sesión en cada request.
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component — el middleware refresca la sesión.
          }
        },
      },
    }
  );
}

// IMPORTANTE — encontrado depurando en vivo: NO uses createServerClient()
// (de @supabase/ssr) aquí, aunque parezca conveniente para reusar el mismo
// patrón de cookies. createServerClient administra una sesión de auth
// basada en cookies, y si el navegador que hace la petición ya tiene una
// sesión iniciada (ej. el cliente logueado probando el checkout), usa el
// token de ESA sesión para el header Authorization en vez de la llave que le
// pasamos — así que aunque le des la service_role key, las consultas se
// siguen evaluando con RLS como el usuario logueado, no como service_role.
// Esto causaba "new row violates row-level security policy" al crear
// pedidos si el cliente tenía sesión iniciada.
//
// Por eso este cliente usa el SDK plano de supabase-js, sin cookies ni
// manejo de sesión — así siempre se autentica con la service_role key,
// sin importar si quien hace la petición tiene sesión iniciada o no.
// Cliente para DATOS PÚBLICOS (catálogo, ajustes del sitio) — sin cookies.
//
// RENDIMIENTO: leer cookies dentro de un Server Component obliga a Next.js a
// renderizar la página de forma dinámica en CADA visita, sin poder cachear
// nada. Como el catálogo y los ajustes son iguales para todos, no hay razón
// para pagar ese costo: este cliente no toca cookies, así que las páginas
// públicas sí pueden servirse desde caché.
//
// Usa la anon key, o sea que RLS se sigue aplicando igual que antes.
export function createPublicClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function createServiceRoleClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
