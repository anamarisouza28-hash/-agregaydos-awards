import Link from 'next/link';
import { currentParticipant } from '@/lib/auth';
import { getSettings, votingOpen } from '@/lib/settings';
import { formatDay, formatDeadline, imgUrl } from '@/lib/format';
import { Brand } from '@/components/Brand';
import { Trophy } from '@/components/Trophy';
import { Avatar } from '@/components/Photo';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const me = await currentParticipant();
  const { link } = await searchParams;

  if (!me) {
    return (
      <main className="page center" style={{ paddingTop: '12vh' }}>
        <div className="fade-up">
          <Trophy size={84} className="shimmer" />
        </div>
        <Brand />
        <div className="divider">✦</div>
        <p className="muted" style={{ fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: 19 }}>
          Bem-vinda, bem-vindo, bem-vinde ao tapete vermelho.
        </p>
        <div className="card" style={{ marginTop: 24 }}>
          {link === 'invalido' ? (
            <p className="notice warn" style={{ margin: 0 }}>
              Esse link não funciona mais. Peça o seu link novo para a Mari.
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              Este evento é <strong className="gold-text">só para convidados</strong>.<br />
              Abra o link pessoal que você recebeu da Mari para entrar.
            </p>
          )}
        </div>
      </main>
    );
  }

  const s = await getSettings();
  const open = votingOpen(s);

  return (
    <main className="page">
      <Brand />
      <section className="center fade-up" style={{ margin: '10px 0 22px' }}>
        <Avatar src={imgUrl(me.photo_id)} name={me.nickname} size={96} style={{ margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: 34 }}>
          Olá, <span className="gold-text">{me.nickname}</span>!
        </h1>
        <p className="muted" style={{ margin: '6px 0 0' }}>Seu lugar no tapete vermelho está garantido.</p>
      </section>

      <div className="stack">
        <Link href="/votar" className="big-btn fade-up">
          <span className="icon"><Trophy size={30} /></span>
          <span>
            <div className="label">Votar no Awards</div>
            <div className="sub">{open ? 'Vote em cada categoria' : s.ceremony_finished ? 'Veja os vencedores' : 'Votação encerrada'}</div>
          </span>
          <span className="chev">›</span>
        </Link>
        <Link href="/amigo-oculto" className="big-btn alt fade-up">
          <span className="icon" style={{ fontSize: 26 }}>🎁</span>
          <span>
            <div className="label">Meu Amigo Oculto</div>
            <div className="sub">{s.draw_done_at ? 'O sorteio já aconteceu!' : 'Sorteio em breve'}</div>
          </span>
          <span className="chev">›</span>
        </Link>
        {s.ceremony_finished && (
          <Link href="/resultados" className="btn gold block">🏆 Ver os vencedores</Link>
        )}
      </div>

      <div className="card center" style={{ marginTop: 22 }}>
        <div className="deco small" style={{ color: 'var(--gold)' }}>Anote na agenda</div>
        <div className="row" style={{ justifyContent: 'center', gap: 24, marginTop: 10, flexWrap: 'wrap' }}>
          <div>
            <div className="faint">Votação {open ? 'até' : 'encerrou em'}</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 700 }}>{formatDeadline(s.voting_deadline)}</div>
          </div>
          <div>
            <div className="faint">Festa e troca de presentes</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 700 }}>{formatDay(s.exchange_date)}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
