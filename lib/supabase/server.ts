import { createServerClient } from '@supabase/ssr';
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

export function createServiceRoleClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // El cliente de service role nunca necesita escribir cookies de
          // sesión — ignora cualquier intento.
        },
      },
    }
  );
}
