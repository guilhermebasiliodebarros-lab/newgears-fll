# Giro IA — Nemotron pela NVIDIA

O Giro usa o modelo **`nvidia/nemotron-3.5-lightning-30b-a3b`** pela [API da NVIDIA](https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-5-lightning-30b-a3b). O endpoint é `https://integrate.api.nvidia.com/v1/chat/completions`. O chat gera respostas em português, considera perguntas de acompanhamento e pode explicar trechos da biblioteca da equipe. Não usa a API OpenAI nem depende de assinatura do ChatGPT.

**Diagnóstico em 29/10/2026:** a chave privada já estava configurada. O DeepSeek original expirou após 45 segundos; outra chamada curta retornou HTTP 504 da NVIDIA mesmo com o raciocínio desativado. Com a mesma chave e endpoint, `nvidia/nemotron-3.5-lightning-30b-a3b` retornou HTTP 200 e uma resposta em português em cerca de 0,6 segundo. Por isso o modelo padrão e a configuração local foram alterados para Nemotron. Após a alteração, uma pergunta enviada pela rota local `/api/giro-ai/chat`, com as instruções reais do Giro, retornou HTTP 200 e uma resposta em português em cerca de quatro segundos. As 18 suítes de testes e o build passaram. Isso confirma o funcionamento local durante o teste, sem garantir disponibilidade permanente. A chave foi preservada somente em `.env.local`.

## Instruções, busca e revisão

O Giro responde como mentor: pergunta pelo ambiente de programação antes de assumir portas ou APIs, propõe testes pequenos e separa observações, hipóteses e exigências oficiais. Não inventa resultados, entrevistas ou regras sem apoio nos materiais fornecidos.

A busca usa BM25 sobre os trechos, com peso para termos distintivos, títulos, palavras-chave e expressões exatas. Reconhece variações de termos comuns da robótica e considera as duas últimas perguntas quando a mensagem é uma continuação. Retorna até quatro trechos, com até dois trechos distintos de uma mesma página. Continua restrita aos materiais publicados da temporada; não é uma busca semântica por embeddings.

Em cada resposta, **Ajudou** e **Tem erro** permitem enviar um comentário opcional. São salvos a pergunta, a resposta, as fontes citadas e a avaliação em `giroAnswerFeedback`, separados por temporada. Não são copiados anexos ou o histórico completo. Na **Biblioteca do Giro**, o técnico encontra a fila de avaliações, escreve uma orientação revisada e pode preparar um material como **rascunho**. A correção só fica disponível para consulta depois de ser salva e publicada. Avaliações não treinam o modelo nem alteram a biblioteca automaticamente.

Integre também as regras de `giroAnswerFeedback` deste repositório ao Firestore: usuários autenticados criam suas avaliações e leem as próprias; técnicos leem e revisam. Uma avaliação não pode ser sobrescrita pelo aluno. As regras continuam exigindo vínculo ativo em `weeklyReportMembers`; nenhuma regra foi publicada automaticamente.

## Fotos e áudio

**Foto:** use o botão no chat para anexar até duas imagens JPG, PNG ou WebP, com até 10 MB cada antes da preparação. O navegador reduz a resolução para até 1.600 pixels no maior lado e converte para JPEG com até 1 MB por imagem. A análise usa `nvidia/nemotron-3.5-super-vl-120b-a12b`, pela mesma chave NVIDIA; o modelo pode ser substituído por `GIRO_AI_VISION_MODEL` no servidor. O backend aceita apenas JPEG/PNG embutidos, confere o formato e limita o corpo a 3 MB. Não baixa links enviados pelo cliente.

As fotos são enviadas à NVIDIA somente com a pergunta atual, sem gravação no Firestore ou no histórico local. O histórico registra apenas que fotos foram enviadas; para uma nova análise visual, anexe novamente. A imagem precisa estar nítida: observações visuais podem estar erradas. O chat aceita também uma foto sem texto e usa uma pergunta padrão para analisá-la.

**Áudio:** anexe um arquivo de até 15 MB e 60 segundos ou use **Gravar**. A gravação pede acesso ao microfone, mostra o tempo e para em 60 segundos; exige HTTPS ou localhost. É possível ouvir e descartar antes de usar **Transcrever para a pergunta**. O navegador precisa conseguir decodificar o formato escolhido.

