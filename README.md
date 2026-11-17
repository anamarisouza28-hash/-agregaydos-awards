# Agregaydos Awards 2026 ✨🏆

Site da confraternização dos Agregaydos: votação do **Agregaydos Awards** (com cerimônia estilo Oscar) e sorteio do **amigo oculto**.

Este guia é para a Mari (organizadora). Não precisa saber programar: é só seguir os passos. Tudo usa planos gratuitos.

---

## Parte 1 — Colocar o site no ar (uma vez só, ~20 minutos)

### Passo 1: Criar o banco de dados no Supabase

1. Entre em **https://supabase.com** e clique em **Start your project**. Crie a conta (pode ser com o GitHub).
2. Clique em **New project**.
   - **Name:** `agregaydos`
   - **Database Password:** clique em **Generate a password** e depois em **Copy**. **Guarde essa senha** num lugar seguro (bloco de notas). Use só letras e números: se você inventar uma senha, evite símbolos como `@ # / ?`.
   - **Region:** escolha **South America (São Paulo)**.
   - Clique em **Create new project** e espere uns 2 minutos.
3. Com o projeto aberto, clique no botão **Connect** (no topo da página).
4. Na aba **Connection String**, procure a opção **Transaction pooler** e copie o endereço. Ele é parecido com:
   ```
   postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
5. No bloco de notas, troque `[YOUR-PASSWORD]` (com os colchetes) pela senha que você guardou. Este endereço completo é o seu **DATABASE_URL**.

> Não precisa criar tabelas: o site cria tudo sozinho (com os 16 participantes e as 13 categorias) no primeiro acesso.

### Passo 2: Publicar o site na Vercel

1. Entre em **https://vercel.com** e clique em **Sign Up**. Escolha **Hobby** (gratuito) e **Continue with GitHub**, usando a mesma conta do GitHub onde está este repositório.
2. Clique em **Add New… → Project**.
3. Na lista, encontre o repositório **-agregaydos-awards** e clique em **Import**. (Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o acesso a ele.)
4. Abra a seção **Environment Variables** e adicione duas variáveis:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | o endereço do Passo 1 (com a senha no lugar) |
   | `ADMIN_PASSWORD` | uma senha que **só você** sabe, para entrar no admin |

5. Clique em **Deploy** e espere uns 2 minutos. Quando aparecer a tela de parabéns, clique em **Continue to Dashboard**.
6. O endereço do site aparece em **Domains**, algo como `agregaydos-awards.vercel.app`.

> **Quer um endereço mais bonito?** Em Settings → Domains você pode editar o nome `.vercel.app` (ex.: `agregaydos2026.vercel.app`). Faça isso **antes** de mandar os links, porque eles usam o endereço do site.

### Passo 3: Primeiro acesso ao admin

1. Abra `https://SEU-SITE.vercel.app/admin`.
2. Digite a senha que você colocou em `ADMIN_PASSWORD`.
3. Pronto! As categorias, indicados e participantes já estão lá.

Se aparecer uma página de erro, quase sempre é o `DATABASE_URL` errado (senha errada, colchetes esquecidos ou foi copiado o endereço "Direct connection" em vez do "Transaction pooler"). Corrija em Vercel → Settings → Environment Variables e depois vá em **Deployments → ⋯ → Redeploy**.

---

## Parte 2 — Preparar tudo (antes de mandar os links)

Tudo pelo celular, em `/admin`.

### Fotos dos participantes
**Participantes** → em cada pessoa toque em **📷 Subir foto** e escolha da galeria. O site reduz a foto sozinho, então pode mandar a foto original.

### Fotos das categorias e dos indicados
**Categorias** → toque na categoria →
- **📷 Subir capa** para a foto de capa;
- nas categorias de **opção** (Figurinha, Rango, Babado…), cada indicado tem o seu **📷 Subir foto**;
- nas categorias de **pessoa**, a foto vem automaticamente do cadastro do participante.

Enquanto não houver foto, o site mostra uma cortina vermelha com troféu (categorias) ou as iniciais em dourado (pessoas).

### Editar o que quiser
- **Categorias:** criar, renomear, mudar subtítulo, reordenar (▲▼), remover. A **última da lista é o prêmio principal** (Agregaydo do Ano), e novas categorias entram logo antes dela.
- **Indicados:** adicionar, renomear, reordenar, remover. Se a categoria já tiver votos, o site avisa antes. Se você remover um indicado que recebeu votos, esses votos são descartados e quem votou nele vê um aviso laranja para votar de novo.
- **Participantes:** adicionar, renomear, remover.

### Valor do presente e data da troca
**Painel → Amigo oculto**: preencha o **valor** (ex.: `R$ 100`) e confira a **data** (8/12). Toque em **Salvar**.

---

## Parte 3 — Mandar os links

Cada pessoa tem um link só dela, tipo `https://SEU-SITE.vercel.app/p/x8Kq2...`. Quem abre já entra como ela mesma, sem senha. O site lembra no aparelho, e o link continua funcionando se ela trocar de celular.

Em **Participantes**:
- **💬 WhatsApp**: abre o WhatsApp com uma mensagem-convite pronta e o link da pessoa. É só escolher o contato dela e enviar.
- **🔗 Copiar link**: copia só o link.
- **📋 Copiar todos os links**: copia a lista inteira (nome + link), útil para guardar.

⚠️ **Mande cada link no privado**, nunca no grupo: quem tiver o link de alguém consegue votar como aquela pessoa e ver o amigo oculto dela.

**Um link vazou?** Toque em **♻️ Gerar novo link** na pessoa. O antigo para de funcionar na hora; mande o novo para ela. Os votos e o amigo oculto dela continuam iguais.

