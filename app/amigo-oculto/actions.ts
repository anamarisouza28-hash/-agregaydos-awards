'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { currentParticipant } from '@/lib/auth';
import { imgUrl } from '@/lib/format';

export type Drawn = { nickname: string; photo: string | null; wishlist: string };

/** Revela APENAS o amigo oculto de quem está logado. */
export async function revealMine(): Promise<Drawn | null> {
  const me = await currentParticipant();
  if (!me) return null;
  const sql = await db();
  const [r] = await sql<{ nickname: string; photo_id: string | null; wishlist: string }[]>`
    update awards.assignments a
       set revealed_at = coalesce(a.revealed_at, now())
      from awards.participants p
     where a.giver_id = ${me.id} and p.id = a.receiver_id
    returning p.nickname, p.photo_id, p.wishlist`;
  if (!r) return null;
  revalidatePath('/amigo-oculto');
  return { nickname: r.nickname, photo: imgUrl(r.photo_id), wishlist: r.wishlist };
}

export async function saveWishlist(text: string): Promise<{ ok: boolean }> {
  const me = await currentParticipant();
  if (!me) return { ok: false };
  const sql = await db();
  await sql`update awards.participants set wishlist = ${text.slice(0, 2000)} where id = ${me.id}`;
  revalidatePath('/amigo-oculto');
  return { ok: true };
}
