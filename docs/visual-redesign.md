# Redesign implementado — NEW GEARS FLL

Registro de 30/10/2026. Alterações locais, sem publicação e sem operações no banco de produção. As alterações da auditoria técnica anterior foram preservadas; este documento descreve a etapa visual.

## Resultado

A interface passou a usar superfícies azul-marinho, destaques violeta, tipografia do sistema, bordas discretas e espaçamentos regulares. O tema dourado continua disponível. Foram reduzidos os recortes decorativos, sombras e fundos que competiam com o conteúdo.

O técnico e o aluno abrem uma visão geral com prioridades e ações úteis. Os indicadores detalhados e controles anteriores continuam acessíveis em uma seção expansível. Tarefas, avaliações, formulários e integrações mantêm seus fluxos existentes.

Capturas locais com dados fictícios:

- [Painel do técnico](redesign/painel-tecnico.png).
- [Painel do aluno no celular](redesign/painel-aluno-celular.png).
- [Busca rápida](redesign/busca-rapida.png).

## Problemas observados e mudanças

| Observação | Implementação |
| --- | --- |
| Muitos painéis e avisos competiam pela atenção inicial. | Resumo com prioridades, próximos eventos, progresso e ações diretas; indicadores detalhados recolhíveis. |
| Navegação longa para localizar uma função. | Busca global com Ctrl/Cmd+K, busca no menu, favoritos preservados e resultados ordenados pela correspondência do nome. |
| Estilos diferentes entre formulários, tabelas e cartões. | Tokens compartilhados, controles consistentes, foco visível e componentes reutilizáveis. |
| Modais com tratamentos diferentes de teclado e sobreposição. | Camada compartilhada com isolamento do fundo, foco contido, Escape e retorno do foco. Recorte de foto e bloqueio da temporada respeitam a ordem de prioridade. |
| Mensagens transitórias podiam ficar encobertas. | Notificações em portal, fechamento explícito, anúncios acessíveis e maior duração para erros. A ação Desfazer foi mantida. |
| Rubricas exigiam muita rolagem e o radar tinha legendas cortadas. | Alternância entre projeto e robô, critérios expansíveis com nota no resumo e radar com rótulos dentro dos limites. Os campos e guias continuam presentes. |
| A conferência inicial encontrou 22 ocorrências de controles cortados nas larguras testadas. | Ajustes em controles de temporada, cabeçalhos de estratégia, cards de saída e filtros do gráfico. A repetição da matriz terminou sem ocorrências. |
| A vitrine usava uma imagem fixa de outra temporada como apresentação genérica. | Imagem real do projeto quando cadastrada; composição com a marca quando ausente. A mesa do simulador foi preservada. |
| Efeitos contínuos e carregamento pouco informativo. | Skeletons descritivos, transições curtas, feedback de conclusão e respeito à preferência por movimento reduzido. |

## Cobertura por página

“Base compartilhada” significa que a página recebeu os estilos comuns de títulos, campos, botões, tabelas, cartões, foco e layout. Isso não significa que cada componente interno foi reescrito.

