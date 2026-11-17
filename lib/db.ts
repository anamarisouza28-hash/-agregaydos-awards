import 'server-only';
import postgres from 'postgres';
import { SCHEMA_SQL } from './schema';
import { seed } from './seed';

declare global {
  // eslint-disable-next-line no-var
  var __agzSql: postgres.Sql | undefined;
  // eslint-disable-next-line no-var
  var __agzReady: Promise<void> | undefined;
}

function makeSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL não está configurada. Veja o arquivo LEIA-ME.md.');
  }
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  return postgres(url, {
    prepare: false, // necessário para o "Transaction pooler" do Supabase
    max: local ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 15,
    ssl: local ? false : 'require',
    onnotice: () => {},
  });
}

async function init(sql: postgres.Sql) {
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(727274)`;
    await tx.unsafe(SCHEMA_SQL).simple();
    const [m] = await tx`select value from awards.meta where key = 'seeded'`;
    if (!m) {
      await seed(tx);
      await tx`insert into awards.meta (key, value) values ('seeded', '1')`;
    }
  });
}

/** Retorna a conexão com o banco, criando as tabelas e o conteúdo inicial na primeira vez. */
export async function db() {
  if (!globalThis.__agzSql) globalThis.__agzSql = makeSql();
  if (!globalThis.__agzReady) {
    globalThis.__agzReady = init(globalThis.__agzSql).catch((e) => {
      globalThis.__agzReady = undefined;
      throw e;
    });
  }
  await globalThis.__agzReady;
  return globalThis.__agzSql;
}
