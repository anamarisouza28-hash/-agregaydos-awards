import Link from 'next/link';
import { Brand } from '@/components/Brand';

export default function NotFound() {
  return (
    <main className="page center" style={{ paddingTop: '12vh' }}>
      <Brand />
      <div className="card">
        <h2>Página não encontrada</h2>
        <p className="muted">Esse cantinho do tapete vermelho não existe.</p>
        <Link href="/" className="btn gold">Voltar ao início</Link>
      </div>
    </main>
  );
}
