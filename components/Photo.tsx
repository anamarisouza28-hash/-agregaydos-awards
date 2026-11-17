import { initials } from '@/lib/format';
import { Trophy } from './Trophy';

/** Foto redonda (ou quadrada) com placeholder elegante quando ainda não há foto. */
export function Avatar({
  src, name, size = 72, square = false, className = '', style,
}: {
  src: string | null; name: string; size?: number; square?: boolean; className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`avatar ${square ? 'square' : ''} ${className}`}
      style={size ? { width: size, height: size, ...style } : style}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} loading="lazy" />
      ) : (
        <span className="ini" style={size ? { fontSize: Math.max(12, size * 0.34) } : undefined}>{initials(name)}</span>
      )}
    </div>
  );
}

/** Capa de categoria; sem foto mostra uma cortina de teatro com troféu. */
export function Cover({ src, name, className = '', style }: {
  src: string | null; name: string; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`cover ${className}`} style={style}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} />
      ) : (
        <div className="curtain"><Trophy size={60} /></div>
      )}
    </div>
  );
}
