import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { ceremonyState } from '@/lib/results';
import { Brand } from '@/components/Brand';
import { Ceremony } from './Ceremony';

export const dynamic = 'force-dynamic';

export default async function CerimoniaPage() {
  await requireAdmin();
  const s = await getSettings();
  if (!s.ceremony_started) {
    return (
      <main className="page center">
        <Brand />
        <div className="card">
          <h2>A cerimônia ainda não começou</h2>
          <p className="muted">Feche a votação e toque em “Começar cerimônia” no painel.</p>
          <Link href="/admin" className="btn gold">Ir para o painel</Link>
        </div>
      </main>
    );
  }
  return <Ceremony initial={await ceremonyState()} />;
}
