import 'server-only';
import { db } from './db';

export type Settings = {
  voting_deadline: Date;
  ceremony_started: boolean;
  ceremony_step: number;
  ceremony_finished: boolean;
  gift_value: string;
  exchange_date: string;
  draw_done_at: Date | null;
};

export async function getSettings(): Promise<Settings> {
  const sql = await db();
  const [s] = await sql<Settings[]>`
    select voting_deadline, ceremony_started, ceremony_step, ceremony_finished,
           gift_value, exchange_date, draw_done_at
    from awards.settings where id = 1`;
  return s;
}

export function votingOpen(s: Settings, now = Date.now()) {
  return !s.ceremony_started && now < s.voting_deadline.getTime();
}
