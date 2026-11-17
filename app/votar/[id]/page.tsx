import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireParticipant } from '@/lib/auth';
import { getSettings, votingOpen } from '@/lib/settings';
import { loadCategories } from '@/lib/categories';
import { formatDeadline } from '@/lib/format';
import { Cover } from '@/components/Photo';
import { myVotes } from '../data';
import { VoteGrid } from './VoteGrid';

export const dynamic = 'force-dynamic';

export default async function CategoryVotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireParticipant();
  const [s, cats, mine] = await Promise.all([getSettings(), loadCategories(), myVotes(me.id)]);
  const idx = cats.findIndex((c) => c.id === id);
  if (idx < 0) notFound();
  const cat = cats[idx];
  const prev = cats[idx - 1];
  const next = cats[idx + 1];
  const open = votingOpen(s);
  const done = cats.filter((c) => mine.votes.has(c.id)).length;
  const isLast = idx === cats.length - 1;

  return (
    <main className="page">
      <div className="topbar">
        <Link href="/votar" className="back">‹ Categorias</Link>
        <div className="spacer" />
        <span className="faint">{idx + 1} de {cats.length}</span>
      </div>
      <div className="progress" style={{ marginBottom: 14 }}>
        <div style={{ width: `${cats.length ? (done / cats.length) * 100 : 0}%` }} />
      </div>

      <div className="fade-up" style={{ position: 'relative' }}>
        <Cover src={cat.photo} name={cat.name} />
        <div className="center" style={{ marginTop: 14 }}>
          <div className="deco" style={{ fontSize: 11, color: 'var(--gold)' }}>
            {isLast ? '✦ Prêmio principal ✦' : `Categoria ${idx + 1}`}
          </div>
          <h1 className="gold-text" style={{ fontSize: 30, marginTop: 4 }}>{cat.name}</h1>
          {cat.subtitle && (
            <p className="muted" style={{ margin: '4px 0 0', fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: 17 }}>
              {cat.subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {open ? (
          <p className="faint center" style={{ margin: '0 0 12px' }}>
            Toque para votar. Dá para mudar até {formatDeadline(s.voting_deadline)}.
          </p>
        ) : (
          <p className="notice center" style={{ margin: '0 0 12px' }}>A votação está encerrada.</p>
        )}
        {mine.resets.has(cat.id) && !mine.votes.has(cat.id) && open && (
          <p className="notice warn" style={{ margin: '0 0 12px' }}>
            O indicado em que você tinha votado foi retirado. Escolha de novo, por favor.
          </p>
        )}
        <VoteGrid
          categoryId={cat.id}
          nominees={cat.nominees}
          initial={mine.votes.get(cat.id) ?? null}
          open={open}
          round={cat.kind === 'person'}
          nextHref={next ? `/votar/${next.id}` : '/votar'}
          nextLabel={next ? 'Próxima categoria ›' : 'Ver minhas categorias'}
        />
      </div>

      {prev && (
        <div className="center" style={{ marginTop: 6 }}>
          <Link href={`/votar/${prev.id}`} className="back">‹ Categoria anterior</Link>
        </div>
      )}
    </main>
  );
}
