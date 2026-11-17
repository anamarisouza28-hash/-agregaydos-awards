import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Não encontrada', { status: 404 });
  const sql = await db();
  const [img] = await sql<{ mime: string; data: Buffer }[]>`
    select mime, data from awards.images where id = ${id}`;
  if (!img) return new Response('Não encontrada', { status: 404 });
  // Cada upload gera um id novo, então a imagem pode ficar em cache para sempre.
  return new Response(new Uint8Array(img.data), {
    headers: {
      'Content-Type': img.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
