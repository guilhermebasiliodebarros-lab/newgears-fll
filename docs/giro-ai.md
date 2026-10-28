# Giro IA — DeepSeek pela NVIDIA

O Giro usa o modelo **`deepseek-ai/deepseek-v4.1-flash`**, escolhido no exemplo enviado pelo técnico, pela [API de Chat Completions da NVIDIA](https://docs.api.nvidia.com/nim/reference/nvidia-deepseek-v4_1-flash-infer). O endpoint é `https://integrate.api.nvidia.com/v1/chat/completions`. O chat gera respostas em português, considera perguntas de acompanhamento e pode explicar trechos da biblioteca da equipe. Não usa a API OpenAI nem depende de assinatura do ChatGPT.

**Validação local:** a chave NVIDIA foi configurada no arquivo privado `.env.local`, ignorado pelo Git. O status local reconheceu a configuração (`configured: true`, `ready: true`), mas a chamada real pelo chat atingiu o prazo de 90 segundos e um teste direto também expirou sem resposta. Isso confirma que a configuração foi carregada, não a validade da credencial ou a geração pelo modelo. As verificações anteriores com respostas controladas continuam válidas. Nenhuma chave é registrada neste documento.

Na investigação seguinte, uma credencial fictícia foi recusada imediatamente com HTTP 403, enquanto a chamada ao modelo escolhido continuou expirando mesmo com pergunta mínima e saída curta. Um teste com espera ajustada retornou HTTP 504 da própria NVIDIA, com identificador da solicitação. A documentação da NVIDIA [associa esse erro a sobrecarga ou indisponibilidade do endpoint](https://docs.nvidia.com/aiq-blueprint/latest/resources/troubleshooting.html#api-key-issues), mas o teste não confirma a causa específica nesta conta. O modelo original foi mantido.

## Se continuar sem responder

1. Abra o [Playground do mesmo modelo](https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash), entre na mesma conta e envie **Olá**. Compare uma pergunta curta, sem PDF ou histórico.
2. Se também falhar no Playground, confira a mensagem de acesso ou disponibilidade mostrada pela NVIDIA. Se houver confirmação de conta ou aceite de termos solicitado no próprio painel, conclua-o. Caso o painel indique indisponibilidade, será preciso aguardar o serviço ou escolher um modelo cujo acesso e resposta sejam confirmados nessa conta.
3. Se responder normalmente no Playground, informe o resultado e o texto do erro do Giro para comparar a chamada feita pela chave com a chamada do painel. Não é necessário enviar novamente a chave.

O chat agora distingue indisponibilidade (`nvidia_unavailable`), prazo excedido (`nvidia_timeout`) e modelo não encontrado para a conta (`nvidia_model_access`). Quando a NVIDIA retorna um `nvcf-reqid` válido, ele é preservado como `requestId` na resposta da API para suporte, sem repassar mensagens internas ou a chave. O campo `connectionVerified: false` no status deixa explícito que presença de configuração não valida uma conversa real. Nenhum teste do provedor é disparado automaticamente ao abrir o chat.

## Ativar no localhost

1. No [modelo no NVIDIA Build](https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash), use **Generate API Key** e copie sua chave. Não a envie pelo chat nem a inclua em capturas de tela.
2. Abra **`.env.local` na raiz do projeto**, ao lado de `package.json`. O arquivo já foi criado com o espaço para a credencial:

```dotenv
NVIDIA_API_KEY=COLE_SUA_CHAVE_AQUI
GIRO_AI_MODEL=deepseek-ai/deepseek-v4.1-flash
```

3. Substitua somente `COLE_SUA_CHAVE_AQUI`, salve e reinicie o terminal do servidor: **Ctrl+C** e depois `npm run dev`.
4. Abra o endereço local mostrado no terminal, entre no sistema e abra **Giro IA**. Se a janela já estava aberta, clique em **Tentar novamente**. Envie uma pergunta curta para validar sua conta.

Não instale Python nem o SDK do exemplo: o servidor JavaScript já faz a chamada à NVIDIA. `.env.local` é ignorado pelo Git; a chave só é lida no servidor. Nunca use `VITE_NVIDIA_API_KEY` ou coloque a chave em `src/`, `.env.example`, documentos ou mensagens. O status da integração informa se a configuração existe, sem testar ou revelar a chave. A validade e o acesso ao modelo são confirmados ao enviar uma pergunta.

A NVIDIA apresenta o endpoint como serviço de experimentação; disponibilidade, limites e condições dependem da conta e do [serviço de avaliação da NVIDIA](https://docs.api.nvidia.com/nim/reference/nvidia-deepseek-v4_1-flash). Não é uma promessa de uso gratuito e ilimitado. O aplicativo não configura faturamento nem muda para outro provedor em caso de falta de créditos. Mensagens de chave inválida, limite e indisponibilidade são exibidas em português, mantendo a pergunta para tentar novamente.

## Biblioteca da equipe

1. No perfil do técnico, abra **Biblioteca do Giro**, no menu lateral, ou **Gerenciar biblioteca**, no chat.
2. Clique em **Adicionar material** e importe **PDF com texto selecionável, TXT ou Markdown**. Também é possível colar o conteúdo manualmente.
3. Preencha título, categoria, palavras-chave e, opcionalmente, o link original. O link não baixa o conteúdo automaticamente.
4. Revise o texto, página por página, especialmente tabelas e colunas das rúbricas. Salve como **Rascunho** para preparar ou **Publicado** para liberar à equipe.
5. Pergunte ao Giro com **Usar materiais da equipe** marcado. A busca local seleciona até quatro trechos relacionados à pergunta. Eles são enviados como contexto à IA, que deve citar somente o que sustenta sua explicação.

Os materiais citados aparecem em botões com título e página. Abra-os para conferir o texto completo da página e, quando cadastrado, o link original. Apenas materiais publicados da temporada atual entram na busca; rascunhos e arquivados são excluídos. **Arquivar** retira um material de novas consultas sem apagá-lo. É possível editar e publicar novamente. Conflitos de edição são detectados por revisão.

Os documentos ficam compartilhados em `giroKnowledgeMaterials`, identificados por `seasonId`, e não apenas no navegador do técnico. A próxima temporada não recebe automaticamente os documentos anteriores. Cada arquivo pode ter até **15 MB**, **200 páginas** e **120.000 caracteres de texto**. PDFs escaneados e imagens precisam de OCR antes da importação; não há OCR automático. O sistema salva o texto revisado, o nome do arquivo e os metadados, não o PDF original. TXT e Markdown precisam estar em UTF-8.

Desmarcar **Usar materiais da equipe** faz perguntas gerais sem enviar os trechos nem o resumo técnico do projeto/robô naquela solicitação. O histórico recente da conversa continua sendo enviado; para uma conversa sem referências usadas anteriormente, desmarque a opção e use **Nova conversa**. Se a biblioteca falhar ao carregar, é possível desmarcar a opção para perguntas gerais. **Materiais** continua permitindo leitura dos documentos mesmo quando a chave da IA ainda não foi configurada.

## Respostas e limites

Esta integração não tem busca web ou ferramentas para abrir sites. O Giro pode explicar conhecimentos gerais e programação; para regras, pontuações e prazos do torneio, é orientado a priorizar os documentos da temporada e pedir confirmação quando faltar base. Não há pesquisa simulada. O campo `reasoning_content` da NVIDIA não é enviado ao navegador; somente a resposta final é apresentada. Respostas interrompidas por limite de geração são tratadas como falha e a pergunta é mantida.

São enviados a pergunta, um histórico recente e, com a opção da biblioteca habilitada, somente os trechos selecionados e o resumo técnico permitido. Os campos estruturados de notas, senhas, carteiras, perfis, dados escolares e fotos não são incluídos automaticamente. Os campos técnicos são filtrados novamente no servidor. Textos que o usuário escrever na conversa ou publicar nos materiais fazem parte do conteúdo enviado à NVIDIA; use os materiais destinados à equipe. O processamento e eventuais registros do provedor seguem as condições da conta NVIDIA; não há promessa de ausência de logs.

O histórico e o rascunho ficam no navegador, separados por conta e temporada, com até 32 mensagens. O novo histórico é separado do antigo modo de consulta literal. Cada solicitação envia até 16 mensagens, com orçamento de texto e corpo limitado a 100 KB, e até quatro referências. A geração usa `temperature=1`, `top_p=0.95`, `max_tokens=4096` e `stream=false`; o limite é menor que o do exemplo para controlar o tamanho e a duração das respostas. O prazo da chamada é de 90 segundos. Não há repetição automática de chamadas. Cancelar ou fechar a janela aborta a solicitação, mas não garante estornar uso já processado pela NVIDIA.

## Publicação com Cloudflare Pages

A função `functions/api/giro-ai/[[path]].js` atende `/api/giro-ai/status` e `/api/giro-ai/chat`. Configure **no runtime das Functions**, pelo painel Cloudflare, `NVIDIA_API_KEY` e `GIRO_AI_MODEL=deepseek-ai/deepseek-v4.1-flash`. O `.env.local` do Vite não configura o ambiente publicado. Um build puramente estático não executa esta API: as Functions precisam acompanhar a publicação.

Em produção, o acesso exige Firebase Auth e um vínculo ativo em `weeklyReportMembers`, reaproveitando a [validação de acesso existente](weekly-reports-setup.md). Configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` no servidor e prepare as contas antes de ativar `VITE_FIREBASE_AUTH_ENABLED=true`. Papel, ID e sinalizadores locais enviados no JSON ou em cabeçalhos não autenticam usuários.

O servidor confere a temporada ativa e relê as referências da biblioteca no Firestore, descartando documentos não publicados, de outra temporada ou indisponíveis. O título, o link e o trecho são conferidos no documento armazenado. A exceção de desenvolvimento só existe no middleware do Vite, restrito a loopback e à mesma origem. Ela nunca é habilitada pela função publicada.

O contador privado `giroAiUsage/{uid}` permite oito tentativas por usuário/minuto, com reserva atômica. Falhas também contam. O limite é independente dos Gears; conversar não gasta moedas ou XP. Integre as regras de `giroAiUsage` e `giroKnowledgeMaterials` de `firestore.weekly-reports.rules` às regras existentes, excluindo essas coleções de regras globais permissivas. Alunos leem somente os materiais publicados; técnicos gerenciam os conteúdos. As regras e o site não foram publicados automaticamente.

## Verificação

Execute `npm test` e `npm run build`. A suíte `giroNvidia` verifica o modelo e o endpoint corretos, os limites, a ausência de credenciais no contexto e nas respostas, o descarte de raciocínio interno, as citações, a verificação de documentos publicados, a autenticação, o isolamento do localhost, os erros da NVIDIA e o cancelamento. Os testes usam respostas controladas e não consomem a conta do provedor. A validação real da credencial e do modelo depende de preencher `NVIDIA_API_KEY`.
