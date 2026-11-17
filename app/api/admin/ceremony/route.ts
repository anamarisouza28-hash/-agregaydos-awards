import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { ceremonyState, lastStep } from '@/lib/results';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };

export async function GET() {
  if (!(await isAdmin())) return new Response('Acesso negado', { status: 401 });
  const s = await getSettings();
  if (!s.ceremony_started) return Response.json({ started: false }, { headers: noStore });
  return Response.json({ started: true, ...(await ceremonyState()) }, { headers: noStore });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return new Response('Acesso negado', { status: 401 });
  const s = await getSettings();
  if (!s.ceremony_started) return new Response('A cerimônia não começou', { status: 409 });
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  const sql = await db();
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from awards.categories`;
  const max = lastStep(n);
  const cur = Math.min(Math.max(s.ceremony_step, 0), max);
  const next = action === 'next' ? Math.min(cur + 1, max) : action === 'prev' ? Math.max(cur - 1, 0) : cur;
  await sql`update awards.settings
            set ceremony_step = ${next},
                ceremony_finished = ceremony_finished or ${next >= max}
            where id = 1`;
  return Response.json({ started: true, ...(await ceremonyState()) }, { headers: noStore });
}