A transcrição usa o modelo multilíngue `onnx-community/whisper-tiny` em um Web Worker, com Transformers.js e WebAssembly, no próprio dispositivo. O primeiro uso baixa o modelo da Hugging Face e o runtime de voz do jsDelivr; isso pode demorar e exige conexão e memória disponível. O runtime usa a mesma versão do ONNX Runtime instalada no projeto. O WASM fica no CDN para respeitar o limite de 25 MiB por arquivo do Cloudflare Pages. Nada é baixado ao simplesmente abrir o chat. Cancelar encerra o worker. O arquivo de áudio não é enviado à NVIDIA nem salvo na biblioteca: somente a transcrição revisada segue como texto quando o usuário clica em enviar. O Giro não analisa timbre, emoção ou sons do ambiente. Não exige uma segunda chave de API.

## Giro e comemorações

O mascote mantém os visuais e equipamentos existentes, com novas camadas de profundidade, acabamento metálico e aro da face. Acompanha o ponteiro com olhos e inclinação, reage ao toque e mantém as ações de dança, salto e giro. As comemorações, inclusive a básica, agora mostram o Giro animado com partículas e anéis de luz. Respeitam a preferência de movimento reduzido e encerram automaticamente.

## Se continuar sem responder

1. Abra o [Playground do mesmo modelo](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b), entre na mesma conta e envie **Olá**. Compare uma pergunta curta, sem PDF ou histórico.
2. Se também falhar no Playground, confira a mensagem de acesso ou disponibilidade mostrada pela NVIDIA. Se houver confirmação de conta ou aceite de termos solicitado no próprio painel, conclua-o. Caso o painel indique indisponibilidade, será preciso aguardar o serviço ou escolher um modelo cujo acesso e resposta sejam confirmados nessa conta.
3. Se responder normalmente no Playground, informe o resultado e o texto do erro do Giro para comparar a chamada feita pela chave com a chamada do painel. Não é necessário enviar novamente a chave.

O chat agora distingue indisponibilidade (`nvidia_unavailable`), prazo excedido (`nvidia_timeout`) e modelo não encontrado para a conta (`nvidia_model_access`). Quando a NVIDIA retorna um `nvcf-reqid` válido, ele é preservado como `requestId` na resposta da API para suporte, sem repassar mensagens internas ou a chave. O campo `connectionVerified: false` no status deixa explícito que presença de configuração não valida uma conversa real. Nenhum teste do provedor é disparado automaticamente ao abrir o chat.

## Ativar no localhost

1. No [modelo no NVIDIA Build](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b), use **Generate API Key** e copie sua chave. Não a envie pelo chat nem a inclua em capturas de tela.
2. Abra **`.env.local` na raiz do projeto**, ao lado de `package.json`. O arquivo já foi criado com o espaço para a credencial:

```dotenv
NVIDIA_API_KEY=COLE_SUA_CHAVE_AQUI
GIRO_AI_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
```

3. Substitua somente `COLE_SUA_CHAVE_AQUI`, salve e reinicie o terminal do servidor: **Ctrl+C** e depois `npm run dev`.
4. Abra o endereço local mostrado no terminal, entre no sistema e abra **Giro IA**. Se a janela já estava aberta, clique em **Tentar novamente**. Envie uma pergunta curta para validar sua conta.

Não instale Python nem o SDK do exemplo: o servidor JavaScript já faz a chamada à NVIDIA. `.env.local` é ignorado pelo Git; a chave só é lida no servidor. Nunca use `VITE_NVIDIA_API_KEY` ou coloque a chave em `src/`, `.env.example`, documentos ou mensagens. O status da integração informa se a configuração existe, sem testar ou revelar a chave. A validade e o acesso ao modelo são confirmados ao enviar uma pergunta.

A NVIDIA apresenta o endpoint como serviço de experimentação; disponibilidade, limites e condições dependem da conta e do [serviço de avaliação da NVIDIA](https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-5-lightning-30b-a3b). Não é uma promessa de uso gratuito e ilimitado. O aplicativo não configura faturamento nem muda para outro provedor em caso de falta de créditos. Mensagens de chave inválida, limite e indisponibilidade são exibidas em português, mantendo a pergunta para tentar novamente.

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

