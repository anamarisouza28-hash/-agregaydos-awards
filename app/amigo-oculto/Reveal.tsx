'use client';
import { useState } from 'react';
import { Avatar } from '@/components/Photo';
import { Confetti } from '@/components/Confetti';
import { revealMine, type Drawn } from './actions';

export function Reveal({ initial }: { initial: Drawn | null }) {
  const [drawn, setDrawn] = useState<Drawn | null>(initial);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>(initial ? 'open' : 'closed');
  const [burst, setBurst] = useState(0);
  const [error, setError] = useState('');

  async function open() {
    if (phase !== 'closed') return;
    setPhase('opening');
    setError('');
    const started = Date.now();
    const r = await revealMine().catch(() => null);
    if (!r) {
      setPhase('closed');
      setError('Não consegui abrir o envelope. Verifique a internet e tente de novo.');
      return;
    }
    setDrawn(r);
    const wait = Math.max(0, 1600 - (Date.now() - started));
    setTimeout(() => {
      setPhase('open');
      setBurst((b) => b + 1);
    }, wait);
  }

  if (phase === 'open' && drawn) {
    return (
      <>
        <Confetti burst={burst} count={120} />
        <div className="card center reveal-card">
          <div className="deco small" style={{ color: 'var(--gold)' }}>Você tirou</div>
          <Avatar src={drawn.photo} name={drawn.nickname} size={150} style={{ margin: '16px auto 12px', borderWidth: 3 }} />
          <h2 className="gold-text" style={{ fontSize: 38 }}>{drawn.nickname}</h2>
          <p className="faint" style={{ margin: '6px 0 0' }}>🤫 Segredo absoluto até a troca!</p>
          <div style={{ textAlign: 'left', marginTop: 18 }}>
            <h3 style={{ fontSize: 17 }}>Lista de desejos de {drawn.nickname}</h3>
            {drawn.wishlist.trim() ? (
              <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0' }}>{drawn.wishlist}</p>
            ) : (
              <p className="faint" style={{ margin: '6px 0 0' }}>
                {drawn.nickname} ainda não escreveu nada. Volte aqui mais tarde!
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="center">
      <button
        type="button"
        className={`envelope ${phase === 'opening' ? 'opening' : ''}`}
        onClick={open}
        aria-label="Abrir envelope"
      >
        <span className="env-back" />
        <span className="env-letter"><span className="deco">Seu amigo oculto</span></span>
        <span className="env-front" />
        <span className="env-flap" />
        <span className="env-seal">A</span>
      </button>
      <p style={{ marginTop: 18, fontFamily: 'var(--font-title)', fontSize: 20 }}>
        {phase === 'opening' ? 'Abrindo…' : 'Toque no envelope para abrir'}
      </p>
      <p className="faint" style={{ margin: 0 }}>Confira se ninguém está espiando 👀</p>
      {error && <p className="notice danger">{error}</p>}
    </div>
  );
}
