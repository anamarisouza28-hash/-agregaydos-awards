import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { PARTICIPANT_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Link individual: /p/CODIGO → salva o código no aparelho e entra como a pessoa.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sql = await db();
  const [p] = await sql`select id from awards.participants where token = ${token}`;
  const res = NextResponse.redirect(new URL(p ? '/' : '/?link=invalido', req.url), 303);
  if (p) {
    res.cookies.set(PARTICIPANT_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
