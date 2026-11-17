'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { currentParticipant } from '@/lib/auth';
import { getSettings, votingOpen } from '@/lib/settings';

export async function castVote(categoryId: string, nomineeId: string): Promise<{ ok: boolean; error?: string }> {
  const me = await currentParticipant();
  if (!me) return { ok: false, error: 'Abra o seu link pessoal para votar.' };
  const s = await getSettings();
  if (!votingOpen(s)) return { ok: false, error: 'A votação está encerrada.' };

  const sql = await db();
  const [n] = await sql`
    select 1 from awards.nominees where id = ${nomineeId} and category_id = ${categoryId}`;
  if (!n) return { ok: false, error: 'Esse indicado não existe mais. Atualize a página.' };

  await sql`
    insert into awards.votes (voter_id, category_id, nominee_id)
    values (${me.id}, ${categoryId}, ${nomineeId})
    on conflict (voter_id, category_id)
    do update set nominee_id = excluded.nominee_id, updated_at = now()`;
  await sql`delete from awards.vote_resets where voter_id = ${me.id} and category_id = ${categoryId}`;
  revalidatePath('/votar');
  return { ok: true };
}
