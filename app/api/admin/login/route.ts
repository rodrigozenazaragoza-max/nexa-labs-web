import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('nexa_admin_session', process.env.ADMIN_SESSION_TOKEN ?? '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
