'use server';
import { randomInt } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { ADMIN_COOKIE, adminCookieValue, assertAdmin, checkAdminPassword } from '@/lib/auth';
import { getSettings, votingOpen } from '@/lib/settings';
import { fromBrasiliaInput } from '@/lib/format';
import { newToken } from '@/lib/tokens';

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const done = () => revalidatePath('/', 'layout');

/* ---------------- Login ---------------- */

export async function login(_prev: string | null, fd: FormData): Promise<string | null> {
  if (!checkAdminPassword(String(fd.get('password') ?? ''))) {
    await new Promise((r) => setTimeout(r, 800));
    return 'Senha incorreta.';
  }
  (await cookies()).set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

/* ---------------- Configurações ---------------- */

export async function saveVotingDeadline(fd: FormData) {
  await assertAdmin();
  const d = fromBrasiliaInput(str(fd, 'deadline'));
  if (!d) return;
  const sql = await db();
  await sql`update awards.settings set voting_deadline = ${d} where id = 1 and not ceremony_started`;
  done();
}

export async function saveGiftSettings(fd: FormData) {
  await assertAdmin();
  const sql = await db();
  await sql`update awards.settings
            set gift_value = ${str(fd, 'gift_value').slice(0, 60)},
                exchange_date = ${str(fd, 'exchange_date')}
            where id = 1`;
  done();
}

export async function closeVotingNow() {
  await assertAdmin();
  const sql = await db();
  await sql`update awards.settings set voting_deadline = now() where id = 1 and voting_deadline > now()`;
  done();
}

/* ---------------- Cerimônia ---------------- */

export async function startCeremony() {
  await assertAdmin();
  const s = await getSettings();
  if (votingOpen(s)) throw new Error('Feche a votação antes de começar a cerimônia.');
  const sql = await db();
  if (!s.ceremony_started) {
    await sql`update awards.settings set ceremony_started = true, ceremony_step = 0 where id = 1`;
  }
  done();
  redirect('/admin/cerimonia');
}

export async function restartCeremony() {
  await assertAdmin();
  const sql = await db();
  await sql`update awards.settings set ceremony_step = 0 where id = 1 and ceremony_started`;
  done();
  redirect('/admin/cerimonia');
}

/* ---------------- Amigo oculto ---------------- */

function derangement(ids: string[]) {
  if (ids.length < 2) throw new Error('São necessárias pelo menos 2 pessoas.');
  for (;;) {
    const p = [...ids];
    for (let i = p.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    if (p.every((x, i) => x !== ids[i])) return p;
  }
}

async function doDraw() {
  const sql = await db();
  await sql.begin(async (tx) => {
    const people = await tx<{ id: string }[]>`select id from awards.participants order by position, created_at`;
    const ids = people.map((p) => p.id);
    const receivers = derangement(ids);
    await tx`delete from awards.assignments`;
    for (let i = 0; i < ids.length; i++) {
      await tx`insert into awards.assignments (giver_id, receiver_id) values (${ids[i]}, ${receivers[i]})`;
    }
    await tx`update awards.settings set draw_done_at = now() where id = 1`;
  });
  done();
}

export async function drawSecretSanta() {
  await assertAdmin();
  const s = await getSettings();
  if (s.draw_done_at) return; // use "Refazer sorteio"
  await doDraw();
}

export async function redrawSecretSanta() {
  await assertAdmin();
  await doDraw();
}

/* ---------------- Participantes ---------------- */

export async function addParticipant(fd: FormData) {
  await assertAdmin();
  const nickname = str(fd, 'nickname').slice(0, 40);
  if (!nickname) return;
  const sql = await db();
  await sql`insert into awards.participants (nickname, token, position)
            values (${nickname}, ${newToken()},
                    (select coalesce(max(position), -1) + 1 from awards.participants))`;
  done();
}

export async function renameParticipant(fd: FormData) {
  await assertAdmin();
  const nickname = str(fd, 'nickname').slice(0, 40);
  if (!nickname) return;
  const sql = await db();
  await sql`update awards.participants set nickname = ${nickname} where id = ${str(fd, 'id')}`;
  done();
}

export async function regenerateLink(fd: FormData) {
  await assertAdmin();
  const sql = await db();
  await sql`update awards.participants set token = ${newToken()} where id = ${str(fd, 'id')}`;
  done();
}

export async function removeParticipant(fd: FormData) {
  await assertAdmin();
  const id = str(fd, 'id');
  const sql = await db();
  await sql.begin(async (tx) => {
    // quem votou nessa pessoa precisa votar de novo naquela categoria
    await tx`
      insert into awards.vote_resets (voter_id, category_id)
      select v.voter_id, v.category_id from awards.votes v
        join awards.nominees n on n.id = v.nominee_id
       where n.participant_id = ${id} and v.voter_id <> ${id}
      on conflict do nothing`;
    const [p] = await tx`delete from awards.participants where id = ${id} returning photo_id`;
    if (p?.photo_id) await tx`delete from awards.images where id = ${p.photo_id}`;
  });
  done();
}

/* ---------------- Categorias ---------------- */

export async function addCategory(fd: FormData) {
  await assertAdmin();
  const name = str(fd, 'name').slice(0, 80);
  const kind = str(fd, 'kind') === 'option' ? 'option' : 'person';
  if (!name) return;
  const sql = await db();
  // novas categorias entram antes da última (o prêmio principal fica sempre por último)
  const [c] = await sql.begin(async (tx) => {
    const [{ max }] = await tx`select coalesce(max(position), -1) as max from awards.categories`;
    await tx`update awards.categories set position = position + 1 where position = ${max}`;
    return tx`insert into awards.categories (name, subtitle, kind, position)
              values (${name}, ${str(fd, 'subtitle').slice(0, 120)}, ${kind}, ${Math.max(0, Number(max))})
              returning id`;
  });
  done();
  redirect(`/admin/categorias/${c.id}`);
}

export async function updateCategory(fd: FormData) {
  await assertAdmin();
  const id = str(fd, 'id');
  const name = str(fd, 'name').slice(0, 80);
  if (!name) return;
  const sql = await db();
  await sql`update awards.categories set name = ${name}, subtitle = ${str(fd, 'subtitle').slice(0, 120)} where id = ${id}`;
  const kind = str(fd, 'kind');
  if (kind === 'person' || kind === 'option') {
    // só troca o tipo se ainda não houver indicados
    await sql`update awards.categories set kind = ${kind}
              where id = ${id} and not exists (select 1 from awards.nominees where category_id = ${id})`;
  }
  done();
}

async function normalize(table: 'categories' | 'nominees', categoryId?: string) {
  const sql = await db();
  if (table === 'categories') {
    await sql`update awards.categories c set position = r.rn
              from (select id, row_number() over (order by position, created_at) - 1 as rn from awards.categories) r
              where r.id = c.id`;
  } else {
    await sql`update awards.nominees n set position = r.rn
              from (select id, row_number() over (order by position, created_at) - 1 as rn
                    from awards.nominees where category_id = ${categoryId!}) r
              where r.id = n.id`;
  }
}

export async function moveCategory(fd: FormData) {
  await assertAdmin();
  const id = str(fd, 'id');
  const dir = str(fd, 'dir') === 'up' ? -1 : 1;
  await normalize('categories');
  const sql = await db();
  await sql.begin(async (tx) => {
    const [me] = await tx`select position from awards.categories where id = ${id}`;
    if (!me) return;
    const [other] = await tx`select id from awards.categories where position = ${me.position + dir}`;
    if (!other) return;
    await tx`update awards.categories set position = ${me.position} where id = ${other.id}`;
    await tx`update awards.categories set position = ${me.position + dir} where id = ${id}`;
  });
  done();
}

export async function removeCategory(fd: FormData) {
  await assertAdmin();
  const id = str(fd, 'id');
  const sql = await db();
  await sql.begin(async (tx) => {
    const photos = await tx<{ photo_id: string }[]>`
      select photo_id from awards.nominees where category_id = ${id} and photo_id is not null
      union all
      select photo_id from awards.categories where id = ${id} and photo_id is not null`;
    await tx`delete from awards.categories where id = ${id}`;
    if (photos.length) await tx`delete from awards.images where id in ${tx(photos.map((p) => p.photo_id))}`;
  });
  done();
  redirect('/admin/categorias');
}

/* ---------------- Indicados ---------------- */

export async function addNominee(fd: FormData) {
  await assertAdmin();
  const categoryId = str(fd, 'category_id');
  const sql = await db();
  const [cat] = await sql`select kind from awards.categories where id = ${categoryId}`;
  if (!cat) return;
  const [{ next }] = await sql`select coalesce(max(position), -1) + 1 as next from awards.nominees where category_id = ${categoryId}`;
  if (cat.kind === 'person') {
    const pid = str(fd, 'participant_id');
    if (pid === 'all') {
      await sql`insert into awards.nominees (category_id, participant_id, position)
                select ${categoryId}, p.id, ${next} + row_number() over (order by p.position, p.created_at)
                  from awards.participants p
                 where not exists (select 1 from awards.nominees n where n.category_id = ${categoryId} and n.participant_id = p.id)`;
    } else if (pid) {
      await sql`insert into awards.nominees (category_id, participant_id, position)
                values (${categoryId}, ${pid}, ${next}) on conflict do nothing`;
    }
  } else {
    const label = str(fd, 'label').slice(0, 80);
    if (!label) return;
    await sql`insert into awards.nominees (category_id, label, position) values (${categoryId}, ${label}, ${next})`;
  }
  done();
}

export async function renameNominee(fd: FormData) {
  await assertAdmin();
  const label = str(fd, 'label').slice(0, 80);
  if (!label) return;
  const sql = await db();
  await sql`update awards.nominees set label = ${label} where id = ${str(fd, 'id')} and participant_id is null`;
  done();
}

export async function moveNominee(fd: FormData) {
  await assertAdmin();
  const id = str(fd, 'id');
  const dir = str(fd, 'dir') === 'up' ? -1 : 1;
  const sql = await db();
  const [n] = await sql`select category_id from awards.nominees where id = ${id}`;
  if (!n) return;
  await normalize('nominees', n.category_id);
  await sql.begin(async (tx) => {
    const [me] = await tx`select position from awards.nominees where id = ${id}`;
    const [other] = await tx`select id from awards.nominees where category_id = ${n.category_id} and position = ${me.position + dir}`;
    if (!other) return;
    await tx`update awards.nominees set position = ${me.position} where id = ${other.id}`;
    await tx`update awards.nominees set position = ${me.position + dir} where id = ${id}`;
  });
  done();
}

export async function removeNominee(fd: FormData) {
  await assertAdmin();
  const id = str(fd, 'id');
  const sql = await db();
  await sql.begin(async (tx) => {
    // os votos nesse indicado são descartados e quem votou é avisado para votar de novo
    await tx`insert into awards.vote_resets (voter_id, category_id)
             select voter_id, category_id from awards.votes where nominee_id = ${id}
             on conflict do nothing`;
    const [n] = await tx`delete from awards.nominees where id = ${id} returning photo_id`;
    if (n?.photo_id) await tx`delete from awards.images where id = ${n.photo_id}`;
  });
  done();
}
