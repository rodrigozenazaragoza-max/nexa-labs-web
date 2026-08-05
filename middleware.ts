import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Dos sistemas de sesión separados en el mismo middleware:
// 1. /admin y /api/admin — una sola contraseña compartida (nexa_admin_session),
//    solo para Rod. No tiene nada que ver con Supabase Auth.
// 2. Todo lo demás — refresca la sesión de Supabase Auth de los CLIENTES
//    (login/registro en /login, cuentas en /mi-cuenta) para que no se
//    desloguen solos, y protege /mi-cuenta si no hay sesión.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isProtectedApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (isProtectedPage || isProtectedApi) {
    const session = req.cookies.get('nexa_admin_session')?.value;
    const expected = process.env.ADMIN_SESSION_TOKEN;

    if (!expected || session !== expected) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  return updateSession(req);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|icon.png).*)'],
};
