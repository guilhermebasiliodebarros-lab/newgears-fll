# Estabilidade da navegação

Revisão de 29/10/2026. A falha de tela vazia foi reproduzida localmente ao receber uma tarefa cujo `author` era um objeto: `task.author.split is not a function`. Sem uma barreira de erro, o React removia todo o conteúdo de `#root`. Isso demonstra uma causa possível; não foi feita inspeção dos registros privados da produção para afirmar que eram os mesmos dados.

## Correções

- Tarefas e eventos são normalizados na leitura, incluindo textos, participantes, históricos, datas ISO e Timestamp do Firestore. A normalização não regrava documentos nem recibos de Gears. As transações continuam validando os documentos originais.
- Listas e campos ausentes do planejamento recebem valores seguros para exibição. Nomes e XP inválidos de integrantes não derrubam as telas.
- Cada área do espaço de trabalho tem recuperação de erros, mantendo o menu disponível. Mudar de área reinicia a recuperação; também é possível tentar novamente ou voltar à visão geral. Uma proteção na raiz cobre falhas no restante da interface.
- Falhas de módulos carregados sob demanda exibem instruções para atualizar. Não há recarga automática em loop. A página HTML oferece uma opção de recuperação mesmo se o JavaScript inicial falhar.
- Preferências e sessão usam uma alternativa em memória quando o armazenamento está bloqueado ou cheio, com aviso de que esses dados ficam apenas na aba. Rascunhos de formulários mantêm suas próprias verificações de persistência.
- Cartões do Kanban preservam sua identidade entre renderizações. Isso evita perda de foco e reinício da edição de Gears durante atualizações em tempo real. O movimento de elevação no hover foi removido porque provocava oscilação na posição dos controles.
- Criação e edição sinalizam o salvamento e impedem cliques repetidos enquanto aguardam. Falhas de edição mostram uma mensagem e mantêm o texto digitado. A associação visual com participantes usa correspondência exata.
- A lista de missões acompanha também snapshots vazios, sem manter missões já removidas.

## Validação

- `npm test`: 27 suítes, incluindo regressões para registros incompletos, calendário, planejamento, recibos preservados e armazenamento indisponível.
- ESLint passou nos módulos novos e nos componentes revisados de Avaliações, chamada, Kanban e Reta final. A análise geral ainda aponta pendências anteriores no arquivo principal, Vitrine e outros arquivos, sobretudo efeitos e variáveis sem uso; o lint geral não está zerado.
- Navegação no Edge/Playwright, com Firestore simulado e gravações externas bloqueadas: duas passagens pelas 20 áreas do técnico e 12 áreas do aluno, com busca e recebimento de tarefas incompletas.
- Edição contínua e foco do cartão, preservação do valor de Gears após snapshots, erro de salvamento com texto mantido, dados incompletos de agenda/alunos/rodízio e menu em 390 px e 1440 px.
- Falha de renderização de uma área, falha na raiz, falha de módulo do robô, falha no módulo inicial, quota esgotada e bloqueio de acesso ao armazenamento: recuperação testada sem tela vazia.
- Bundle de produção servido localmente: login em tela móvel e recuperação após bloquear o carregamento de um arquivo JavaScript.
- `npm run build:pages`: gera `dist` com o site e o worker de Cloudflare Pages. A publicação de `dist` é necessária para levar as correções ao endereço público.

Os testes não alteraram os registros da equipe em produção. Não há garantia de ausência de novos defeitos; as proteções tornam erros de renderização e carregamento visíveis e recuperáveis.

## Varredura ampliada: Avaliações e formulários

O cálculo anterior do calendário levou 5.483 ms com 600 avaliações, 20 alunos e 37 semanas no teste local. O índice por semana e a reutilização do formatador de datas reduziram o mesmo cálculo para 13–45 ms nas verificações, já incluindo normalização e resolução de duplicatas. Esses números medem o cálculo local, sem a transferência de dados pela rede.

- As avaliações são consultadas por temporada e perfil, com estado de carregamento, erro e botão de recuperação. A troca de temporada invalida imediatamente o conjunto anterior. As consultas antigas são desligadas, e seus callbacks ficam protegidos.
- Ranking, gráfico e calendário usam a atualização mais recente de cada avaliação. Campos inválidos recebem tratamento explícito; uma avaliação sem total nem notas utilizáveis continua pendente. As versões históricas dos critérios permanecem preservadas.
- Rascunhos antigos são validados na restauração. Textos digitados enquanto uma avaliação está sendo enviada continuam no rascunho após a confirmação, inclusive depois de recarregar. As notas dos relatórios preservam o texto ainda em edição.
- Os envios de avaliações são serializados; o calendário fica bloqueado durante o envio. A lista de prontidão ganhou recuperação própria e identificação do contexto de leitura.
- Painéis internos de disciplina, avisos e conquistas agora renderizam com identidade estável. A chamada usa diretamente seu componente estável.
- A chamada tolera a chegada de um novo aluno com o formulário aberto, preserva observações e inclui o novo integrante no envio. Notas de presença inválidas não viram presenças ou faltas automaticamente nos resumos.
- A Reta final acompanha atualizações do servidor quando não há edição local. Alterações locais das configurações da Vitrine sobrevivem a snapshots novos.
- Robô, garras, códigos, missões, projeto, protótipo, impactos, diário e histórico recebem normalização de seus campos de exibição. Valores numéricos em texto são convertidos antes das somas de pontos, tempo e pessoas alcançadas.
- O lint passou a ignorar os artefatos locais de teste e a reconhecer o ambiente Node nos testes e serviços. Isso remove diagnósticos de ambiente incorreto. As regras de React continuam ativas; ainda há pendências anteriores em partes do arquivo principal e em outros componentes.

Validação adicional: notas semanais, apresentações e relatórios; restauração de rascunhos malformados; edição durante envio; falha de envio com preenchimento preservado; datas Timestamp no feedback do aluno; falhas de leitura e recuperação; separação por temporada; atualização do elenco durante a chamada; edição de Vitrine durante snapshots; duas passagens pelas 32 áreas e pelas quatro trilhas de Estratégia com documentos incompletos e mistos. As gravações desses testes foram simuladas localmente.
