'use client';
import { useState, useTransition } from 'react';
import { saveWishlist } from './actions';

export function Wishlist({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const dirty = text !== saved;
  return (
    <div>
      <textarea
        className="input"
        value={text}
        maxLength={2000}
        onChange={(e) => setText(e.target.value)}
        placeholder={'Ex.: livro da Taylor Jenkins Reid, perfume, vinho tinto, meia divertida (tam. 38)…'}
      />
      <div className="row" style={{ marginTop: 10 }}>
        <span className="faint">{pending ? 'Salvando…' : dirty ? 'Alterações não salvas' : saved ? 'Salvo ✓' : ''}</span>
        <div className="spacer" />
        <button
          type="button"
          className="btn gold small"
          disabled={!dirty || pending}
          onClick={() => start(async () => {
            const r = await saveWishlist(text);
            if (r.ok) setSaved(text);
          })}
        >
          Salvar lista
        </button>
      </div>
    </div>
  );
}
