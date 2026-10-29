# Ativar o Giro IA para os alunos

## Diagnóstico de newgears-fll.pages.dev em 29/10/2026

A consulta pública a `https://newgears-fll.pages.dev/api/giro-ai/status` retornou HTTP 200 com HTML da página inicial, em vez de JSON da API. A rota `/api/reports/session` retornou HTTP 503 com a mensagem de configuração incompleta. Nenhuma chave foi consultada ou exposta.

No código, `public/_routes.json` incluía apenas as rotas de relatórios. Foi corrigido para incluir `/api/giro-ai` e `/api/giro-ai/*`. A chave NVIDIA deste computador está somente em `.env.local`; esse arquivo não configura o site publicado. O login Firebase também precisa ser preparado para autorizar os alunos no servidor.

## 1. Preparar as contas no Firebase

No projeto **gestao-new-gears**, habilite **Authentication → Sign-in method → E-mail/senha**. Adicione `newgears-fll.pages.dev` em **Authentication → Settings → Authorized domains**. Crie as contas do técnico e dos alunos em **Users**, usando os e-mails que eles usarão para entrar. O login antigo não cria essas contas automaticamente.

No Firestore, crie `weeklyReportMembers/{UID}` para cada conta; o ID do documento deve ser o UID do Authentication:

```json
{
  "name": "Nome do aluno",
  "email": "mesmo-email-do-Authentication@example.com",
  "role": "student",
  "studentId": "ID-do-cadastro-existente-em-students",
  "active": true
}
```

Para o técnico, use `role: "admin"` e `studentId: ""`. O cadastro em `students` não deve ser recriado. Integre as regras das novas coleções de `firestore.weekly-reports.rules` às atuais, preservando as permissões das outras abas. Consulte as etapas 1 e 2 de [configuração do Firebase](weekly-reports-setup.md). O Giro IA e o login não exigem Supabase ou Resend.

Crie uma conta de serviço dedicada ao backend com **Cloud Datastore User** e **Firebase Authentication Viewer**, conforme esse guia. Gere a chave JSON e guarde-a fora do repositório. Os campos necessários são `project_id`, `client_email` e `private_key`.

## 2. Configurar o servidor no Cloudflare

Abra **Workers & Pages → newgears-fll → Settings → Variables and Secrets**, no ambiente **Production**. Cadastre:

| Nome | Valor | Tipo |
| --- | --- | --- |
| `NVIDIA_API_KEY` | A chave NVIDIA já utilizada neste computador | Secret |
| `GIRO_AI_MODEL` | `nvidia/nemotron-3.5-lightning-30b-a3b` | Texto |
| `GIRO_AI_VISION_MODEL` | `nvidia/nemotron-3.5-super-vl-120b-a12b` | Texto, opcional |
| `FIREBASE_PROJECT_ID` | `gestao-new-gears` | Texto |
| `FIREBASE_CLIENT_EMAIL` | `client_email` do JSON da conta de serviço | Secret |
| `FIREBASE_PRIVATE_KEY` | `private_key` do JSON; aceita quebras reais ou `\n` | Secret |

Esses valores devem estar disponíveis no runtime das Functions. Nunca use `VITE_NVIDIA_API_KEY` ou `VITE_FIREBASE_PRIVATE_KEY`. Nenhum aluno precisa receber uma chave NVIDIA. Alterações nas variáveis exigem nova publicação.

## 3. Publicar o site com a API

O comando **`npm run build:pages`** gera `dist` com o frontend, `_routes.json` corrigido e `_worker.js`, que atende tanto o Giro quanto os relatórios. O Worker lê credenciais somente do ambiente Cloudflare. O comando não faz login nem publica automaticamente.

### Se você envia uma pasta ou ZIP pelo painel

Depois de preparar as contas e as variáveis do servidor, gere o build com o login Firebase ativado. No PowerShell, na pasta do projeto:

```powershell
$env:VITE_FIREBASE_AUTH_ENABLED = 'true'
npm run build:pages
Remove-Item Env:VITE_FIREBASE_AUTH_ENABLED
```

Em **Deployments → Create deployment**, publique a pasta `dist` completa ou um ZIP com **o conteúdo** de `dist` na raiz, inclusive `_worker.js`. Não envie o repositório nem `.env.local`. O painel não compila a pasta `functions`; o `_worker.js` já compilado atende esse caso. O pacote local gerado durante o desenvolvimento mantém o login atual; gere novamente com o sinalizador acima depois de preparar as contas.

### Se o Cloudflare está conectado ao Git

Use build **`npm run build:pages`**, saída **`dist`**, raiz do repositório. Depois de preparar contas e servidor, configure **`VITE_FIREBASE_AUTH_ENABLED=true` no ambiente de build** e publique a revisão atual. O modo avançado `_worker.js` substitui o roteamento da pasta `functions`, preservando os mesmos handlers de Giro e relatórios.

## 4. Conferir em outro computador

1. Abra `https://newgears-fll.pages.dev/api/giro-ai/status`. Deve aparecer JSON com `configured: true`, `ready: true` e `authentication: "firebase"`. HTML significa rota ausente; `configured: false` indica chave ausente; `ready: false` com chave configurada indica autenticação do servidor incompleta. `ready` confirma presença da configuração, não a validade das credenciais.
2. Saia da conta antiga e entre com o e-mail/senha do Firebase Authentication. Sem login, `/api/reports/session` deve passar de 503 para 401; logado, o aplicativo usa o token para carregar a sessão.
3. Envie uma pergunta curta no Giro e confira também uma conta de aluno em outro computador. Esse envio confirma o acesso real à NVIDIA. Se houver erro de vínculo, confira UID, e-mail, papel, `studentId` e `active` em `weeklyReportMembers`.

Referências: [upload de pastas e Workers no Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/direct-upload/), [variáveis e secrets das Functions](https://developers.cloudflare.com/pages/functions/bindings/), [login com e-mail/senha no Firebase](https://firebase.google.com/docs/auth/web/password-auth).
