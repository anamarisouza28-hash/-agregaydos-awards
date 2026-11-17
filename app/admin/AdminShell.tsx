import Link from 'next/link';
import { logout } from './actions';

const TABS = [
  { href: '/admin', label: 'Painel' },
  { href: '/admin/participantes', label: 'Participantes' },
  { href: '/admin/categorias', label: 'Categorias' },
];

export function AdminShell({ active, children, wide = false }: { active: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <main className={`page ${wide ? 'wide' : ''}`}>
      <div className="row" style={{ marginBottom: 6 }}>
        <div className="deco gold-text" style={{ fontSize: 13, fontWeight: 700 }}>Admin · Agregaydos Awards</div>
        <div className="spacer" />
        <form action={logout}><button className="btn ghost small">Sair</button></form>
      </div>
      <nav className="admin-nav">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={active === t.href ? 'active' : ''}>{t.label}</Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
