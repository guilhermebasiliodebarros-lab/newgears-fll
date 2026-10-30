# Auditoria técnica com correções — NEW GEARS FLL

Data: 30/10/2026. Alterações locais, sem commit, push, deploy, criação de contas ou escrita no banco de produção. As verificações no navegador usaram registros fictícios e o SDK do Firestore substituído por um simulador.

## Avaliação geral

A aplicação tem módulos úteis e uma cobertura local de testes abrangente para regras de negócio, mas ainda concentra muita responsabilidade em `App.jsx`. As prioridades desta intervenção foram integridade de pontuação, concorrência, salvamentos, isolamento de dados por sessão e temporada, carregamento e preparação da autenticação.

O acesso legado continua sendo o principal problema crítico. Sua substituição foi preparada preservando os acessos atuais, conforme solicitado. As correções abaixo não tornam esse mecanismo uma autorização segura. A configuração real do Firebase e da Cloudflare precisa de uma etapa de implantação e validação independente.

## Problemas confirmados e correções

| Gravidade | Problema e evidência no código | Correção implementada |
| --- | --- | --- |
| Alta | XP manual calculado a partir do aluno que estava na tela; gravações concorrentes podiam perder ganhos. | `src/services/studentXp.js`: leitura do saldo atual, alteração e registro de origem na mesma transação; ID estável para repetição do envio manual. |
| Alta | Desfazer restaurava o saldo inteiro de um retrato antigo do aluno. | Compensação somente do lançamento original sobre o saldo atual; repetição do desfazer é idempotente e mantém o histórico. |
| Alta | Badges e desafio de inglês repetiam o padrão de XP desatualizado. | Transações com conferência do estado atual; desafio resgatado uma vez; desfazer de badge preserva outras conquistas e recusa mudanças posteriores da mesma badge. |
| Alta | Aprovação de penalidade distribuída por várias gravações independentes. | Pedido, saldo, aviso e registros de XP gravados atomicamente; pedido revisado não pode penalizar novamente. |
| Alta | Boletim podia sobrescrever XP obtido em outra operação e não conferia alterações feitas em outro acesso. | Delta de XP calculado dentro da transação; etapas preservadas e conferência das notas esperadas. Corrigida também a identificação de aluno sem boletim, que podia interpretar o perfil inteiro como notas legadas. |
| Alta | Avaliações podiam sobrescrever uma versão salva em outro computador. | `saveEvaluation`: conferência da temporada, versão anterior e contador de revisão; atualização dos campos da avaliação sem manter critérios removidos. Conflitos preservam o rascunho e retornam erro. |
| Alta | Listeners podiam começar antes de Firebase Auth e permanecer sem dados após erro inicial de permissão. | Consultas protegidas aguardam a sessão; assinaturas acompanham a identidade. O teste de abertura encontrou e confirmou a correção também no check-in diário. |
| Alta | Dados de frentes, seleção e histórico eram espelhados em vários estados e limpos depois de uma mudança de contexto. | `useTeamRecords` e histórico de temporadas vinculam os resultados à conta e temporada da assinatura; dados do contexto anterior não são reaproveitados na nova tela. |
| Alta | Exclusão de saída tentava apagar coleções diferentes e usava callbacks assíncronos sem aguardar. | Exclusão do documento correto, aguardada e protegida pela temporada. Histórico de treinos e trajetos é preservado. |
| Alta | Limpeza do gráfico aparecia também para alunos e apagava registros individualmente. | Interface e serviço restritos ao técnico; exclusão transacional dos registros selecionados, preservando temporadas explicitamente arquivadas. A proteção definitiva continua dependendo das regras do banco. |
| Alta | Definição de programa oficial alterava documentos separadamente. | Transação para a seleção e `officialCodeId` na configuração da temporada para serializar escolhas feitas com listas locais diferentes. A operação é técnica. |
| Média | Salvamento da meta capturava o erro, mas a ação externa ainda informava sucesso. | Falha propagada ao chamador; mensagem de sucesso somente depois de confirmar a transação. |
| Média | Rubricas gravavam o mapa inteiro e mostravam um estado otimista sem recuperação. | Atualização apenas do critério alterado, com merge, conferência de temporada e valor; resultado exibido pelo listener após a gravação. |
| Média | PitStop usava a última amostra do cronômetro e não tratava falha ao registrar. | Tempo calculado no momento de parar; trava de envio, tentativa com ID estável, erro visível e opção de repetir o salvamento. Intervalo visual reduzido de 10 para 33 ms. Ranking tolera tempos inválidos e considera a temporada. |
| Média | Abertura do Giro acessava a propriedade `localStorage` fora da proteção contra exceções. | Inicialização protegida, com conversa vazia quando o armazenamento estiver bloqueado. Confirmado no navegador. |
| Média | Imagens grandes eram convertidas diretamente em base64 para documentos do Firestore. | `inlineMedia.js`: limites de entrada, formatos permitidos, validação de leitura, redimensionamento e limite de 680 mil caracteres por anexo. PDF de evidência continua com limite próprio e validação do cabeçalho. |
| Média | Backup não incluía recibos de reembolso/reset, concessões aninhadas de Gears, reações e materiais/feedback do Giro. | Inventário ampliado em `teamBackup.js`, incluindo as subcoleções. Um ZIP real gerado com dados simulados confirmou a presença dos registros e exclusão de senhas. |
| Média | API e regras parciais consideravam aceitável um vínculo cujo aluno não existia. | Aluno estudante precisa existir e estar ativo; testes cobrem inexistente e inativo. |
| Média | Diagnósticos só tinham entrada no Worker do build avançado. | Adicionada `functions/api/diagnostics.js` para o outro caminho de build da Cloudflare. |
| Média | Sessão legada persistia o retrato completo do aluno e o login escrevia identificadores de usuários no console. | Persistência somente de identidade mínima; remoção dos logs de identificação do login. Senhas existentes no mecanismo legado continuam sendo uma pendência crítica de migração. |
| Baixa | XP negativo caía no último nível; ausência era inventada quando não existiam aulas. | Helpers de nível e presença corrigidos e cobertos por regressão. |
| Baixa | Celebração comparava XP de alunos diferentes quando o perfil visualizado mudava. | Histórico da celebração associado ao ID do aluno. |
| Baixa | Recarregar a página reiniciava a contagem local de inatividade. | Agendamento inicial considera o horário armazenado da última atividade. O prazo continua sendo um controle da interface, não uma revogação de token no servidor. |

