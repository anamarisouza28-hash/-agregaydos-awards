import Link from 'next/link';
import { requireParticipant } from '@/lib/auth';
import { getSettings, votingOpen } from '@/lib/settings';
import { loadCategories } from '@/lib/categories';
import { formatDeadline } from '@/lib/format';
import { Brand } from '@/components/Brand';
import { Cover } from '@/components/Photo';
import { myVotes } from './data';

export const dynamic = 'force-dynamic';

export default async function VotarPage() {
  const me = await requireParticipant();
  const [s, cats, mine] = await Promise.all([getSettings(), loadCategories(), myVotes(me.id)]);
  const open = votingOpen(s);
  const done = cats.filter((c) => mine.votes.has(c.id)).length;
  const pct = cats.length ? Math.round((done / cats.length) * 100) : 0;
  const firstPending = cats.find((c) => !mine.votes.has(c.id));

  return (
    <main className="page">
      <div className="topbar"><Link href="/" className="back">‹ Início</Link></div>
      <Brand small />

      <div className="card" style={{ marginTop: 10 }}>
        <div className="row">
          <div>
            <div className="faint">Olá, {me.nickname}</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 700 }}>
              {done === cats.length && cats.length > 0 ? 'Você votou em tudo! ✨' : `Você votou em ${done} de ${cats.length}`}
            </div>
          </div>
          <div className="spacer" />
          <div className="gold-text" style={{ fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 800 }}>{pct}%</div>
        </div>
        <div className="progress" style={{ marginTop: 12 }}><div style={{ width: `${pct}%` }} /></div>
        <p className="faint" style={{ margin: '10px 0 0' }}>
          {open
            ? <>Voto secreto. Dá para mudar até <strong>{formatDeadline(s.voting_deadline)}</strong>.</>
            : <>A votação foi encerrada. {s.ceremony_finished ? '' : 'Os resultados saem na cerimônia!'}</>}
        </p>
        {s.ceremony_finished && (
          <Link href="/resultados" className="btn gold block" style={{ marginTop: 12 }}>🏆 Ver os vencedores</Link>
        )}
        {open && firstPending && done > 0 && (
          <Link href={`/votar/${firstPending.id}`} className="btn gold block" style={{ marginTop: 12 }}>
            Continuar votando
          </Link>
        )}
      </div>

      {mine.resets.size > 0 && open && (
        <p className="notice warn" style={{ marginTop: 14 }}>
          Um indicado em que você votou foi retirado. Vote de novo na categoria marcada em laranja.
        </p>
      )}

      <ul className="cat-list" style={{ marginTop: 18 }}>
        {cats.map((c, i) => {
          const votedId = mine.votes.get(c.id);
          const voted = c.nominees.find((n) => n.id === votedId);
          const reset = mine.resets.has(c.id) && !voted;
          const last = i === cats.length - 1;
          return (
            <li key={c.id}>
              <Link href={`/votar/${c.id}`} className={`cat-item ${voted ? 'done' : ''} ${reset ? 'reset' : ''}`}>
                <div className="thumb"><Cover src={c.photo} name={c.name} /></div>
                <div style={{ minWidth: 0 }}>
                  {last && <div className="deco" style={{ fontSize: 10, color: 'var(--gold)' }}>Prêmio principal</div>}
                  <div className="name">{c.name}</div>
                  <div className="status">
                    {voted ? (
                      <span className="muted">Seu voto: <strong style={{ color: 'var(--gold-2)' }}>{voted.name}</strong></span>
                    ) : reset ? (
                      <span style={{ color: '#ffd3a1' }}>Vote de novo</span>
                    ) : (
                      <span className="faint">{open ? 'Ainda não votou' : 'Sem voto'}</span>
                    )}
                  </div>
                </div>
                <span className="check">{voted ? '✓' : ''}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
