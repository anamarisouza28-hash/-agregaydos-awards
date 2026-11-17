import 'server-only';
import { db } from './db';
import { imgUrl } from './format';

export type NomineeView = {
  id: string;
  name: string;
  photo: string | null;
  participantId: string | null;
};

export type CategoryView = {
  id: string;
  name: string;
  subtitle: string;
  kind: 'person' | 'option';
  photo: string | null;
  photoId: string | null;
  nominees: NomineeView[];
};

/** Categorias e indicados (sem nenhuma informação de votos). */
export async function loadCategories(): Promise<CategoryView[]> {
  const sql = await db();
  const cats = await sql<{ id: string; name: string; subtitle: string; kind: 'person' | 'option'; photo_id: string | null }[]>`
    select id, name, subtitle, kind, photo_id
    from awards.categories order by position, created_at`;
  const noms = await sql<{
    id: string; category_id: string; participant_id: string | null;
    name: string; photo_id: string | null;
  }[]>`
    select n.id, n.category_id, n.participant_id,
           coalesce(p.nickname, n.label) as name,
           case when n.participant_id is not null then p.photo_id else n.photo_id end as photo_id
    from awards.nominees n
    left join awards.participants p on p.id = n.participant_id
    order by n.position, n.created_at`;
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    subtitle: c.subtitle,
    kind: c.kind,
    photo: imgUrl(c.photo_id),
    photoId: c.photo_id,
    nominees: noms
      .filter((n) => n.category_id === c.id)
      .map((n) => ({ id: n.id, name: n.name, photo: imgUrl(n.photo_id), participantId: n.participant_id })),
  }));
}