| Página ou módulo | Melhorias aplicadas |
| --- | --- |
| Visão geral do técnico | Prioridades da equipe, atrasos, eventos, integrantes, preparação e atalhos para criar tarefa/evento. |
| Visão geral do aluno | Tarefas pessoais, XP real, próximo nível, conquistas, agenda e acesso ao diário. |
| Minha Missão e Meu feedback | Base compartilhada, hierarquia e acesso pelo novo resumo. |
| Reta final | Base compartilhada, avisos compactos e consistência dos painéis. |
| Kanban / Tarefas | Compositor acessível pelo resumo; foco e rascunho preservados; duas colunas em telas intermediárias e rolagem horizontal indicada no celular; feedback de conclusão. |
| Agenda / calendários | Filtros com estado anunciado, controles padronizados e acesso aos próximos eventos pelo resumo. |
| Relatórios semanais | Base compartilhada em filtros, listas e ações; carregamento consistente. |
| Diário | Base compartilhada e atalho direto para escrita. |
| Estratégia / projetos / garras | Cabeçalhos adaptáveis, tabelas consistentes e controles sem recorte em telas estreitas. |
| Robô / saídas / rounds | Ações dos cards reorganizadas no celular, campos e cabeçalhos adaptáveis. |
| Simulador de trajetos | Compatibilidade com o novo tema verificada; controles existentes de giro, ré, curva, reset e reprodução preservados. |
| Rubricas | Critérios expansíveis, resumo das notas, alternância projeto/robô e radar legível. |
| Biblioteca do Giro | Base compartilhada em busca, cartões e formulários. |
| Alunos | Base compartilhada, modais e recorte de foto acessíveis. |
| Rodízio | Base compartilhada em controles e painéis. |
| Avaliações | Base compartilhada; foco e rascunhos mantidos nos cenários de atualização testados. |
| Disciplina | Base compartilhada e feedback de ações. |
| Vitrine administrativa | Base compartilhada em formulários e ações. |
| Loja New Gears | Integração visual com o tema, campos e ações; acessórios combinados e provador preservados. |
| Evolução / XP / rankings | Tipografia, cartões e controles consistentes; indicadores reais de progresso na visão geral. |
| Histórico de atividades | Base compartilhada em filtros, registros e estados. |
| Temporadas | Base compartilhada; bloqueio de transição com prioridade sobre outros modais. |
| Integrantes / Notificações | Base compartilhada em formulários, ações e mensagens. |
| Giro e Giro IA | Widget menor no celular, superfícies integradas e efeitos decorativos desativados com movimento reduzido. |
| Login | Paleta, tipografia, campos e foco visível compartilhados. |
| Vitrine pública e QR Codes | Apresentação do projeto sem imagem genérica de temporada; composição e navegação existentes preservadas. |
| Modo TV interno e público | Tipografia, superfícies e controles alinhados ao restante da interface; navegação e pausa verificadas. |

## Arquivos desta etapa

Criados:

- `src/components/InterfacePrimitives.jsx`: botão, estado vazio, skeleton, seção expansível, modal e notificação.
- `src/components/WorkspaceBriefing.jsx`: resumo inicial do técnico e do aluno.
- `src/components/WorkspaceSearch.jsx`: busca de áreas com navegação por teclado.
- `src/components/ProjectVisual.jsx`: imagem real do projeto ou composição com a marca.
- `src/utils/workspaceBriefing.js`: seleção e ordenação das prioridades e eventos.
- `src/utils/workspaceNavigation.js`: normalização e ordenação da busca.
- `test/workspaceBriefing.test.js`: regressões de identidade, ordenação, datas e imutabilidade.
- Este documento e as três capturas em `docs/redesign/`.

Editados nesta etapa:

- `src/App.jsx`: composição das visões gerais, busca, avisos compactos, skeletons, modais, notificações e recorte de foto.
- `src/components/WorkspaceDesign.css`: tokens e sistema visual compartilhado, responsividade e movimento reduzido.
- `src/components/WorkspaceSidebar.jsx` e `WorkspaceSidebar.css`: navegação, marca, busca e apresentação do menu móvel.
- `src/components/WorkspaceChrome.jsx`: cabeçalhos, indicadores, cenas e painéis compartilhados.
- `src/components/RubricView.jsx`: alternância, critérios expansíveis e radar.
- `src/components/RobotRoundsPanel.jsx`: classes para reorganizar ações no celular.
- `src/components/ScoreEvolutionChart.jsx`: cabeçalho adaptável.
- `src/components/TvModePanel.jsx`: integração com os estilos compartilhados.
- `src/views/KanbanView.jsx`: foco do compositor, layout e feedback de conclusão.
- `src/views/AgendaView.jsx`: estado acessível dos filtros.
- `src/views/PublicTeamView.jsx` e `PublicTvModeView.jsx`: apresentação do projeto e fundo coerente.
- `test/run-tests.js`: inclusão da nova suíte.

