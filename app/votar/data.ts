import 'server-only';
import { db } from '@/lib/db';

/** Só os votos da própria pessoa (nunca os dos outros). */
export async function myVotes(meId: string) {
  const sql = await db();
  const votes = await sql<{ category_id: string; nominee_id: string }[]>`
    select category_id, nominee_id from awards.votes where voter_id = ${meId}`;
  const resets = await sql<{ category_id: string }[]>`
    select category_id from awards.vote_resets where voter_id = ${meId}`;
  return {
    votes: new Map(votes.map((v) => [v.category_id, v.nominee_id])),
    resets: new Set(resets.map((r) => r.category_id)),
  };
}