O seu próprio link (Mari) também está lá: use para votar e ver o seu amigo oculto como participante.

---

## Parte 4 — Dia a dia (até 7/12)

### Votação
- Cada pessoa vota em todas as categorias e pode mudar o voto até o prazo.
- No **Painel → Votação** você vê **quantas pessoas já terminaram** e, em **Quem ainda falta**, quem não começou e quem está pela metade (ex.: `5/13`). Use isso para cobrar a galera. 😉
- Você **não** vê em quem ninguém votou. Os resultados nem são calculados antes da cerimônia.
- O prazo está em **7/12 às 23:59** (horário de Brasília). Para mudar, edite em **Prazo da votação** e toque em **Salvar prazo**.
- Fechou o prazo, a votação trava sozinha. Para fechar antes, use **Fechar votação agora**. Mudou de ideia? É só colocar um prazo no futuro de novo (isso só funciona antes de começar a cerimônia).

### Amigo oculto
1. Quando todo mundo estiver cadastrado, vá em **Painel → Amigo oculto → 🎲 Sortear**.
2. Cada pessoa abre o próprio envelope dourado em **Meu Amigo Oculto** e vê quem tirou, com foto e lista de desejos.
3. No painel você vê só **quantas pessoas já abriram** (ex.: `9/16`). Ninguém, nem o admin, vê quem tirou quem.
4. Todo mundo pode escrever e editar a **lista de desejos** a qualquer momento. Quem tirou a pessoa vê sempre a versão mais nova.
5. **Refazer sorteio** só se der problema (por exemplo, se entrou ou saiu alguém depois do sorteio: o painel avisa). O site pede para digitar `REFAZER`. Atenção: todo mundo tira outra pessoa, então avise o grupo.

---

## Parte 5 — Dia da festa (8/12): a cerimônia 🎬

**Antes da festa:**
- Confirme que a votação fechou (o painel mostra **Fechada**). Se ainda estiver aberta, toque em **Fechar votação agora**.
- Teste o espelhamento do seu celular na TV (AirPlay no iPhone; "Transmitir tela" / Smart View no Android). Se preferir, abra o admin direto num notebook ligado à TV.
- Deixe o celular carregado e com o brilho alto.

**Na hora:**
1. **Painel → 🎬 Começar cerimônia** (confirme). A partir daqui os resultados passam a existir e a votação não reabre.
2. Toque em **⛶ Tela cheia** (canto de cima) e vire o celular deitado para ficar melhor na TV.
3. Para cada categoria, em ordem:
   - **capa da categoria** → toque em **Ver indicados**
   - **os indicados** → toque em **E o vencedor é…**
   - **rufar de tambores** (uns 3 segundos de suspense)
   - **vencedor(es)** com foto grande, confete dourado e número de votos. Em empate, aparecem todos juntos com o selo **Empate!**
   - toque em **Próxima categoria**
4. Depois do **Agregaydo do Ano** vem o **Encerramento**, com todos os vencedores numa tela só.

Dicas:
- **‹ Voltar** volta uma tela (útil se tocar sem querer).
- Se a página recarregar, cair a internet ou o celular bloquear, abra `/admin/cerimonia` de novo: ela **continua de onde parou**.
- No notebook dá para usar as setas do teclado (→ avança, ← volta).
- O resultado de cada categoria só sai do servidor no momento da revelação, então nem espiando dá para descobrir antes.
- **Recomeçar a cerimônia do início** (no painel) volta para a abertura, se precisar.

Quando a cerimônia chega ao encerramento, todo mundo passa a ver os vencedores no próprio celular, no botão **🏆 Ver os vencedores**.

---

## Privacidade e segredo

- O voto é secreto: nenhuma tela mostra em quem alguém votou, e as contagens só são calculadas pelo servidor depois que você começa a cerimônia.
- O amigo oculto de cada pessoa só vai para o celular dela.
- O banco fica num espaço privado (`awards`), fora da API pública do Supabase.
- **Uma ressalva honesta:** como dona do projeto no Supabase, você *conseguiria* abrir as tabelas `votes` e `assignments` pelo painel do Supabase. O site nunca mostra isso, mas para manter a surpresa: **não abra essas tabelas no Supabase** (Table Editor → schema `awards`).

## Coisas boas de saber

- **Supabase pausa projetos gratuitos parados por 7 dias.** Com a galera usando o site isso não acontece, mas se um dia o site der erro, entre no Supabase e clique em **Restore project**.
- Para trocar a senha do admin: Vercel → Settings → Environment Variables → edite `ADMIN_PASSWORD` → Deployments → ⋯ → **Redeploy**.
- O site é para ser usado no celular, mas funciona em qualquer navegador.

---

## Para quem programa

Next.js 15 (App Router) + PostgreSQL (Supabase) via [`postgres`](https://github.com/porsager/postgres). Toda leitura e escrita passa pelo servidor; o navegador nunca fala direto com o banco.

- `lib/schema.ts` cria as tabelas (idempotente) e `lib/seed.ts` tem o conteúdo inicial; os dois rodam no primeiro acesso (`lib/db.ts`).
- `lib/results.ts` é o **único** lugar que conta votos, e se recusa a rodar antes de `ceremony_started`. A API da cerimônia só inclui o resultado das categorias cujo passo de revelação já foi alcançado.
- As fotos ficam na tabela `awards.images` (comprimidas no navegador, ~50–150 KB) e são servidas por `/api/img/[id]` com cache permanente.
- Rodar local: crie `.env.local` com `DATABASE_URL` e `ADMIN_PASSWORD` (veja `.env.example`), depois `npm install && npm run dev`.
