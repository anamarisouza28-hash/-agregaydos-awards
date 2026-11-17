export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? 'small' : ''}`}>
      {!small && <div className="eyebrow deco">✦ Noite de gala ✦</div>}
      <div className="title gold-text">Agregaydos Awards</div>
      {!small && <div className="year">2026</div>}
    </div>
  );
}
