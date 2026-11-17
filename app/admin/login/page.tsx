import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { Brand } from '@/components/Brand';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="page" style={{ paddingTop: '10vh' }}>
      <Brand />
      <div className="card" style={{ marginTop: 20 }}>
        <h2>Área da organização</h2>
        <p className="faint" style={{ marginTop: 0 }}>Só a Mari entra aqui.</p>
        <LoginForm />
      </div>
    </main>
  );
}
