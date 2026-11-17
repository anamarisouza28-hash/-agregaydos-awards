'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CeremonyState, CeremonyCategory } from '@/lib/results';
import { Avatar } from '@/components/Photo';
import { Trophy } from '@/components/Trophy';
import { Confetti } from '@/components/Confetti';

const DRUMROLL_MS = 3200;

export function Ceremony({ initial }: { initial: CeremonyState }) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [drumroll, setDrumroll] = useState(false);
  const [burst, setBurst] = useState(0);
  const [error, setError] = useState('');
  const busyRef = useRef(false);

  const go = useCallback(async (action: 'next' | 'prev') => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    const fromStage = state.stage.type;
    const toWinner = action === 'next' && fromStage === 'nominees';
    if (toWinner) setDrumroll(true);
    const started = Date.now();
    try {
      const res = await fetch('/api/admin/ceremony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      const next = (await res.json()) as CeremonyState;
      if (toWinner) await new Promise((r) => setTimeout(r, Math.max(0, DRUMROLL_MS - (Date.now() - started))));
      setState(next);
      if (action === 'next' && (next.stage.type === 'winner' || next.stage.type === 'final')) {
        setBurst((b) => b + 1);
      }
    } catch {
      setError('Sem conexão. Toque de novo.');
    } finally {
      setDrumroll(false);
      busyRef.current = false;
      setBusy(false);
    }
  }, [state.stage.type]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); go('next'); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go('prev'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const { stage, categories } = state;
  const n = categories.length;
  const cat: CeremonyCategory | null = 'index' in stage ? categories[stage.index] : null;
  const isMain = 'index' in stage && stage.index === n - 1;

  let nextLabel = 'Avançar ›';
  if (stage.type === 'intro') nextLabel = 'Começar ›';
  if (stage.type === 'cover') nextLabel = 'Ver indicados ›';
  if (stage.type === 'winner') nextLabel = 'index' in stage && stage.index === n - 1 ? 'Encerramento ›' : 'Próxima categoria ›';

  return (
    <div className={`ceremony stage-${drumroll ? 'drumroll' : stage.type}`}>
      <div className="spot spot-l" />
      <div className="spot spot-r" />
      {!drumroll && (stage.type === 'winner' || stage.type === 'final') && (
        <Confetti burst={burst} count={220} duration={5500} />
      )}

      <div className="cer-top">
        <Link href="/admin" className="cer-mini">‹ Painel</Link>
        <span className="cer-mini">{state.step} / {state.lastStep}</span>
        <button
          type="button"
          className="cer-mini"
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen?.();
            else document.documentElement.requestFullscreen?.().catch(() => {});
          }}
        >
          ⛶ Tela cheia
        </button>
      </div>

      <div className="cer-body" key={drumroll ? 'drum' : state.step}>
        {drumroll && cat ? (
          <div className="cer-drum">
            <div className="drum-trophy"><Trophy size={120} /></div>
            <div className="cer-eyebrow deco">{cat.name}</div>
            <h1 className="cer-title gold-text">E o vencedor é<span className="dots"><i>.</i><i>.</i><i>.</i></span></h1>
            <div className="drumsticks" aria-hidden>
              {Array.from({ length: 9 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.07}s` }} />)}
            </div>
          </div>
        ) : stage.type === 'intro' ? (
          <div className="cer-center">
            <Trophy size={130} className="shimmer float" />
            <div className="cer-eyebrow deco" style={{ marginTop: 24 }}>✦ Noite de gala ✦</div>
            <h1 className="cer-hero deco gold-text">Agregaydos Awards</h1>
            <div className="cer-year">2026</div>
            <p className="cer-sub">Senhoras, senhores e senhories… a cerimônia vai começar.</p>
          </div>
        ) : stage.type === 'cover' && cat ? (
          <div className="cer-center">
            <div className="cer-eyebrow deco">
              {isMain ? '✦ O grande prêmio da noite ✦' : `Categoria ${stage.index + 1} de ${n}`}
            </div>
            <div className="cer-cover">
              {cat.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.photo} alt={cat.name} />
              ) : (
                <div className="curtain"><Trophy size={90} /></div>
              )}
            </div>
            <h1 className="cer-title gold-text">{cat.name}</h1>
            {cat.subtitle && <p className="cer-sub">{cat.subtitle}</p>}
          </div>
        ) : stage.type === 'nominees' && cat ? (
          <div className="cer-center">
            <div className="cer-eyebrow deco">{cat.name}</div>
            <h1 className="cer-title" style={{ fontSize: 'clamp(26px, 5vw, 56px)' }}>Os indicados são…</h1>
            <div className={`cer-nominees count-${Math.min(cat.nominees.length, 16)}`}>
              {cat.nominees.map((nm, i) => (
                <div key={nm.id} className="cer-nominee" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
                  <Avatar src={nm.photo} name={nm.name} size={0} className="cer-avatar" />
                  <div className="cer-nname">{nm.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : stage.type === 'winner' && cat ? (
          <WinnerView cat={cat} isMain={isMain} />
        ) : stage.type === 'final' ? (
          <FinalView categories={categories} />
        ) : null}
      </div>

      <div className="cer-controls" style={drumroll ? { visibility: 'hidden' } : undefined}>
        <button type="button" className="btn small" onClick={() => go('prev')} disabled={busy || state.step === 0}>
          ‹ Voltar
        </button>
        {stage.type === 'final' ? (
          <Link href="/admin" className="btn gold">Fim ✨ Voltar ao painel</Link>
        ) : stage.type === 'nominees' ? (
          <button type="button" className="btn red cer-cta shimmer" onClick={() => go('next')} disabled={busy}>
            E o vencedor é…
          </button>
        ) : (
          <button type="button" className="btn gold cer-cta" onClick={() => go('next')} disabled={busy}>
            {nextLabel}
          </button>
        )}
      </div>
      {error && <div className="cer-error">{error}</div>}
    </div>
  );
}

function WinnerView({ cat, isMain }: { cat: CeremonyCategory; isMain: boolean }) {
  const r = cat.result;
  if (!r || r.winners.length === 0) {
    return (
      <div className="cer-center">
        <div className="cer-eyebrow deco">{cat.name}</div>
        <h1 className="cer-title">Ninguém votou nesta categoria 🤷</h1>
      </div>
    );
  }
  const tie = r.winners.length > 1;
  return (
    <div className="cer-center">
      <div className="cer-eyebrow deco">{isMain ? '✦ Agregaydo do Ano ✦' : cat.name}</div>
      {tie && <div className="tie-badge">Empate!</div>}
      <div className={`cer-winners ${tie ? 'tie' : ''} n-${Math.min(r.winners.length, 6)}`}>
        {r.winners.map((w) => (
          <div key={w.id} className="cer-winner">
            <div className="halo" />
            <Avatar src={w.photo} name={w.name} size={0} className="cer-win-avatar" />
            <div className="cer-win-name gold-text">{w.name}</div>
          </div>
        ))}
      </div>
      <div className="cer-votes">
        {r.votes} {r.votes === 1 ? 'voto' : 'votos'}{tie ? ' cada' : ''}
      </div>
      {isMain && !tie && <p className="cer-sub" style={{ marginTop: 6 }}>O grande prêmio da noite!</p>}
    </div>
  );
}

function FinalView({ categories }: { categories: CeremonyCategory[] }) {
  return (
    <div className="cer-final">
      <div className="center">
        <Trophy size={44} className="float" />
        <h1 className="cer-title gold-text" style={{ marginTop: 4 }}>Os vencedores de 2026</h1>
        <p className="cer-sub">Obrigada por fazerem parte desta noite ✨</p>
      </div>
      <div className="final-grid">
        {categories.map((c, i) => (
          <div key={c.id} className={`final-item ${i === categories.length - 1 ? 'main' : ''}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="final-cat deco">{c.name}</div>
            <div className="final-winners">
              {c.result && c.result.winners.length > 0 ? (
                c.result.winners.map((w) => (
                  <div key={w.id} className="final-w">
                    <Avatar src={w.photo} name={w.name} size={c === categories[categories.length - 1] ? 64 : 36} />
                    <span>{w.name}</span>
                  </div>
                ))
              ) : (
                <span className="faint">Sem votos</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
