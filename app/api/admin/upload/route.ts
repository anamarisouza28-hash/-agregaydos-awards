import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const TABLE = {
  participant: 'participants',
  category: 'categories',
  nominee: 'nominees',
} as const;

export async function POST(req: Request) {
  if (!(await isAdmin())) return new Response('Acesso negado', { status: 401 });
  const fd = await req.formData();
  const target = String(fd.get('target')) as keyof typeof TABLE;
  const id = String(fd.get('id') ?? '');
  const table = TABLE[target];
  if (!table || !/^[0-9a-f-]{36}$/i.test(id)) return new Response('Pedido inválido', { status: 400 });

  const sql = await db();
  const [row] = await sql`select photo_id from ${sql('awards.' + table)} where id = ${id}`;
  if (!row) return new Response('Item não encontrado', { status: 404 });

  let newId: string | null = null;
  if (!fd.get('remove')) {
    const file = fd.get('file');
    if (!(file instanceof Blob)) return new Response('Envie uma foto', { status: 400 });
    if (file.size > 4 * 1024 * 1024) return new Response('Foto grande demais', { status: 413 });
    const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const buf = Buffer.from(await file.arrayBuffer());
    const [img] = await sql`insert into awards.images (mime, data) values (${mime}, ${buf}) returning id`;
    newId = img.id;
  }
  await sql`update ${sql('awards.' + table)} set photo_id = ${newId} where id = ${id}`;
  if (row.photo_id) await sql`delete from awards.images where id = ${row.photo_id}`;
  revalidatePath('/', 'layout');
  return Response.json({ ok: true, photoId: newId });
}
