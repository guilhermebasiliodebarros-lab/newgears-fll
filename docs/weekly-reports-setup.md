# Relatórios semanais: configuração e arquitetura

## O que foi encontrado e mantido

- React 19 + Vite, Tailwind e lucide-react. Navegação por estado de abas no `App.jsx`, sem React Router.
- Um projeto Firebase existente (`gestao-new-gears`), com Firestore e listeners `onSnapshot`.
- Login legado por comparação de credenciais no navegador e sessão em `localStorage`. Não havia Firebase Authentication configurado no código.
- As telas existentes foram preservadas. Os relatórios são compartilhados, separados do diário individual.

Para as novas permissões serem verificáveis no servidor, a mesma tela de login passa a usar Firebase Authentication quando `VITE_FIREBASE_AUTH_ENABLED=true`. Os papéis continuam sendo `admin` e `student`. A associação entre UID e cadastro existente fica em `weeklyReportMembers`, protegida contra alterações pelo navegador. Nenhum login Supabase foi criado.

Enquanto a ativação estiver desligada, o login legado continua funcionando e as novas abas mostram uma mensagem de indisponibilidade. Um papel guardado no `localStorage` nunca autoriza a API. A migração de segurança das coleções legadas não faz parte desta funcionalidade: elas conservam suas regras atuais, que devem ser revisadas separadamente. Credenciais legadas não são sincronizadas automaticamente com Firebase Auth.

## Serviços escolhidos

- **Firestore:** metadados, cadastro autorizado, destinatários, leitura e estado de e-mail. Nenhum documento PDF/Word em Base64.
- **Supabase Storage:** bucket privado, acesso somente pelo backend; links de leitura/download assinados por cinco minutos. Não usa Firebase Storage, Supabase Auth ou Postgres para os relatórios.
- **Cloudflare Pages Functions:** API no mesmo domínio do app; valida ID token Firebase, conta desativada/revogação, integrante ativo, papel, autoria, arquivo e tamanho.
- **Resend:** e-mails de aviso sem anexos, com link `?report=ID` que preserva a navegação após login. Cada destinatário recebe seu próprio e-mail, sem expor os outros endereços.