## Interface e acessibilidade funcional

Foram corrigidos nomes acessíveis de seletores do Kanban, agenda, diário, histórico, estação dos alunos e gráfico; controles de edição/exclusão em agenda e estratégia; identificação das notas das rubricas e dos QR Codes. Ações que dependiam de hover ficam visíveis em telas pequenas e durante foco de teclado. Regiões roláveis de conquistas e histórico de treinos recebem foco. O gráfico interativo de avaliações usa um grupo acessível para permitir foco nos pontos.

Isso não equivale a uma certificação de acessibilidade. Na rodada final, a ferramenta marcou verificações de contraste, atributos ARIA e associação de células de tabelas como inconclusivas em alguns estados. Contraste de todas as combinações, leitores de tela, arraste do simulador e todos os formulários ainda precisam de revisão manual.

## Desempenho e organização

- Estratégia, robô, diário, Kanban, agenda, reta final, histórico e gráfico passam a carregar por demanda, aproveitando os fallbacks e limites de erro existentes.
- Comparação de builds desta intervenção: chunk principal de aproximadamente **605,49 KB para 461,63 KB**, antes de gzip; aproximadamente **153,68 KB para 119,97 KB** com gzip. É uma medida do chunk principal. O carregamento total também inclui React, Firebase, ícones e dependências compartilhadas, que foram atualizadas.
- PDF, leitor de PDF, voz e simulador continuam em chunks específicos. O build ainda informa tamanho elevado para a biblioteca de PDF; ela continua sendo uma oportunidade de otimização.
- Semana atual e seleção de aluno no diário são calculadas a partir dos dados disponíveis, sem efeitos que apenas copiam estado. Relógio compartilhado atualiza datas e volta a conferir a hora quando a aba fica visível.
- Mudança de XP do aluno deixa de reinstalar a consulta de check-ins de toda a equipe; o filtro da equipe passa a ser derivado dos dados já recebidos.
- Histórico arquivado e ordenação de fotos evitam limpezas de estado seguidas de renderizações adicionais. A navegação fecha painéis nos eventos de troca de aba.
- Gráfico extraído para `ScoreEvolutionChart.jsx`, com contexto próprio; lógica de XP, mutações transacionais, sessão e mídia passa a módulos próprios.
- Callbacks sem referências foram removidos. `@hello-pangea/dnd`, `src/services/workspaceData.js`, `src/App.css` vazio e o SVG de exemplo não tinham consumidores identificados e foram removidos. O favicon de Vite referenciado pelo HTML foi preservado.
- Cabeçalhos de arquivos estáticos preparados em `public/_headers`: `nosniff`, política de referência e cache longo para assets com hash. A confirmação dos cabeçalhos servidos depende do deploy; APIs já definem seus próprios cabeçalhos.

