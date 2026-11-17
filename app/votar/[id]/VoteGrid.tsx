'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/Photo';
import { castVote } from '../actions';

type N = { id: string; name: string; photo: string | null };

export function VoteGrid({
  categoryId, nominees, initial, open, round, nextHref, nextLabel,
}: {
  categoryId: string; nominees: N[]; initial: string | null; open: boolean; round: boolean;
  nextHref: string; nextLabel: string;
}) {
  const [selected, setSelected] = useState<string | null>(initial);
  const [saved, setSaved] = useState<string | null>(initial);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  function vote(id: string) {
    if (!open || id === selected) return;
    const before = selected;
    setSelected(id);
    setError('');
    start(async () => {
      const r = await castVote(categoryId, id).catch(() => ({ ok: false, error: 'Sem conexão. Tente de novo.' }));
      if (r.ok) setSaved(id);
      else {
        setSelected(before);
        setError(r.error ?? 'Não deu certo. Tente de novo.');
      }
    });
  }

  return (
    <>
      <div className="nominee-grid">
        {nominees.map((n) => {
          const isSel = selected === n.id;
          return (
            <button
              key={n.id}
              type="button"
              className={`nominee ${isSel ? 'selected' : ''}`}
              onClick={() => vote(n.id)}
              disabled={!open}
              aria-pressed={isSel}
            >
              {isSel && <span className="tick">✓</span>}
              <Avatar src={n.photo} name={n.name} size={round ? 92 : 104} square={!round} />
              <span className="nname">{n.name}</span>
            </button>
          );
        })}
      </div>
      {nominees.length === 0 && <p className="faint center">Nenhum indicado ainda.</p>}

      <div className="sticky-bottom">
        {error && <p className="notice danger" style={{ margin: '0 0 10px' }}>{error}</p>}
        <p className="center small" style={{ margin: '0 0 10px', minHeight: 21, color: 'var(--gold-2)' }}>
          {pending ? 'Salvando seu voto…' : saved && open ? 'Voto salvo ✓' : ''}
        </p>
        <Link href={nextHref} className={`btn block ${saved || !open ? 'gold' : ''}`}>{nextLabel}</Link>
      </div>
    </>
  );
}