Referências consultadas em 09/10/2026: [Supabase Free](https://supabase.com/pricing) (1 GB de arquivos, limites de transferência, pausa após uma semana de inatividade), [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Resend Free](https://resend.com/pricing), [Pages Functions](https://developers.cloudflare.com/pages/functions/pricing/) e [verificação de tokens Firebase](https://firebase.google.com/docs/auth/admin/verify-id-tokens). Os serviços têm cotas gratuitas; confira o consumo. Nada exige habilitar Firebase Blaze.

## 1. Preparar Firebase Authentication e os integrantes autorizados

1. Abra o projeto **gestao-new-gears** no Firebase Console.
2. Em Authentication → Sign-in method, habilite **E-mail/senha**.
3. Em Authentication → Settings → Authorized domains, adicione o domínio de produção e os domínios de desenvolvimento que utilizar.
4. Em Authentication → Users, crie a conta do técnico e de cada aluno, usando seus e-mails e senhas. Anote o UID de cada conta. Eles usarão e-mail/senha na mesma tela do sistema.
5. No Firestore, crie a coleção `weeklyReportMembers`. Para cada conta, use o **UID como ID do documento**. Campos:

```json
{
  "name": "Nome do integrante",
  "email": "mesmo-email-da-conta@example.com",
  "role": "student",
  "studentId": "ID-do-documento-existente-em-students",
  "active": true
}
```

Para o técnico, use `role: "admin"` e `studentId: ""`. Não use nomes como ID. O e-mail deve corresponder à conta Firebase. Desativar `active` retira acesso aos relatórios. O cadastro de destinatários no sistema **não** cria contas ou concede papéis.

6. Em Google Cloud Console, crie uma conta de serviço dedicada ao backend deste projeto e atribua os papéis **Cloud Datastore User** (`roles/datastore.user`) e **Firebase Authentication Viewer** (`roles/firebaseauth.viewer`). Habilite as APIs Cloud Firestore e Identity Toolkit se não estiverem habilitadas.
7. Gere uma chave JSON dessa conta de serviço. Use apenas `project_id`, `client_email` e `private_key` nas variáveis do servidor. Guarde o JSON fora do projeto/Git. Não coloque a chave em `public`, `src` ou qualquer variável `VITE_`.

## 2. Integrar as regras do Firestore

Não existem regras atuais versionadas neste repositório. Por isso, `firestore.weekly-reports.rules` contém os blocos das **novas coleções** para integrar às regras que já estão publicadas.

1. No Firebase Console → Firestore → Rules, copie e guarde as regras atuais.
2. Dentro do `match /databases/{database}/documents` existente, adicione as funções e os blocos `match` do arquivo `firestore.weekly-reports.rules`.
3. Não substitua todas as regras pelo arquivo: as outras abas precisam conservar seus blocos.
4. Se houver uma permissão abrangente, como `match /{document=**} { allow read, write: if true; }`, ela também liberaria as novas coleções. Regras são combinadas por **OU**; um `allow false` não anula outro `allow true`. Restrinja a regra abrangente às coleções antigas e exclua todas as coleções novas. Por exemplo, para adaptar uma regra legada abrangente:

```text
match /{collectionName}/{document=**} {
  allow read, write: if !(collectionName in [
    'weeklyReports', 'weeklyReportMembers', 'weeklyReportReads',
    'weeklyReportRecipients', 'weeklyReportEmailJobs', 'weeklyReportCleanup'
  ]) && SUA_CONDICAO_LEGADA;
}
```

Use a condição já existente em lugar de `SUA_CONDICAO_LEGADA`; o exemplo não é uma instrução para abrir o banco. Verifique também outros matches recursivos abrangentes.

5. Publique as regras integradas. Usuários ativos leem os relatórios; só o técnico lê os destinatários; cada usuário lê apenas seus estados de leitura. Toda escrita dessas coleções acontece pela API com credencial de serviço. Não é necessário índice composto para os filtros, que operam nos dados carregados.

## 3. Criar o armazenamento Supabase

1. Crie um projeto no plano **Free** em Supabase.
2. Em Storage, crie um bucket chamado `weekly-reports`, **privado**.
3. Configure limite de **10.485.760 bytes (10 MiB)** e os MIME types permitidos:
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
4. Não crie políticas de upload/leitura anônima para esse bucket.
5. Copie a Project URL e a chave de servidor `service_role` (Settings → API keys, Legacy API keys) para `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` **somente no backend**. O cliente não precisa de nenhuma chave Supabase.

O backend verifica extensão, MIME, tamanho e assinatura do conteúdo. Para DOCX, verifica também o diretório ZIP com os componentes Word e rejeita macros identificadas. Isso é validação de formato, não um antivírus. Se o bucket ficar cheio ou o projeto estiver pausado, os relatórios anteriores continuam listados e a interface informa o erro ao tentar acessar/enviar arquivos.

## 4. Configurar Resend

1. Crie uma conta Resend e selecione o plano gratuito.
2. Adicione um domínio de envio que você controla. Copie os registros DNS indicados pelo Resend para o provedor do domínio e aguarde a verificação.
3. Crie uma API key com permissão para enviar e-mails nesse domínio.
4. Configure `EMAIL_API_KEY` e `EMAIL_FROM`, por exemplo `New Gears <relatorios@seu-dominio.com.br>`.
5. Configure `APP_URL` com a URL canônica do site, por exemplo `https://newgears.pages.dev`.

O domínio de teste do Resend permite apenas os destinatários autorizados pela conta de teste; para avisar toda a equipe, use um domínio verificado. Não é necessário anexar os relatórios aos e-mails. Sem configuração de e-mail, o relatório é publicado normalmente e mostra o estado “aguardando configuração”.

Na aba **Integrantes / Notificações**, cadastre nome/e-mail, marque ativo e recebimento de avisos. O backend usa somente destinatários com as duas opções ligadas e elimina endereços repetidos no envio.

O envio é solicitado pelo frontend após uma nova publicação. Um erro nunca desfaz o relatório. O autor ou técnico pode usar “Tentar e-mail novamente”. Os destinatários e a mensagem são congelados na primeira tentativa, os lotes concluídos são registrados, e o Resend recebe uma chave de idempotência por lote. A idempotência do provedor dura 24 horas; uma falha entre aceitação do e-mail e confirmação no banco seguida de repetição após esse prazo pode duplicar um aviso. Não há agendador automático nesta versão. O aviso interno e a listagem não dependem do Resend.

## 5. Variáveis e publicação no Cloudflare Pages

1. Copie `.env.example` para `.env.local`. No frontend, preencha a configuração pública do Firebase existente e mantenha `VITE_FIREBASE_AUTH_ENABLED=false` até concluir os passos acima.
2. No projeto Cloudflare Pages, configure build `npm run build`, saída `dist` e raiz do repositório.
3. Em Settings → Variables and Secrets, configure os valores **de runtime** abaixo. Chaves privadas devem ser secrets:

| Variável | Valor |
| --- | --- |
| `FIREBASE_PROJECT_ID` | `gestao-new-gears` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` do JSON da conta de serviço |
| `FIREBASE_PRIVATE_KEY` | `private_key` do JSON; aceita quebras reais ou `\n` |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role` |
| `SUPABASE_REPORTS_BUCKET` | `weekly-reports` |
| `EMAIL_API_KEY` | API key Resend |
| `EMAIL_FROM` | remetente no domínio verificado |
| `APP_URL` | URL de produção do app |

4. Configure também as variáveis públicas **de build**: `VITE_FIREBASE_AUTH_ENABLED=true`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_API_KEY` e `VITE_REPORTS_API_BASE=/api/reports`.
5. Faça novo deploy pelo repositório Git integrado ao Pages. A pasta `functions` fica na raiz, junto de `package.json`; não copie só o `dist` por upload estático, pois isso não instala a API.
6. O `public/_routes.json` limita invocações de Functions à API de relatórios. Configure o runtime para falhar fechado se a cota gratuita de Functions for excedida.

Um `.env` do Vite não preenche o runtime das Functions. Configurar secrets somente no build também não basta. Configure Production e, se utilizar, Preview. O fluxo atual espera API no mesmo domínio (não expõe CORS para qualquer origem).

### Desenvolvimento local

O servidor Vite sozinho não executa Pages Functions. Após configurar os serviços, faça `npm run build` com as variáveis públicas desejadas. Coloque as variáveis privadas em `.dev.vars`, nunca no Git, e execute `npx wrangler pages dev dist` a partir da raiz. Abra a URL local exibida pelo Wrangler. Pode ser necessário instalar/autorizar Wrangler na primeira execução. `APP_URL` local deve corresponder a essa URL para os links de e-mail de desenvolvimento. Testes de upload/e-mail consomem as cotas dos serviços configurados.

## Arquivos e dados

- `src/views/WeeklyReportsView.jsx`: formulário com clique/arraste, progresso, edição, substituição, filtros, visualização/download e estados de leitura.
- `src/views/ReportRecipientsView.jsx`: administração dos destinatários.
- `src/components/WeeklyReportsSummary.jsx`: resumo semanal e avisos de não lidos.
- `src/hooks/useWeeklyReports.js`: listeners Firestore para a equipe e leitura individual.
- `src/services/weeklyReports.js`: cliente autenticado da API.
- `src/utils/weeklyReports.js`: validações e filtros compartilhados.
- `functions/api/reports/[[path]].js`: entrada de Pages Functions.
- `server/reports/*`: verificação Firebase, Firestore REST, armazenamento e notificações.

`weeklyReports` guarda título, semana, data, resumo, UID, vínculo do aluno, nome/e-mail, nome/tipo/tamanho do arquivo, caminho privado, rota de arquivo e datas de envio/atualização. `fileUrl` é uma **rota autenticada**, não uma URL pública permanente. A API emite o link temporário somente quando o aluno abre ou baixa.

`weeklyReportReads/{uid}/reports/{reportId}` registra leitura individual, preservada após recarregar. Autores não recebem indicador de não lido sobre seus próprios relatórios. `weeklyReportEmailJobs` guarda os dados privados de envio, sem acesso pelo navegador.

Edição preserva o autor original. Substituição usa arquivo novo e só remove o antigo após salvar os metadados; conflitos simultâneos são recusados. Se a remoção de um arquivo falhar, seu caminho fica em `weeklyReportCleanup` para limpeza manual no Supabase, seguida da exclusão do registro de limpeza. A exclusão de um relatório não apaga os pequenos registros históricos de leitura/e-mail desta versão.

## Conferência após a ativação

1. Faça login como aluno e publique um PDF pequeno. Confirme autor automático, listagem, progresso e aviso interno em outra conta.
2. Abra/baixe e marque como lido. Recarregue para conferir persistência.
3. Edite título/resumo e substitua por DOCX válido. Confirme que o arquivo anterior saiu do bucket.
4. Tente alterar/excluir relatório de outro aluno usando a API: deve retornar 403. Faça as mesmas ações como técnico: devem funcionar.
5. Confirme que escritas diretas nas novas coleções pelo SDK são recusadas, inclusive ao tentar promover o próprio papel.
6. Tente arquivos vazios, acima de 10 MB e arquivos renomeados de outro formato: devem ser recusados.
7. Cadastre um destinatário ativo e outro inativo; publique um relatório e confira os e-mails. Simule ausência da chave Resend: o relatório e seu aviso interno devem continuar disponíveis.
8. Teste `?report=ID` após sair do sistema: o link deve levar ao card depois do login, sem tornar o documento público.