O histórico e o rascunho ficam no navegador, separados por conta e temporada, com até 32 mensagens. O novo histórico é separado do antigo modo de consulta literal. Cada solicitação envia até 16 mensagens, com até 28.000 caracteres no histórico, corpo limitado a 3 MB incluindo fotos e até quatro referências. A geração usa `temperature=1`, `top_p=0.95`, `max_tokens=4096` e `stream=false`. Para os modelos Nemotron padrão de texto e visão, `chat_template_kwargs.enable_thinking=false` solicita a resposta direta sem gastar o orçamento com raciocínio interno. Outros modelos configurados no servidor não recebem essa opção específica. `GIRO_AI_MODEL` e `GIRO_AI_VISION_MODEL` permitem selecionar explicitamente outros modelos da NVIDIA. O prazo da chamada é de 90 segundos. Não há repetição automática de chamadas. Cancelar ou fechar a janela aborta a solicitação, mas não garante estornar uso já processado pela NVIDIA.

## Publicação com Cloudflare Pages

A função `functions/api/giro-ai/[[path]].js` atende `/api/giro-ai/status` e `/api/giro-ai/chat`. Configure **no runtime das Functions**, pelo painel Cloudflare, `NVIDIA_API_KEY` e `GIRO_AI_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b`. O `.env.local` do Vite não configura o ambiente publicado. Um build puramente estático não executa esta API: as Functions precisam acompanhar a publicação.

Em produção, o acesso exige Firebase Auth e um vínculo ativo em `weeklyReportMembers`, reaproveitando a [validação de acesso existente](weekly-reports-setup.md). Configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` no servidor e prepare as contas antes de ativar `VITE_FIREBASE_AUTH_ENABLED=true`. Papel, ID e sinalizadores locais enviados no JSON ou em cabeçalhos não autenticam usuários.

O servidor confere a temporada ativa e relê as referências da biblioteca no Firestore, descartando documentos não publicados, de outra temporada ou indisponíveis. O título, o link e o trecho são conferidos no documento armazenado. A exceção de desenvolvimento só existe no middleware do Vite, restrito a loopback e à mesma origem. Ela nunca é habilitada pela função publicada.

O contador privado `giroAiUsage/{uid}` permite oito tentativas por usuário/minuto, com reserva atômica. Falhas também contam. O limite é independente dos Gears; conversar não gasta moedas ou XP. Integre as regras de `giroAiUsage` e `giroKnowledgeMaterials` de `firestore.weekly-reports.rules` às regras existentes, excluindo essas coleções de regras globais permissivas. Alunos leem somente os materiais publicados; técnicos gerenciam os conteúdos. As regras e o site não foram publicados automaticamente.

## Verificação

Execute `npm test` e `npm run build`. As 19 suítes incluem os limites e formatos das fotos, a seleção do modelo de visão, a mistura e duração das faixas de áudio, os sinônimos e o contexto da busca, a criação e revisão das avaliações e o preparo de correções como rascunho. Também verificam autenticação, isolamento do localhost, erros do provedor, cancelamento e que credenciais e raciocínio interno não são retornados. Os testes automatizados usam respostas e persistência controladas e não consomem a conta do provedor.

Na verificação de navegador em 29/10/2026, a NVIDIA identificou corretamente um quadrado vermelho e um círculo azul enviados pelo chat. O navegador transcreveu uma pergunta sintetizada em português, gravou com microfone simulado e mostrou a prévia. A transcrição também foi confirmada no worker compilado, servido como arquivo estático e usando o WASM do CDN; todos os arquivos do build ficaram abaixo de 25 MiB. A fila de revisão e a preparação de rascunhos foram exercitadas com persistência simulada, sem criar registros de teste no Firestore real. Foram conferidos o acompanhamento do ponteiro, a reação ao toque, a comemoração básica, o layout de celular e a preferência de movimento reduzido. Fotos reais de robôs, fala natural e dispositivos mais lentos precisam de avaliação da equipe antes de depender das respostas.
