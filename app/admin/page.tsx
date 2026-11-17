import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSettings, votingOpen } from '@/lib/settings';
import { formatDeadline, toBrasiliaInput } from '@/lib/format';
import { ConfirmButton, SubmitButton } from '@/components/ConfirmButton';
import { AdminShell } from './AdminShell';
import {
  closeVotingNow, drawSecretSanta, redrawSecretSanta, restartCeremony,
  saveGiftSettings, saveVotingDeadline, startCeremony,
} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  await requireAdmin();
  const s = await getSettings();
  const sql = await db();
  const open = votingOpen(s);

  // Apenas QUANTAS categorias cada pessoa já votou — nunca em quem.
  const progress = await sql<{ id: string; nickname: string; n: number }[]>`
    select p.id, p.nickname, count(v.category_id)::int as n
      from awards.participants p
      left join awards.votes v on v.voter_id = p.id
     group by p.id order by p.position, p.created_at`;
  const [{ total: totalCats }] = await sql<{ total: number }[]>`select count(*)::int as total from awards.categories`;
  const complete = progress.filter((p) => totalCats > 0 && p.n >= totalCats);
  const partial = progress.filter((p) => p.n > 0 && p.n < totalCats);
  const none = progress.filter((p) => p.n === 0);

  // Amigo oculto: só contagens, nunca os pares.
  const [draw] = await sql<{ total: number; opened: number; receivers: number }[]>`
    select count(*)::int as total,
           count(revealed_at)::int as opened,
           count(distinct receiver_id)::int as receivers
      from awards.assignments`;
  const people = progress.length;
  const drawBroken = !!s.draw_done_at && (draw.total !== people || draw.receivers !== people);

  return (
    <AdminShell active="/admin">
      {/* ---------------- Votação ---------------- */}
      <section className="card">
        <div className="row">
          <h2 style={{ margin: 0 }}>🏆 Votação</h2>
          <div className="spacer" />
          <span className={`pill ${open ? 'ok' : 'no'}`}>{open ? 'Aberta' : s.ceremony_started ? 'Cerimônia' : 'Fechada'}</span>
        </div>

        <div className="row" style={{ marginTop: 14, alignItems: 'flex-end' }}>
          <div>
            <div className="stat gold-text">{complete.length}<span style={{ fontSize: 20 }}>/{people}</span></div>
            <div className="faint">votaram em todas as {totalCats} categorias</div>
          </div>
        </div>
        <div className="progress" style={{ marginTop: 10 }}>
          <div style={{ width: `${people ? (complete.length / people) * 100 : 0}%` }} />
        </div>

        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--gold-2)' }}>
            Quem ainda falta ({partial.length + none.length})
          </summary>
          <div style={{ marginTop: 8 }}>
            {none.length > 0 && (
              <p className="small" style={{ margin: '6px 0' }}>
                <span className="pill no">Não começou</span>{' '}
                {none.map((p) => p.nickname).join(', ')}
              </p>
            )}
            {partial.map((p) => (
              <p key={p.id} className="small" style={{ margin: '6px 0' }}>
                <span className="pill warn">{p.n}/{totalCats}</span> {p.nickname}
              </p>
            ))}
            {complete.length > 0 && (
              <p className="small" style={{ margin: '6px 0' }}>
                <span className="pill ok">Completo</span> {complete.map((p) => p.nickname).join(', ')}
              </p>
            )}
          </div>
        </details>
        <p className="faint" style={{ margin: '10px 0 0' }}>
          🔒 Os votos são secretos: nem aqui aparecem. Os resultados só são calculados quando a cerimônia começa.
        </p>

        <hr style={{ border: 0, borderTop: '1px solid rgba(212,175,55,.2)', margin: '16px 0' }} />

        {!s.ceremony_started && (
          <form action={saveVotingDeadline} className="stack">
            <label className="field">
              <span>Prazo da votação (horário de Brasília) — atual: {formatDeadline(s.voting_deadline)}</span>
              <input className="input" type="datetime-local" name="deadline" defaultValue={toBrasiliaInput(s.voting_deadline)} required />
            </label>
            <SubmitButton className="btn small">Salvar prazo</SubmitButton>
          </form>
        )}

        <div className="stack" style={{ marginTop: 16 }}>
          {open && (
            <form action={closeVotingNow}>
              <ConfirmButton
                className="btn danger block"
                message={`Fechar a votação agora? ${people - complete.length} pessoa(s) ainda não terminaram. Ninguém mais vai poder votar (você pode reabrir mudando o prazo).`}
              >
                Fechar votação agora
              </ConfirmButton>
            </form>
          )}
          {!s.ceremony_started ? (
            <form action={startCeremony}>
              <ConfirmButton
                className="btn gold block"
                disabled={open}
                message="Começar a cerimônia? A partir de agora os resultados passam a existir e a votação não reabre mais."
              >
                {open ? '🔒 Começar cerimônia (feche a votação antes)' : '🎬 Começar cerimônia'}
              </ConfirmButton>
              {open && <p className="faint" style={{ margin: '6px 0 0' }}>Disponível quando a votação fechar.</p>}
            </form>
          ) : (
            <>
              <Link href="/admin/cerimonia" className="btn gold block">🎬 {s.ceremony_finished ? 'Abrir cerimônia' : 'Continuar cerimônia'}</Link>
              <form action={restartCeremony}>
                <ConfirmButton className="btn small block" message="Voltar a cerimônia para a abertura?">
                  Recomeçar a cerimônia do início
                </ConfirmButton>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ---------------- Amigo oculto ---------------- */}
      <section className="card">
        <div className="row">
          <h2 style={{ margin: 0 }}>🎁 Amigo oculto</h2>
          <div className="spacer" />
          <span className={`pill ${s.draw_done_at ? 'ok' : 'no'}`}>{s.draw_done_at ? 'Sorteado' : 'Não sorteado'}</span>
        </div>

        {s.draw_done_at ? (
          <>
            <div style={{ marginTop: 14 }}>
              <div className="stat gold-text">{draw.opened}<span style={{ fontSize: 20 }}>/{draw.total}</span></div>
              <div className="faint">já abriram o envelope</div>
            </div>
            <p className="faint">🔒 Você também participa, então ninguém (nem o admin) vê quem tirou quem.</p>
            {drawBroken && (
              <p className="notice warn">
                A lista de participantes mudou depois do sorteio. Refaça o sorteio para incluir todo mundo.
              </p>
            )}
            <form action={redrawSecretSanta}>
              <ConfirmButton
                className="btn danger block"
                typeToConfirm="REFAZER"
                message={'ATENÇÃO: refazer o sorteio apaga o resultado de TODO MUNDO. Quem já abriu o envelope vai tirar outra pessoa e precisa ser avisado. Use só se deu algum problema.'}
              >
                Refazer sorteio
              </ConfirmButton>
            </form>
          </>
        ) : (
          <form action={drawSecretSanta} style={{ marginTop: 14 }}>
            <ConfirmButton
              className="btn gold block"
              message={`Sortear o amigo oculto entre os ${people} participantes agora?`}
              pendingText="Sorteando…"
            >
              🎲 Sortear
            </ConfirmButton>
          </form>
        )}

        <hr style={{ border: 0, borderTop: '1px solid rgba(212,175,55,.2)', margin: '16px 0' }} />
        <form action={saveGiftSettings} className="stack">
          <label className="field">
            <span>Valor do presente</span>
            <input className="input" name="gift_value" defaultValue={s.gift_value} placeholder="Ex.: R$ 100" />
          </label>
          <label className="field">
            <span>Data da troca / festa</span>
            <input className="input" type="date" name="exchange_date" defaultValue={s.exchange_date} />
          </label>
          <SubmitButton className="btn small">Salvar</SubmitButton>
        </form>
      </section>
    </AdminShell>
  );
}
