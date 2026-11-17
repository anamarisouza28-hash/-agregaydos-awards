import Link from 'next/link';
import { requireParticipant } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { db } from '@/lib/db';
import { formatDay, imgUrl } from '@/lib/format';
import { Brand } from '@/components/Brand';
import { Reveal } from './Reveal';
import { Wishlist } from './Wishlist';

export const dynamic = 'force-dynamic';

export default async function AmigoOcultoPage() {
  const me = await requireParticipant();
  const s = await getSettings();
  const sql = await db();
  // Só a linha em que a pessoa é quem dá o presente.
  const [a] = await sql<{ revealed_at: Date | null; nickname: string; photo_id: string | null; wishlist: string }[]>`
    select a.revealed_at, p.nickname, p.photo_id, p.wishlist
      from awards.assignments a join awards.participants p on p.id = a.receiver_id
     where a.giver_id = ${me.id}`;
  const revealed = a && a.revealed_at
    ? { nickname: a.nickname, photo: imgUrl(a.photo_id), wishlist: a.wishlist }
    : null;

  return (
    <main className="page">
      <div className="topbar"><Link href="/" className="back">‹ Início</Link></div>
      <Brand small />
      <h1 className="center" style={{ fontSize: 30, margin: '8px 0 4px' }}>
        <span className="gold-text">Amigo Oculto</span>
      </h1>

      <div className="row" style={{ justifyContent: 'center', gap: 10, margin: '10px 0 18px', flexWrap: 'wrap' }}>
        <span className="pill">🎁 Valor: {s.gift_value || 'a definir'}</span>
        <span className="pill">📅 Troca: {formatDay(s.exchange_date)}</span>
      </div>

      {!s.draw_done_at ? (
        <div className="card center">
          <div style={{ fontSize: 44 }}>✉️</div>
          <h2 style={{ marginTop: 6 }}>O sorteio ainda não aconteceu</h2>
          <p className="muted" style={{ margin: 0 }}>
            Assim que a Mari sortear, o seu envelope dourado aparece aqui. Enquanto isso, capriche na lista de desejos!
          </p>
        </div>
      ) : !a ? (
        <div className="card center">
          <h2>Você ainda não está no sorteio</h2>
          <p className="muted" style={{ margin: 0 }}>Fale com a Mari para refazer o sorteio com você incluído.</p>
        </div>
      ) : (
        <Reveal initial={revealed} />
      )}

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Minha lista de desejos</h3>
        <p className="faint" style={{ margin: '0 0 10px' }}>
          Só quem tirou você consegue ver. Pode editar quando quiser.
        </p>
        <Wishlist initial={me.wishlist} />
      </div>
    </main>
  );
}
