import Link from 'next/link';
import { requireParticipant } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { loadCategories } from '@/lib/categories';
import { resultsFor } from '@/lib/results';
import { plural } from '@/lib/format';
import { Brand } from '@/components/Brand';
import { Avatar } from '@/components/Photo';

export const dynamic = 'force-dynamic';

export default async function ResultadosPage() {
  await requireParticipant();
  const s = await getSettings();

  if (!s.ceremony_finished) {
    return (
      <main className="page center">
        <div className="topbar"><Link href="/" className="back">‹ Início</Link></div>
        <Brand />
        <div className="card">
          <h2>Ainda é segredo! 🤫</h2>
          <p className="muted" style={{ margin: 0 }}>Os vencedores aparecem aqui depois da cerimônia.</p>
        </div>
      </main>
    );
  }

  const cats = await loadCategories();
  const results = await resultsFor(cats);

  return (
    <main className="page">
      <div className="topbar"><Link href="/" className="back">‹ Início</Link></div>
      <Brand />
      <h1 className="center" style={{ fontSize: 26, marginBottom: 16 }}>Os vencedores</h1>
      {cats.map((c, i) => {
        const r = results.get(c.id)!;
        const last = i === cats.length - 1;
        return (
          <div key={c.id} className="card" style={last ? { borderColor: 'var(--gold)' } : undefined}>
            <div className="deco" style={{ fontSize: 10, color: 'var(--gold)' }}>
              {last ? '✦ Prêmio principal ✦' : `Categoria ${i + 1}`}
            </div>
            <h3 className="gold-text" style={{ fontSize: 20 }}>{c.name}</h3>
            {r.winners.length === 0 ? (
              <p className="faint" style={{ margin: 0 }}>Ninguém votou nesta categoria.</p>
            ) : (
              <>
                {r.winners.length > 1 && <span className="pill">Empate!</span>}
                <div className="row wrap" style={{ marginTop: 10, gap: 14 }}>
                  {r.winners.map((w) => (
                    <div key={w.id} className="row" style={{ gap: 10 }}>
                      <Avatar src={w.photo} name={w.name} size={56} square={c.kind === 'option'} />
                      <div style={{ fontWeight: 600 }}>{w.name}</div>
                    </div>
                  ))}
                </div>
                <p className="faint" style={{ margin: '10px 0 0' }}>{plural(r.votes, 'voto', 'votos')}{r.winners.length > 1 ? ' cada' : ''}</p>
              </>
            )}
          </div>
        );
      })}
    </main>
  );
}
