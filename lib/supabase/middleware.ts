import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refresca la sesión de auth del CLIENTE (customer) en cada request — sin
// esto, las cookies de sesión de Supabase Auth expiran y el usuario se
// desloguea solo. Se llama desde middleware.ts. No tiene nada que ver con
// el login del panel /admin, que usa su propia cookie separada
// (nexa_admin_session).
// Detecta si el visitante trae cookie de sesión de Supabase Auth. Las
// cookies de @supabase/ssr se llaman `sb-<project-ref>-auth-token` (y sus
// variantes .0/.1 cuando el token es largo).
function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const needsAuthCheck = pathname.startsWith('/mi-cuenta');

  // RENDIMIENTO — el arreglo más importante del sitio:
  //
  // `supabase.auth.getUser()` hace una LLAMADA DE RED al servidor de auth de
  // Supabase, y antes se ejecutaba en CADA navegación, para todo el mundo,
  // bloqueando el render de la página. Un visitante anónimo —la enorme
  // mayoría del tráfico— pagaba ese viaje de ida y vuelta en cada clic sin
  // tener siquiera una sesión que refrescar.
  //
  // Ahora se omite por completo cuando no hay cookie de sesión y la ruta no
  // es privada. Los usuarios que sí traen sesión mantienen el refresco, y
  // además el cliente de navegador (@supabase/ssr createBrowserClient) ya
  // renueva el token por su cuenta.
  if (!needsAuthCheck && !hasAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protege /mi-cuenta — si no hay sesión, manda a /login.
  if (needsAuthCheck && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
