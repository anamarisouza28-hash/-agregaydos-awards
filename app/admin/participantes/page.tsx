import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { imgUrl } from '@/lib/format';
import { Avatar } from '@/components/Photo';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ConfirmButton, SubmitButton } from '@/components/ConfirmButton';
import { CopyAllLinks, CopyLink, WhatsAppLink } from '@/components/CopyButton';
import { AdminShell } from '../AdminShell';
import { addParticipant, regenerateLink, removeParticipant, renameParticipant } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ParticipantesPage() {
  await requireAdmin();
  const sql = await db();
  const people = await sql<{ id: string; nickname: string; photo_id: string | null; token: string }[]>`
    select id, nickname, photo_id, token from awards.participants order by position, created_at`;

  return (
    <AdminShell active="/admin/participantes">
      <section className="card">
        <div className="row wrap">
          <h2 style={{ margin: 0 }}>Participantes ({people.length})</h2>
          <div className="spacer" />
          <CopyAllLinks items={people.map((p) => ({ name: p.nickname, path: `/p/${p.token}` }))} />
        </div>
        <p className="faint">
          Cada pessoa tem um link só dela. Se um link vazar, toque em “Gerar novo link”: o antigo para de funcionar na hora.
        </p>

        {people.map((p) => (
          <div key={p.id} className="list-row" style={{ alignItems: 'flex-start' }}>
            <Avatar src={imgUrl(p.photo_id)} name={p.nickname} size={60} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <form action={renameParticipant} className="row">
                <input type="hidden" name="id" value={p.id} />
                <input className="input" name="nickname" defaultValue={p.nickname} aria-label="Apelido" style={{ minHeight: 38, padding: '6px 10px' }} />
                <SubmitButton className="btn small" pendingText="…">Salvar</SubmitButton>
              </form>
              <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                <PhotoUpload target="participant" id={p.id} label={p.photo_id ? 'Trocar foto' : 'Subir foto'} hasPhoto={!!p.photo_id} />
                <CopyLink path={`/p/${p.token}`} />
                <WhatsAppLink path={`/p/${p.token}`} name={p.nickname} />
              </div>
              <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
                <form action={regenerateLink}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton
                    className="btn small ghost"
                    message={`Gerar um novo link para ${p.nickname}? O link antigo para de funcionar e você vai precisar mandar o novo. Os votos e o amigo oculto dela continuam iguais.`}
                  >
                    ♻️ Gerar novo link
                  </ConfirmButton>
                </form>
                <form action={removeParticipant}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton
                    className="btn small ghost"
                    typeToConfirm="REMOVER"
                    message={`Remover ${p.nickname}? Os votos dela somem, ela sai das categorias em que foi indicada (quem votou nela vai precisar votar de novo) e, se o amigo oculto já foi sorteado, você vai precisar refazer o sorteio.`}
                  >
                    🗑️ Remover
                  </ConfirmButton>
                </form>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Adicionar participante</h3>
        <form action={addParticipant} className="row">
          <input className="input" name="nickname" placeholder="Apelido" required />
          <SubmitButton className="btn gold" pendingText="…">Adicionar</SubmitButton>
        </form>
      </section>
    </AdminShell>
  );
}