## Dependências

O primeiro `npm audit` desta intervenção apontou 15 entradas: 1 crítica, 11 altas e 3 moderadas. Foram aplicadas atualizações compatíveis e removida a dependência de arraste sem uso. Não foi usado `--force`.

O resolvedor ainda mantinha uma versão antiga de gRPC no Firebase. Foi fixado `@grpc/grpc-js@1.13.6` por override, preservando a versão principal do Firebase. A versão corrigida foi conferida nos avisos publicados pelo mantenedor: [autorização de certificados](https://github.com/advisories/GHSA-m9gg-hp2v-232j) e [mensagens de erro do servidor](https://github.com/advisories/GHSA-f596-whhp-79r4). Esses avisos descrevem cenários de servidor Node; a presença na árvore de dependências não prova exploração no site.

Após as atualizações, `npm audit` informou **zero vulnerabilidades conhecidas na árvore instalada**. Esse resultado não avalia regras do Firestore, credenciais do login legado nem problemas desconhecidos.

## Verificações

| Verificação | Resultado e alcance |
| --- | --- |
| `npm test` | 31 suítes aprovadas, incluindo a nova `auditCorrections`. O erro 503 de e-mail exibido durante a suíte é uma falha simulada esperada. |
| Regressões transacionais | Alterações simultâneas de XP, repetição de envio, compensação de desfazer, rollback antes do commit, conflito de entrega/notas, resgate único, revisão de penalidade, badges, programa oficial, revisão de avaliações, temporada bloqueada e exclusão com histórico preservado. |
| `npm run lint` | Aprovado. Foram removidas violações e dependências faltantes; as regras globais de lint foram preservadas. O aviso informativo de Babel sobre o tamanho de `App.jsx` continua. |
| `npm run build:pages` | Frontend e `_worker.js` gerados. O build informa o chunk grande de PDF. Não houve publicação. |
| Navegação em Edge/Playwright | 20 áreas técnicas e 12 áreas de aluno, além de subtelas de estratégia, com registros malformados simulados. Sem erro não tratado ou tela de recuperação inesperada. |
| Avaliações no navegador | Rascunhos inválidos, escrita durante envio, falha de salvamento, recarga, atualização do cadastro, falha de leitura, repetição e troca de temporada. |
| Testes adicionais no navegador | Abertura autenticada sem consulta protegida prematura; Giro com armazenamento disponível e bloqueado; compressão e rejeição de foto inválida; conteúdo do backup; falha e repetição do PitStop sem duplicar. |
| Recuperação e compatibilidade | Testes de menu mobile, falha de componente, chunk indisponível, armazenamento cheio/bloqueado e recuperação da raiz; combinação de três acessórios do Giro e persistência do conjunto do técnico após recarga. |
| Pacote de produção | Login mobile sem erro de JavaScript; PDF, canvas, relatórios e biblioteca sem download antecipado; falha do chunk principal com controle visível para tentar novamente. Worker compilado encaminha assets/status do Giro e recusa APIs protegidas sem autenticação, usando configuração fictícia. |
| Segredos de ambiente | Valores privados presentes nos arquivos locais de ambiente não foram encontrados nos arquivos de texto do `dist`. Essa busca não resolve as credenciais do login legado descritas acima. |
| Acessibilidade automática | axe-core 4.14.0 executado nas 32 áreas em viewport de computador, com dados fictícios: nenhuma violação automática identificada nos critérios selecionados. Medições dessas mesmas áreas em 1440×1000 e 390×844 não encontraram overflow horizontal da página. Contraste permanece entre as verificações inconclusivas da ferramenta; não foram cobertos todos os modais, estados e dispositivos. |
| CLI de migração | Plano gerado com cadastro fictício; papel de aluno e ativação pendente confirmados; tentativa de sobrescrever o plano existente recusada. |

Os roteiros locais de Playwright ficam em `giro-preview.local/`; a suíte de regressão de negócio está em `test/auditCorrections.test.js`, registrada no runner do projeto. O simulador de transações usa leitura de versões, repetição otimista e verificação de leitura antes de gravação. Ele não substitui o Emulator Suite do Firebase.

## Inventário das alterações

- Entrada e configuração: `src/App.jsx`, `package.json`, `package-lock.json`, `.gitignore`, `public/_headers`, `firestore.weekly-reports.rules`.
- Servidor: `server/reports/firebase.js`, `functions/api/diagnostics.js`.
- Serviços: `src/services/studentXp.js`, `src/services/workspaceMutations.js`, `src/services/teamBackup.js`.
- Hooks e contexto: `src/hooks/useTeamRecords.js`, `src/hooks/useWorkspaceClock.js`, `src/hooks/useScoreEvolutionChartContext.js`, `src/hooks/useGiroAI.js`.
- Utilitários e migração: `src/utils/studentMetrics.js`, `src/utils/schoolReport.js`, `src/utils/inlineMedia.js`, `src/utils/legacySession.js`, `src/utils/authMigration.js`, `scripts/plan-auth-migration.mjs`.
- Componentes: `ScoreEvolutionChart.jsx`, `PitStopModal.jsx`, `FullScheduleModal.jsx`, `InnovationStrategyPanel.jsx`, `PublicQrCodes.jsx`, `RubricView.jsx`, `RotationOperationsPanel.jsx`, `StudentEvaluationProgress.jsx` e `TvModePanel.jsx`, em `src/components/`.
- Views: `ActivityHistoryView.jsx`, `AgendaView.jsx`, `KanbanView.jsx`, `LogbookView.jsx`, `PublicShowcaseAdminView.jsx` e `SeasonHistoryView.jsx`, em `src/views/`.
- Testes: `test/auditCorrections.test.js`, `test/run-tests.js`, `test/weeklyReports.test.js`, `test/appStructure.test.js` e `test/gearShop.test.js`.
- Removidos após busca de dependências: `src/services/workspaceData.js`, `src/App.css`, `src/assets/react.svg`.
- Documentação: este relatório e `docs/auth-migration.md`.

## Pendências e limites

**Crítica, confirmada:** retirar o login legado e suas credenciais do cliente após preparar as contas. Consulte [o plano de migração](auth-migration.md). Não foi ativada a flag de Auth nem modificadas contas reais.

**Alta, configuração não disponível para comprovação:** as regras completas publicadas, índices, buckets, permissões e segredos de produção não foram inspecionados no painel. O arquivo de regras do repositório é parcial. Não é possível afirmar que alunos não possam alterar dados indevidamente em produção com base somente em verificações React. A revisão precisa cobrir o conjunto completo de permissões e ser executada no emulador antes da publicação.

**Alta, desenho de dados confirmado:** vitrine pública e login legado compartilham consultas a documentos que também contêm informações privadas. Preparar projeções públicas e separar credenciais, notas e dados pessoais exige migração planejada. Também revisar a persistência do cache do Firestore em computadores compartilhados.

**Média:** várias gravações e exclusões antigas ainda estão diretamente em `App.jsx`, sem o mesmo nível de transação e versionamento dos fluxos corrigidos. Próxima extração recomendada: formulários, agenda, entregas, catálogo de missões e operações administrativas. A política de quem pode editar recursos compartilhados precisa permanecer explícita nas regras.

**Média:** exportar várias coleções não produz um retrato global do banco no mesmo instante. O backup confere mudança de temporada, mas uma equipe ainda pode editar documentos durante a coleta. Uma cópia operacional consistente e sua restauração precisam de procedimento próprio; não foi realizada restauração de produção.

**Média:** aprovação de regras, criação de contas, migração de documentos, publicação dos cabeçalhos e deploy do site continuam pendentes. Foram testados código e respostas simuladas; chamadas reais à NVIDIA, microfone, envio real de e-mail e uploads em buckets de produção não foram executados nesta auditoria.

Não houve operação destinada a modificar os dados reais dos estudantes. A integridade histórica foi testada com registros fictícios; não foi feita uma comparação completa do banco de produção antes e depois.

## Continuidade recomendada

1. Executar o piloto de autenticação e as provas de permissão entre duas contas de aluno e uma técnica.
2. Integrar regras completas, testes do emulador e verificações de lint/test/build no fluxo de revisão de alterações.
3. Publicar uma versão de homologação, validar APIs e recursos de mídia, revisar as mudanças e autorizar o deploy de produção.
4. Continuar reduzindo `App.jsx` por domínio e estabelecer uma estratégia de backup com restauração ensaiada, monitoramento e revisão de acesso aos dados privados.
