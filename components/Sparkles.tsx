// Brilhos dourados sutis no fundo (CSS puro, leve para o celular).
export function Sparkles() {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const r = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2);
    return {
      left: `${(r(1) * 100).toFixed(1)}%`,
      top: `${(r(2) * 100).toFixed(1)}%`,
      animationDelay: `${(r(3) * 4).toFixed(2)}s`,
      animationDuration: `${(3 + r(4) * 3).toFixed(2)}s`,
    };
  });
  return (
    <div className="sparkles" aria-hidden>
      {dots.map((s, i) => <i key={i} style={s} />)}
    </div>
  );
}
