// Troféu dourado (desenho próprio, em SVG).
export function Trophy({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 80 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b8892b" />
          <stop offset="0.35" stopColor="#f3d98a" />
          <stop offset="0.55" stopColor="#d4af37" />
          <stop offset="0.75" stopColor="#fff1c1" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>
      <g fill="url(#tg)">
        <path d="M40 4 l3.2 6.6 7.2 1 -5.2 5 1.2 7.2 -6.4 -3.4 -6.4 3.4 1.2 -7.2 -5.2 -5 7.2 -1z" />
        <path d="M18 28 h44 v8 c0 14 -9 24 -22 25 c-13 -1 -22 -11 -22 -25z" />
        <path d="M18 31 h-8 c0 10 5 16 12 18 l1 -5 c-4 -1 -7 -5 -7 -9 h3z" />
        <path d="M62 31 h8 c0 10 -5 16 -12 18 l-1 -5 c4 -1 7 -5 7 -9 h-3z" />
        <rect x="36" y="60" width="8" height="14" rx="2" />
        <path d="M28 74 h24 l3 8 h-30z" />
        <rect x="20" y="82" width="40" height="10" rx="2" />
      </g>
      <rect x="27" y="85" width="26" height="4" rx="1" fill="#5c3d0c" opacity="0.5" />
    </svg>
  );
}
