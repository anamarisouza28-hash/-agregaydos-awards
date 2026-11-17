import 'server-only';
import { db } from './db';
import { getSettings } from './settings';
import { loadCategories, type CategoryView, type NomineeView } from './categories';

/*
 * ÚNICO lugar do código que conta votos.
 * Ele se recusa a rodar antes da cerimônia começar, então nenhuma tela
 * (nem o admin) consegue receber contagens antes da hora.
 */

export type Winner = NomineeView & { votes: number };

export type CategoryResult = {
  winners: Winner[]; // vazio = ninguém votou
  votes: number; // votos de cada vencedor
};

async function countVotes(categoryIds: string[]) {
  const s = await getSettings();
  if (!s.ceremony_started) {
    throw new Error('Os resultados só existem depois que a cerimônia começa.');
  }
  if (categoryIds.length === 0) return new Map<string, number>();
  const sql = await db();
  const rows = await sql<{ nominee_id: string; n: number }[]>`
    select nominee_id, count(*)::int as n
    from awards.votes
    where category_id in ${sql(categoryIds)}
    group by nominee_id`;
  return new Map(rows.map((r) => [r.nominee_id, r.n]));
}

function pickWinners(cat: CategoryView, counts: Map<string, number>): CategoryResult {
  let max = 0;
  for (const n of cat.nominees) max = Math.max(max, counts.get(n.id) ?? 0);
  if (max === 0) return { winners: [], votes: 0 };
  const winners = cat.nominees
    .filter((n) => (counts.get(n.id) ?? 0) === max)
    .map((n) => ({ ...n, votes: max }));
  return { winners, votes: max };
}

/** Resultados apenas das categorias pedidas. */
export async function resultsFor(cats: CategoryView[]) {
  const counts = await countVotes(cats.map((c) => c.id));
  const out = new Map<string, CategoryResult>();
  for (const c of cats) out.set(c.id, pickWinners(c, counts));
  return out;
}

/* ---------- Roteiro da cerimônia ----------
 * passo 0           → abertura
 * para cada categoria i (0..n-1):
 *   1 + 3i          → capa da categoria
 *   2 + 3i          → indicados
 *   3 + 3i          → vencedor(es)
 * 1 + 3n            → encerramento com todos os vencedores
 */
export type Stage =
  | { type: 'intro' }
  | { type: 'cover' | 'nominees' | 'winner'; index: number }
  | { type: 'final' };

export function lastStep(n: number) {
  return 1 + 3 * n;
}

export function stageOf(step: number, n: number): Stage {
  if (step <= 0) return { type: 'intro' };
  if (step >= lastStep(n)) return { type: 'final' };
  const i = Math.floor((step - 1) / 3);
  const k = (step - 1) % 3;
  return { type: k === 0 ? 'cover' : k === 1 ? 'nominees' : 'winner', index: i };
}

export type CeremonyCategory = {
  id: string;
  name: string;
  subtitle: string;
  photo: string | null;
  nominees: NomineeView[];
  result: CategoryResult | null; // null = ainda não revelado (não enviado ao navegador)
};

export type CeremonyState = {
  step: number;
  lastStep: number;
  stage: Stage;
  categories: CeremonyCategory[];
};

/** Estado da cerimônia: só inclui o resultado das categorias já reveladas. */
export async function ceremonyState(): Promise<CeremonyState> {
  const s = await getSettings();
  if (!s.ceremony_started) throw new Error('A cerimônia ainda não começou.');
  const cats = await loadCategories();
  const n = cats.length;
  const step = Math.min(Math.max(s.ceremony_step, 0), lastStep(n));
  const revealed = cats.filter((_, i) => step >= 3 + 3 * i);
  const results = await resultsFor(revealed);
  return {
    step,
    lastStep: lastStep(n),
    stage: stageOf(step, n),
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: c.subtitle,
      photo: c.photo,
      nominees: c.nominees,
      result: results.get(c.id) ?? null,
    })),
  };
}
