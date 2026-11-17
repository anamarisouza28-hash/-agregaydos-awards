// Estrutura do banco. Tudo fica no schema "awards" (fora do schema "public"),
// assim a API pública automática do Supabase não enxerga nenhuma tabela.
// Além disso, RLS fica ligado sem nenhuma política: só o servidor do site
// (que conecta como dono das tabelas) consegue ler e escrever.
export const SCHEMA_SQL = `
create schema if not exists awards;

create table if not exists awards.meta (
  key text primary key,
  value text not null
);

create table if not exists awards.images (
  id uuid primary key default gen_random_uuid(),
  mime text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists awards.participants (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  photo_id uuid references awards.images(id) on delete set null,
  token text not null unique,
  wishlist text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists awards.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text not null default '',
  kind text not null check (kind in ('person', 'option')),
  photo_id uuid references awards.images(id) on delete set null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists awards.nominees (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references awards.categories(id) on delete cascade,
  participant_id uuid references awards.participants(id) on delete cascade,
  label text not null default '',
  photo_id uuid references awards.images(id) on delete set null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists nominees_unique_person
  on awards.nominees(category_id, participant_id) where participant_id is not null;

create table if not exists awards.votes (
  voter_id uuid not null references awards.participants(id) on delete cascade,
  category_id uuid not null references awards.categories(id) on delete cascade,
  nominee_id uuid not null references awards.nominees(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (voter_id, category_id)
);

-- Quando um indicado com votos é removido, o voto some e a pessoa
-- recebe um aviso para votar de novo naquela categoria.
create table if not exists awards.vote_resets (
  voter_id uuid not null references awards.participants(id) on delete cascade,
  category_id uuid not null references awards.categories(id) on delete cascade,
  primary key (voter_id, category_id)
);

create table if not exists awards.settings (
  id int primary key default 1 check (id = 1),
  voting_deadline timestamptz not null,
  ceremony_started boolean not null default false,
  ceremony_step int not null default 0,
  ceremony_finished boolean not null default false,
  gift_value text not null default '',
  exchange_date text not null default '2026-12-08',
  draw_done_at timestamptz
);

create table if not exists awards.assignments (
  giver_id uuid primary key references awards.participants(id) on delete cascade,
  receiver_id uuid not null references awards.participants(id) on delete cascade,
  revealed_at timestamptz
);

alter table awards.meta enable row level security;
alter table awards.images enable row level security;
alter table awards.participants enable row level security;
alter table awards.categories enable row level security;
alter table awards.nominees enable row level security;
alter table awards.votes enable row level security;
alter table awards.vote_resets enable row level security;
alter table awards.settings enable row level security;
alter table awards.assignments enable row level security;
`;
