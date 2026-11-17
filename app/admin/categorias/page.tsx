import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { loadCategories } from '@/lib/categories';
import { Cover } from '@/components/Photo';
import { SubmitButton } from '@/components/ConfirmButton';
import { AdminShell } from '../AdminShell';
import { addCategory, moveCategory } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  await requireAdmin();
  const cats = await loadCategories();

  return (
    <AdminShell active="/admin/categorias">
      <section className="card">
        <h2>Categorias ({cats.length})</h2>
        <p className="faint" style={{ marginTop: 0 }}>
          A ordem aqui é a ordem da votação e da cerimônia. A última é o prêmio principal.
        </p>
        {cats.map((c, i) => (
          <div key={c.id} className="list-row">
            <div style={{ width: 70, flex: 'none' }}>
              <Cover src={c.photo} name={c.name} style={{ borderRadius: 10 }} />
            </div>
            <Link href={`/admin/categorias/${c.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700 }}>{i + 1}. {c.name}</div>
              <div className="faint">
                {c.kind === 'person' ? '👤 Pessoa' : '✨ Opção'} · {c.nominees.length} indicados
                {i === cats.length - 1 && ' · 🏆 principal'}
              </div>
            </Link>
            <div className="row" style={{ gap: 4 }}>
              <form action={moveCategory}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="dir" value="up" />
                <button className="btn small ghost" disabled={i === 0} aria-label="Subir">▲</button>
              </form>
              <form action={moveCategory}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="dir" value="down" />
                <button className="btn small ghost" disabled={i === cats.length - 1} aria-label="Descer">▼</button>
              </form>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Nova categoria</h3>
        <form action={addCategory} className="stack">
          <label className="field"><span>Nome</span><input className="input" name="name" required /></label>
          <label className="field"><span>Subtítulo (opcional)</span><input className="input" name="subtitle" /></label>
          <label className="field">
            <span>Tipo</span>
            <select className="input" name="kind" defaultValue="person">
              <option value="person">Pessoa — os indicados são participantes</option>
              <option value="option">Opção — momentos, coisas, casais (nome + foto)</option>
            </select>
          </label>
          <p className="faint" style={{ margin: 0 }}>Ela entra logo antes do prêmio principal. Depois você pode reordenar.</p>
          <SubmitButton className="btn gold">Criar categoria</SubmitButton>
        </form>
      </section>
    </AdminShell>
  );
}
