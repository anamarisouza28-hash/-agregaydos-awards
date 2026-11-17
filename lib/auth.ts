import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';

export const PARTICIPANT_COOKIE = 'agz_p';
export const ADMIN_COOKIE = 'agz_admin';

export type Me = {
  id: string;
  nickname: string;
  photo_id: string | null;
  wishlist: string;
};

export async function currentParticipant(): Promise<Me | null> {
  const token = (await cookies()).get(PARTICIPANT_COOKIE)?.value;
  if (!token) return null;
  const sql = await db();
  const [p] = await sql<Me[]>`
    select id, nickname, photo_id, wishlist from awards.participants where token = ${token}`;
  return p ?? null;
}

export async function requireParticipant(): Promise<Me> {
  const me = await currentParticipant();
  if (!me) redirect('/');
  return me;
}

function adminSignature() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD não está configurada. Veja o LEIA-ME.md.');
  const secret = process.env.SESSION_SECRET || pw;
  return createHmac('sha256', secret).update(`agregaydos-admin:${pw}`).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkAdminPassword(pw: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return safeEqual(pw, real);
}

export function adminCookieValue() {
  return adminSignature();
}

export async function isAdmin() {
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  return safeEqual(v, adminSignature());
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

/** Para server actions: lança erro em vez de redirecionar. */
export async function assertAdmin() {
  if (!(await isAdmin())) throw new Error('Acesso negado');
}
