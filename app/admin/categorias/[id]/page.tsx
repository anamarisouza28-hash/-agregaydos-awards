import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { loadCategories } from '@/lib/categories';
import { Avatar, Cover } from '@/components/Photo';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ConfirmButton, SubmitButton } from '@/components/ConfirmButton';
import { AdminShell } from '../../AdminShell';
import {
  addNominee, moveNominee, removeCategory, removeNominee, renameNominee, updateCategory,
} from '../../actions';

export const dynamic = 'force-dynamic';

export default async function CategoriaEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const cats = await loadCategories();
  const cat = cats.find((c) => c.id === id);
  if (!cat) notFound();
  const sql = await db();
  // Só um sim/não: a categoria já recebeu algum voto? (nunca quantos nem em quem)
  const [{ has }] = await sql<{ has: boolean }[]>`
    select exists (select 1 from awards.votes where category_id = ${id}) as has`;
  const people = await sql<{ id: string; nickname: string }[]>`
    select id, nickname from awards.participants order by position, created_at`;
  const already = new Set(cat.nominees.map((n) => n.participantId));
  const available = people.filter((p) => !already.has(p.id));
  const removeMsg = (name: string) =>
    has
      ? `Esta categoria já recebeu votos. Se alguém votou em “${name}”, esse voto será descartado e a pessoa vai precisar votar de novo. Remover mesmo assim?`
      : `Remover “${name}” desta categoria?`;

  return (
    <AdminShell active="/admin/categorias">
      <Link href="/admin/categorias" className="back">‹ Todas as categorias</Link>

      {has && (
        <p className="notice warn">
          ⚠️ Esta categoria já recebeu votos. Mudar nomes e fotos não afeta nada, mas remover um indicado descarta os votos que ele recebeu
          (quem votou nele é avisado para votar de novo).
        </p>
      )}

      <section className="card">
        <Cover src={cat.photo} name={cat.name} />
        <div style={{ marginTop: 10 }}>
          <PhotoUpload target="category" id={cat.id} label={cat.photo ? 'Trocar capa' : 'Subir capa'} hasPhoto={!!cat.photo} />
        </div>
        <form action={updateCategory} className="stack" style={{ marginTop: 14 }}>
          <input type="hidden" name="id" value={cat.id} />
          <label className="field"><span>Nome</span><input className="input" name="name" defaultValue={cat.name} required /></label>
          <label className="field"><span>Subtítulo</span><input className="input" name="subtitle" defaultValue={cat.subtitle} /></label>
          <label className="field">
            <span>Tipo {cat.nominees.length > 0 && '(para trocar, remova os indicados antes)'}</span>
            <select className="input" name="kind" defaultValue={cat.kind} disabled={cat.nominees.length > 0}>
              <option value="person">Pessoa — indicados são participantes</option>
              <option value="option">Opção — nome + foto próprios</option>
            </select>
          </label>
          <SubmitButton className="btn gold small">Salvar categoria</SubmitButton>
        </form>
      </section>

      <section className="card">
        <h3>Indicados ({cat.nominees.length})</h3>
        {cat.nominees.map((n, i) => (
          <div key={n.id} className="list-row" style={{ alignItems: 'flex-start' }}>
            <Avatar src={n.photo} name={n.name} size={56} square={cat.kind === 'option'} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {cat.kind === 'option' ? (
                <>
                  <form action={renameNominee} className="row">
                    <input type="hidden" name="id" value={n.id} />
                    <input className="input" name="label" defaultValue={n.name} style={{ minHeight: 38, padding: '6px 10px' }} />
                    <SubmitButton className="btn small" pendingText="…">Salvar</SubmitButton>
                  </form>
                  <div style={{ marginTop: 6 }}>
                    <PhotoUpload target="nominee" id={n.id} label={n.photo ? 'Trocar foto' : 'Subir foto'} hasPhoto={!!n.photo} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, paddingTop: 6 }}>{n.name}</div>
                  <div className="faint">A foto vem do cadastro do participante.</div>
                </>
              )}
            </div>
            <div className="row" style={{ gap: 2 }}>
              <form action={moveNominee}>
                <input type="hidden" name="id" value={n.id} /><input type="hidden" name="dir" value="up" />
                <button className="btn small ghost" disabled={i === 0} aria-label="Subir">▲</button>
              </form>
              <form action={moveNominee}>
                <input type="hidden" name="id" value={n.id} /><input type="hidden" name="dir" value="down" />
                <button className="btn small ghost" disabled={i === cat.nominees.length - 1} aria-label="Descer">▼</button>
              </form>
              <form action={removeNominee}>
                <input type="hidden" name="id" value={n.id} />
                <ConfirmButton className="btn small ghost" message={removeMsg(n.name)}>✕</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
        {cat.nominees.length === 0 && <p className="faint">Nenhum indicado ainda.</p>}

        <hr style={{ border: 0, borderTop: '1px solid rgba(212,175,55,.2)', margin: '14px 0' }} />
        <form action={addNominee} className="row">
          <input type="hidden" name="category_id" value={cat.id} />
          {cat.kind === 'person' ? (
            <>
              <select className="input" name="participant_id" required defaultValue="">
                <option value="" disabled>Escolha um participante…</option>
                {available.length > 1 && <option value="all">➕ Todos que faltam ({available.length})</option>}
                {available.map((p) => <option key={p.id} value={p.id}>{p.nickname}</option>)}
              </select>
              <SubmitButton className="btn gold" pendingText="…">Adicionar</SubmitButton>
            </>
          ) : (
            <>
              <input className="input" name="label" placeholder="Nome do indicado" required />
              <SubmitButton className="btn gold" pendingText="…">Adicionar</SubmitButton>
            </>
          )}
        </form>
        {cat.kind === 'option' && <p className="faint" style={{ marginBottom: 0 }}>Depois de adicionar, suba a foto do indicado.</p>}
      </section>

      <section className="card">
        <form action={removeCategory}>
          <input type="hidden" name="id" value={cat.id} />
          <ConfirmButton
            className="btn danger block"
            typeToConfirm="REMOVER"
            message={`Remover a categoria “${cat.name}” com todos os indicados${has ? ' e TODOS os votos dela' : ''}?`}
          >
            Remover categoria
          </ConfirmButton>
        </form>
      </section>
    </AdminShell>
  );
}
