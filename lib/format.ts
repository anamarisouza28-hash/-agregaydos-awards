const TZ = 'America/Sao_Paulo';

/** "7/12 às 23:59" no horário de Brasília */
export function formatDeadline(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ, day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${Number(get('day'))}/${Number(get('month'))} às ${get('hour')}:${get('minute')}`;
}

/** "2026-12-08" → "8/12" */
export function formatDay(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return iso || 'a definir';
  return `${Number(m[3])}/${Number(m[2])}`;
}

/** Date → valor para <input type="datetime-local"> no horário de Brasília (UTC-3, sem horário de verão). */
export function toBrasiliaInput(d: Date) {
  return new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 16);
}

export function fromBrasiliaInput(v: string) {
  const d = new Date(`${v}:00-03:00`);
  return isNaN(d.getTime()) ? null : d;
}

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '★';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function imgUrl(id: string | null | undefined) {
  return id ? `/api/img/${id}` : null;
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