Outros arquivos já modificados no diretório pertencem à auditoria anterior. Não foi criado commit nesta etapa.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| `npm test` | 32 suítes aprovadas. |
| `npm run lint` | Concluído com código 0; apenas nota informativa do Babel sobre o tamanho preexistente de `App.jsx`. |
| `npm run build:pages` | Frontend e worker Cloudflare gerados com sucesso. Permanece o aviso de chunk PDF grande. |
| Preview do build em 5175 | HTML conferido com o `dist` atual; login móvel sem erro JavaScript; PDF, canvas, relatórios e biblioteca continuam adiados. Falha simulada do chunk inicial recuperada pelo botão de tentar novamente. |
| Matriz responsiva | 20 páginas do técnico e 12 do aluno, em 320, 768, 1024 e 1920 px: 128 combinações sem overflow da página e sem controles visíveis cortados. Rolagens internas intencionais, como Kanban, foram consideradas separadamente. |
| axe-core 4.14.0 | 32 telas em 1440 px, sem violações automáticas reportadas. Medidas adicionais do layout em 390 px. |
| Fluxos do redesign | Busca, teclado, foco, formulários, atualização em tempo real, preservação de rascunhos, rubricas, temas, menu móvel e movimento reduzido aprovados. Larguras adicionais de 390 e 1440 px verificadas nesses fluxos. |
| Modais aninhados | Recorte de foto, imagem inválida, retorno do foco, isolamento do fundo e prioridade do bloqueio da temporada aprovados. |
| Páginas públicas e TV | Vitrine em 320/390/768/1440 px; TV pública em 1920 px e interna em 1366×768; pausa e alternância dos painéis aprovadas. |
| Simulador | Ré sem inverter a frente do robô, curvas, garra, obstáculos, salvar/reabrir, ordem de saídas, reset e desfazer aprovados. |
| Loja | Combinação de três acessórios, cobrança somente dos itens novos, remoção independente, perfil compartilhado e persistência do técnico aprovados. |
| Confiabilidade | Repetidos os cenários locais de recuperação, avaliações e correções da auditoria: armazenamento indisponível, dados malformados, falha de leitura/salvamento, autenticação inicial e backup. |

Os roteiros de navegador foram executados com Playwright e Microsoft Edge em modo headless, usando o diretório local ignorado `giro-preview.local/`. Neles, Firebase e APIs foram substituídos por dados fictícios e gravações de teste em memória; chamadas externas foram bloqueadas. As novas regressões de domínio permanecem na suíte versionável em `test/`.

## Acessibilidade e limites

Foram testados teclado, Escape, navegação na busca, foco inicial e retorno, contenção do foco, menu móvel, identificação de campos, mensagens e preferência por movimento reduzido. Formulários comuns não fecham por clique acidental no fundo; a busca pode fechar dessa forma.

A ferramenta automática deixou verificações de contraste e alguns atributos/tabelas como inconclusivas. Zero violações automáticas não comprova conformidade WCAG. Leitores de tela reais, todos os estados de cada formulário e dispositivos físicos ainda precisam de avaliação manual.

Os testes não confirmam operações reais de Firebase, envio de e-mails, respostas da NVIDIA, políticas implantadas ou permissões em produção. Essas integrações foram preservadas, mas a validação foi local e isolada. Nenhuma coleção de estudantes foi alterada ou migrada por este redesign.

## Desempenho e manutenção

Não foram adicionadas dependências, fontes externas ou bibliotecas de animação. As animações são curtas, o desfoque dos modais é desativado em telas pequenas e a preferência por movimento reduzido prevalece sobre as comemorações decorativas do Giro. O playback funcional do simulador foi mantido.

O bundle principal final mede 469,37 kB (122,93 kB gzip). Não houve redução do JavaScript nesta etapa: os novos componentes também têm custo. O chunk de PDF continua grande e carregado sob demanda. Não foi executado benchmark Lighthouse ou medição de consumo em aparelho físico.

Para novos componentes, usar os tokens `--ng-*` e os componentes compartilhados. Os seletores de compatibilidade em `WorkspaceDesign.css` permitem manter as telas legadas; novas telas devem preferir classes semânticas para reduzir a dependência das classes antigas. Repetir a matriz de layout quando criar novas tabelas, ações ou campos.

Publicação no Cloudflare permanece pendente de autorização específica.
