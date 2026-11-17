import type { TransactionSql } from 'postgres';
import { newToken } from './tokens';

// Conteúdo inicial. Depois do primeiro acesso, tudo é editado pelo admin.
export const PARTICIPANTS = [
  'Mari', 'Laion', 'Alice', 'Lele', 'Cobucci', 'Fefa', 'Laura', 'PedroG',
  'Duda', 'Manu', 'Bella', 'Pullig', 'Sara', 'Tutu', 'Kayron', 'Teté',
];

type SeedCategory =
  | { name: string; subtitle?: string; kind: 'person'; nominees: string[] | 'all' }
  | { name: string; subtitle?: string; kind: 'option'; nominees: string[] };

export const CATEGORIES: SeedCategory[] = [
  { name: 'Rainha/Rei do Rolê', subtitle: 'nunca perde uma', kind: 'person', nominees: 'all' },
  {
    name: 'Figurinha Oficial do Ano', kind: 'option', nominees: [
      'Cobucci perereca', 'Arthur voando alegremente no balão', 'Duda acordando da anestesia',
      'Mariana em mania pós Intermed', 'Escoliose do Pullig', 'Bella rezando',
      'Leon POV homens 2026', 'Sara desmaiada', 'Buraco negro da Fernanda',
    ],
  },
  { name: 'Ícone Fashion Duvidoso', kind: 'person', nominees: ['Laion', 'Tutu', 'Alice'] },
  { name: 'Melhor Rolê de 2026', kind: 'option', nominees: ['Intermed', 'Mari 24', 'Bella 24'] },
  {
    name: 'Babado do Ano', kind: 'option', nominees: [
      'Isabelle e cowboy', 'Leon traficante', 'Duda evangelizando o noia', 'Mari e Jão Paiol',
    ],
  },
  {
    name: 'Término do Ano', kind: 'option', nominees: [
      'Fernanda e Yury', 'Manu e Pedro Lucas', 'Leon e a doida', 'Duda e Fernando',
    ],
  },
  {
    name: 'Melhor Rango', kind: 'option', nominees: [
      'Caldo verde', 'Arroz de fraldinha', 'Strogonoff', '190 peças de sushi',
      'Hambúrguer', "John's Pizza", 'Brookie da Sara',
    ],
  },
  { name: 'Melhor Queda', kind: 'option', nominees: ['Manu', 'Mari', 'Duda', 'Alice'] },
  {
    name: 'Ficantes do Ano', kind: 'option', nominees: [
      'Luisa Mattos', 'Cobucci', 'Fernando', 'Bonitin', 'Maria Clara doida',
    ],
  },
  { name: 'Dedo Podre do Ano', kind: 'person', nominees: ['Mari', 'Laion', 'Duda'] },
  { name: 'Melhor Beijo no Leon', kind: 'person', nominees: ['Pullig', 'Duda', 'Tutu', 'Mari', 'Bella'] },
  {
    name: 'Maior Inimigo da Sala de Aula', kind: 'person',
    nominees: ['Laion', 'Alice', 'Manu', 'Mari', 'Cobucci', 'Fefa'],
  },
  {
    name: 'Agregaydo do Ano', subtitle: 'o grande prêmio da noite', kind: 'person',
    nominees: ['Duda', 'Fefa', 'Tutu', 'Pullig', 'Kayron', 'PedroG'],
  },
];

export async function seed(tx: TransactionSql) {
  await tx`
    insert into awards.settings (id, voting_deadline, gift_value, exchange_date)
    values (1, '2026-12-07T23:59:00-03:00', '', '2026-12-08')
    on conflict (id) do nothing`;

  const ids = new Map<string, string>();
  for (const [i, nick] of PARTICIPANTS.entries()) {
    const [row] = await tx`
      insert into awards.participants (nickname, token, position)
      values (${nick}, ${newToken()}, ${i}) returning id`;
    ids.set(nick, row.id);
  }

  for (const [ci, cat] of CATEGORIES.entries()) {
    const [c] = await tx`
      insert into awards.categories (name, subtitle, kind, position)
      values (${cat.name}, ${cat.subtitle ?? ''}, ${cat.kind}, ${ci}) returning id`;
    if (cat.kind === 'person') {
      const list = cat.nominees === 'all' ? PARTICIPANTS : cat.nominees;
      for (const [ni, nick] of list.entries()) {
        const pid = ids.get(nick);
        if (!pid) throw new Error(`Participante desconhecido no seed: ${nick}`);
        await tx`insert into awards.nominees (category_id, participant_id, position)
                 values (${c.id}, ${pid}, ${ni})`;
      }
    } else {
      for (const [ni, label] of cat.nominees.entries()) {
        await tx`insert into awards.nominees (category_id, label, position)
                 values (${c.id}, ${label}, ${ni})`;
      }
    }
  }
}
