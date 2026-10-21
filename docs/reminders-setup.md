# Lembretes automáticos

## Uso no site

A aba **Evolução → Lembretes** permite escolher antecedência, tipos de aviso e horário do resumo diário, no fuso de São Paulo. O envio por e-mail começa desligado. Os avisos de tarefas aparecem no site mesmo no acesso legado; relatórios e preferências de e-mail exigem Firebase Authentication.

O resumo considera prazos próximos ou vencidos, impedimentos e pedidos de ajuda. Para relatórios, verifica as últimas quatro semanas, respeitando início do ciclo, pausas e dispensas. Cada aluno recebe apenas suas tarefas, pedidos de ajuda dirigidos a ele e seus relatórios. O técnico recebe a visão da equipe.

Os destinatários são os integrantes ativos de `weeklyReportMembers`, com e-mail e vínculo de aluno ativo. Eles são diferentes da lista de destinatários de avisos sobre novos relatórios. Um integrante pode ser excluído dos resumos definindo `remindersEnabled: false` em seu cadastro de membro autenticado.

## Publicar o agendador

O agendador é um Worker separado de Pages Functions. Seu arquivo é `workers/reminders/worker.js`, com configuração em `workers/reminders/wrangler.jsonc`. A Cloudflare executa a expressão cron em UTC; o código verifica o horário escolhido em São Paulo antes de enviar. Referência: [Cron Triggers da Cloudflare](https://developers.cloudflare.com/workers/configuration/cron-triggers/).

1. Publique frontend e Pages Functions atualizados.
2. Integre os novos blocos de `firestore.weekly-reports.rules` às regras do ambiente. A coleção `automaticReminderJobs` e os documentos `settings/automatic_reminders` e `settings/reminder_scheduler` são privados. Uma permissão global ou uma regra genérica de `settings` não deve liberá-los; regras `allow` se somam e um bloco `false` não revoga outro `true`.
3. Configure no Worker as variáveis abaixo. As variáveis do projeto Pages não são herdadas pelo Worker:

| Variável | Origem |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Mesmo projeto Firebase do site |
| `FIREBASE_CLIENT_EMAIL` | Conta de serviço usada pela API |
| `FIREBASE_PRIVATE_KEY` | Chave privada da conta de serviço, como secret |
| `EMAIL_API_KEY` | Chave Resend, como secret |
| `EMAIL_FROM` | Remetente no domínio verificado |
| `APP_URL` | URL de produção do site |

Para registrar uma variável pelo terminal, use `npx wrangler@4 secret put NOME_DA_VARIAVEL --config workers/reminders/wrangler.jsonc`. O valor é solicitado de forma interativa; não coloque chaves no Git ou em variáveis públicas `VITE_`.

4. Confira o pacote sem publicar: `npx wrangler@4 deploy --dry-run --config workers/reminders/wrangler.jsonc`.
5. Publique o Worker: `npx wrangler@4 deploy --config workers/reminders/wrangler.jsonc`.
6. Em **Evolução → Lembretes**, ative o resumo diário. A página mostra quando o agendador registrou a última verificação.

O cron verifica a cada 15 minutos. No horário escolhido, falhas podem ser tentadas novamente dentro da mesma hora. Uma chave diária por integrante, precondições de gravação no Firestore e a chave de idempotência do provedor evitam resumos repetidos. Conteúdo e destinatário ficam congelados na primeira tentativa. Tentativas antigas fora da janela de idempotência são abandonadas para evitar duplicidade.

Se o Worker ainda não estiver publicado, o painel informa que nenhuma execução foi registrada; salvar preferências sozinho não instala o agendador. Se faltar remetente, chave de e-mail ou URL do site, o estado fica como configuração pendente.

## Conferência

Confira um aluno com tarefa próxima, outro com relatório dispensado e um integrante inativo. Os dois últimos não devem receber cobrança indevida. O técnico deve receber a visão da equipe. Repetir uma execução do mesmo dia não deve duplicar e-mails já enviados.

Os testes em `test/weeklyReports.test.js` usam provedores simulados e cobrem permissões, separação de perfis, falha, repetição e exportação de dados privados autorizados. Eles não enviam e-mails reais nem validam secrets publicados.
