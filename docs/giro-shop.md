# Giro e loja de personalização

O Giro é a engrenagem animada da New Gears, com espessura, face de vidro, reflexos e perspectiva para um visual com profundidade. A inclinação acompanha o mouse; movimentos de corpo, braços, pés e boca usam transições suaves. O giro especial faz uma volta completa ao redor do corpo, sem voltar girando ao contrário. Ele acompanha o painel autenticado, pode ser aberto pelo botão no canto da tela e comemora novos registros salvos pelos alunos. Ele acena, olha para os lados, mexe os pés e gira sua engrenagem; o botão **Dançar** inicia uma dança curta. No modo leve, mantém os movimentos do personagem e reduz efeitos de ambiente. A preferência do dispositivo por animações reduzidas desativa os movimentos automáticos; a dança pode ser iniciada explicitamente pelo botão e termina após 4,8 segundos. O mascote não aparece nas páginas públicas ou no modo TV independente.

As mensagens aparecem em um balão de fala. **Ouvir mensagem** lê o título, a descrição e a situação da recompensa usando a síntese de voz do navegador, com preferência por uma voz em português do Brasil. A seleção automática prioriza vozes em português do Brasil e nomes que indicam opções naturais, aprimoradas ou do Google. **Voz e ritmo** permite comparar as vozes e ajustar a velocidade de 0,80× a 1,20×; a preferência fica salva por aluno neste navegador. A altura padrão é neutra, e a leitura usa blocos de frases com pequenas pausas. A boca e as barras do balão se animam durante a fala, parando nas pausas. **Parar áudio**, fechar o balão, trocar de mensagem ou sair da sessão interrompem a leitura. O áudio só começa por um clique; as vozes e sua disponibilidade dependem do navegador e do dispositivo, sem um serviço de áudio adicional configurado no projeto. Navegadores sem essa função exibem um aviso e mantêm as mensagens em texto.

Depois de um registro, o balão também mostra uma **Dica do Giro** específica daquela atividade: como documentar um teste, aplicar uma descoberta da entrevista, completar o resultado do protótipo ou definir o próximo passo do diário. As dicas consideram os campos preenchidos e fazem parte da leitura em voz alta.

Balões abertos manualmente permanecem até serem fechados. Os avisos automáticos dão tempo para leitura e permanecem enquanto o aluno interage com o Giro, dança ou ouve uma mensagem. A tecla **Esc** fecha o balão.

## Loja

A aba **Loja New Gears** reúne 44 itens entre cores do Giro, molduras de avatar, acessórios, títulos, cenários, bancadas, iluminação, decoração e comemorações. As áreas **Minha oficina**, **Loja** e **Coleções** separam o espaço do aluno, o catálogo e os conjuntos temáticos. O técnico pode consultar tudo em modo de prévia; compras e trocas são feitas pelo próprio aluno.

Cada aluno começa com **40 Gears de boas-vindas**. Essa quantidade é inicializada uma única vez na carteira, junto da primeira recompensa, compra ou troca. Gears são moedas virtuais e não têm valor monetário. Comprar itens não altera XP, notas ou posições no ranking.

Selecione um item para experimentá-lo no provador. **Comprar e usar** desconta o preço mostrado e equipa o item na mesma transação. Itens da coleção podem ser equipados novamente sem custo. O saldo insuficiente desativa a compra; erros mantêm o saldo e o visual anteriores. Molduras e títulos aparecem no perfil, e cores e acessórios acompanham o Giro.

### Oficina e coleções

Todo aluno recebe gratuitamente a Garagem New Gears, bancada inicial, luz da garagem, placa da equipe e comemoração original. A leitura de carteiras antigas completa os novos espaços de equipamento sem alterar saldo, compras, XP ou pontos de evolução. A configuração é gravada na próxima operação normal da carteira; não é necessário executar uma migração de moedas.

O cenário em SVG mostra o Giro com os itens equipados. Os objetos e os botões permitem trabalhar na bancada, acender ou apagar a luz e explorar a decoração. O planeta gira durante a interação. Movimentos terminam após alguns segundos; o interruptor de luz é uma interação local, enquanto os itens equipados ficam salvos por aluno e entre dispositivos. Não há imagens externas ou um motor 3D adicional.

As coleções **Oficina Mecânica**, **Exploração Espacial**, **Circuito Neon** e **Espírito de Torneio** combinam nove espaços de equipamento. São permanentes, sem contagem regressiva. Cada cartão mostra as peças já possuídas e filtra o catálogo. As peças são compradas individualmente pelo preço exibido, e os estilos podem ser misturados.

### Comemorações

**Dança de palco** custa 50 Gears, **Chuva de engrenagens** custa 60 e **Troféu em festa** custa 80. A comemoração básica continua gratuita, assim como os movimentos já desbloqueados por evolução.

O provador permite **Experimentar** dentro da cena ou **Ver na tela** sem compra ou débito. A comemoração equipada é acionada depois que novos Gears são confirmados, ao aplicar personalizações e pelo botão **Comemorar** do balão. Recompensas pendentes, com erro ou já pagas não acionam uma nova comemoração. As partículas e o troféu usam uma camada sobre a tela do navegador, sem bloquear cliques, e desaparecem após 4,4 segundos. A preferência por movimentos reduzidos mantém uma exibição estática durante esse período.

O catálogo e os nove espaços de equipamento também estão refletidos no arquivo de integração `firestore.weekly-reports.rules`, incluindo a normalização de carteiras antigas. Esses blocos precisam fazer parte das regras publicadas quando o projeto usar as permissões autenticadas; o arquivo é um complemento às demais abas, não um substituto integral das regras. Os testes locais conferem preços, compras atômicas, persistência do equipamento e compatibilidade, mas não substituem testes das regras no emulador.

### Organização, expressões e visitas

**Organizar oficina** abre um editor de posições para bancada, decoração, Giro e luminária. Os marcadores funcionam com mouse, toque e setas do teclado (Shift aumenta o passo). As posições ficam limitadas ao cenário, em coordenadas independentes da resolução. **Cancelar** descarta o rascunho; **Salvar oficina** grava posições e expressão em `students/{id}.gearWorkshop`, sem modificar moedas, XP ou outros campos. Uma falha mantém o editor aberto para tentar novamente. Compras de novos itens preservam a disposição da oficina.

O aluno pode escolher as expressões **Feliz**, **Curioso**, **Concentrado**, **Surpreso** ou **Automática**. Olhos, sobrancelhas e boca mudam, e aparecem sinais de curiosidade ou descoberta. No modo automático, trabalhar na bancada indica concentração, explorar o planeta indica surpresa e comemorar indica felicidade. A escolha salva também aparece no Giro flutuante. São expressões visuais; a Giro IA ainda não foi implementada.

**Visitar oficinas** lista os outros integrantes ativos e permite buscar por nome. A galeria recebe somente nome, avatar, equipamento e configuração da oficina; não consulta carteiras de colegas nem exibe senhas, notas ou XP. Cada visita mostra o arranjo e a expressão do dono, sem controles de edição.

Os incentivos **Oficina criativa!**, **Gostei da combinação!** e **Me inspirou!** ficam em `students/{destinatario}/gearWorkshopReactions/{visitante}`. Cada aluno mantém uma reação por oficina: outra escolha substitui a anterior, e clicar na mesma opção a retira. Não há autorreação nem recompensa em moedas ou XP. O dono acompanha os totais em **Incentivos recebidos**; os ouvintes acompanham alterações em tempo real. O técnico pode visualizar, mas não reagir em nome de um aluno.

As regras de integração incluem atualizações restritas ao campo `gearWorkshop`, limites de posição, expressões válidas e a autoria das reações. Elas precisam ser incorporadas às permissões do projeto quando a autenticação estrita estiver habilitada; não foram publicadas automaticamente.

### Favoritos do menu

As estrelas da barra lateral fixam atalhos na seção **Favoritos**, sem navegar ao clicar. A ordem segue a seleção e pode ser alterada removendo e adicionando o atalho. Os favoritos ficam no navegador, separados pelo identificador da conta, sobrevivem ao recarregamento e sincronizam entre abas desse navegador. Somente menus permitidos na visão atual aparecem. Uma conta não herda os favoritos de outra; se o navegador impedir a gravação, o menu informa que a seleção vale apenas para a sessão.

## Contribuições

Registros confirmados e identificados com o ID do aluno geram recompensas integrais, sem limite diário ou por categoria. Edições e reenvios não geram novos créditos. O histórico também pode ser reconhecido pelo técnico.

| Registro | Gears por registro confirmado |
| --- | ---: |
| Programação | 12 |
| Entrevista com especialista | 20 |
| Contato com especialista | 8 |
| Versão do robô | 12 |
| Anexo do robô | 10 |
| Ação de impacto | 15 |
| Diário de bordo | 5 |
| Evolução do protótipo | 15 |
| Teste do robô | 6 |
| Check-in da equipe | 5 |

Não há teto diário de Gears nem quantidade máxima de registros recompensados por categoria. Cada contribuição recebe o valor completo uma vez. Os pontos de evolução são separados das moedas. Datas e contadores diários antigos permanecem somente como estatísticas compatíveis com as carteiras existentes.

O registro da contribuição é independente da confirmação dos Gears. Se a carteira estiver indisponível, o formulário continua salvo e o Giro informa que a recompensa está pendente. Os IDs pendentes ficam guardados no navegador do aluno; a loja oferece **Tentar receber Gears**. Repetir essa tentativa não duplica recompensas. O armazenamento local de pendências não é compartilhado entre dispositivos.

## Evolução e histórico

O Giro evolui pelos pontos acumulados das contribuições, sem gastar XP ou perder nível ao comprar itens. O valor de evolução e o de moedas seguem o valor cheio da tabela, sem teto diário. A loja mostra a barra de progresso, os desbloqueios e marcos como primeira entrevista, primeiro código e dez contribuições.

| Nível | Pontos | Desbloqueios |
| --- | ---: | --- |
| Faísca | 0 | Acenos e dança |
| Aprendiz | 40 | Giro especial e luz de energia |
| Inventor | 100 | Salto de alegria e faíscas |
| Engenheiro | 200 | Órbita de energia e expressão confiante |
| Mestre das Engrenagens | 400 | Estrelas e aura de mestre |

O técnico encontra **Conferir histórico** na loja. A operação consulta uma vez as coleções de registros, os alunos e o histórico de atividades, considerando também temporadas anteriores. Ela reconhece ID explícito, nome de autor que corresponde a um único integrante ou evento de criação que identifica um único registro. Edições, nomes ambíguos, autoria técnica e registros sem atribuição confiável não geram crédito para um aluno por suposição. A lista de pendências aparece para conferência.

Cada registro antigo ainda sem recibo recebe seu valor integral de Gears e evolução. Recompensas que foram cortadas pelo limite anterior recebem somente a diferença que faltava, preservando o valor original em `coinsBeforeUncap` e a data da correção em `uncappedAt`. Evolução já reconhecida não é contada novamente. Repetir a operação não duplica moedas nem evolução. As transações mantêm as compras, o saldo existente e os contadores estatísticos diários. Em uma falha, os créditos concluídos permanecem e uma nova conferência retoma pelos recibos.

Em **28/10/2026**, a conferência foi aplicada a 256 registros: 1.572 Gears e 1.572 pontos de evolução reconhecidos. Onze registros não tinham autoria de aluno confirmada. Mariana teve nove contribuições reconhecidas: 105 pontos, nível 3 (Inventor) e saldo de 145 Gears, incluindo os 40 iniciais. Os recibos guardam a origem da atribuição; o resumo dessa primeira conferência fica em `gearHistoryMigrations/v1`. A conferência que inclui check-ins e diferenças dos limites antigos usa `gearHistoryMigrations/v2`.

## Check-in da equipe

O check-in rende **5 Gears e 5 pontos de evolução**, com o mesmo valor para todas as opções de energia. O incentivo existente de 2 XP é mantido para um novo check-in. A participação continua disponível nos dias de treino e é única por aluno/data; essa unicidade é uma proteção contra duplicação do mesmo registro, não um teto diário de moedas.

Novos check-ins usam um ID estável por aluno/data e atualizam o check-in e os 2 XP na mesma transação. O serviço também reconhece IDs aleatórios dos check-ins antigos. O recibo de Gears é sempre `{studentId}__checkin__{date}`, impedindo crédito repetido mesmo quando há documentos antigos duplicados. A conferência retroativa considera todas as temporadas com autoria confirmada e reconhece Gears e evolução, sem conceder XP novamente.

Na segunda conferência de **28/10/2026**, foram reconhecidos **480 check-ins dos 12 alunos**, totalizando **2.400 Gears e 2.400 pontos de evolução adicionais**. Nenhum XP foi reaplicado. Mariana recebeu pelos 47 check-ins reconhecidos e passou a 380 Gears, 340 pontos de evolução e nível 4. Treze registros permaneceram sem atribuição confirmada, incluindo dois check-ins vinculados a um cadastro que não está na lista atual de alunos.

## Rascunhos e recuperação

Entrevistas, contatos, programação, versões e anexos do robô, ações de impacto, diário, protótipo, projeto, matriz de decisão, missões, agenda e formulários de testes guardam os textos e opções no navegador enquanto são preenchidos. A separação considera conta, temporada, formulário e registro em edição; no diário, considera também a semana. Botões de sugestão e campos atualizados pelo cronômetro também persistem os valores.

Ao reabrir, o formulário recupera os campos e informa **Rascunho recuperado**. O botão de lixeira descarta o rascunho. Fotos e arquivos precisam ser selecionados novamente, com um aviso dos nomes; eles não são armazenados como texto no navegador. Senhas e outros campos de autenticação não são incluídos.

Sem conexão, o formulário mantém o texto e permite tentar novamente quando a internet voltar. O rascunho só é removido após confirmação do salvamento; edições feitas durante a espera ficam preservadas. Um identificador persistente de envio evita criar outro documento ao repetir o envio de uma contribuição após resposta interrompida. Um erro de armazenamento local é informado sem prometer recuperação. Rascunhos não sincronizam entre dispositivos e podem ser perdidos ao limpar os dados do navegador.

## Dados e publicação

As carteiras ficam em `studentGearProfiles/{studentId}` e os recibos em `studentGearRewards/{studentId}__{type}__{sourceId}`. `growthPoints` e `contributionCounts` guardam a evolução da carteira, e cada recibo também guarda seus pontos reconhecidos. Essas coleções e `gearHistoryMigrations` integram o backup compartilhado e permanecem entre temporadas. A aparência equipada é copiada para `students/{studentId}.gearAppearance` na mesma transação da carteira; XP e outros campos do aluno não são sobrescritos.

Há um único ouvinte da carteira do aluno conectado. As reações partem dos formulários que acabaram de salvar, sem observar todas as coleções ou consultar o histórico para descobrir registros novos.

No ambiente com Firebase Auth, integre os blocos dessas três coleções de `firestore.weekly-reports.rules` às regras publicadas. As regras verificam o integrante ativo, a carteira do próprio aluno, os preços do catálogo, a posse dos itens, a relação entre saldo e gastos, os recibos únicos e os valores integrais por contribuição. O reconhecimento histórico é restrito ao técnico e não autoriza compras nas carteiras de alunos. Regras globais permissivas devem excluir essas coleções. As permissões existentes de `students` também devem permitir atualizar a aparência do próprio aluno e impedir mudanças indevidas de autoria dos registros. Esses blocos não foram publicados por esta alteração e precisam ser conferidos no ambiente de destino.

Ao mudar preços, catálogo ou limites, atualize juntos `src/utils/gearShop.js` e os valores correspondentes no arquivo de regras. Execute `npm test` e `npm run build`. As suítes `gearShop`, `gearEvolution`, `formDrafts`, `gearCheckIn` e `giroSpeech` cobrem saldo, compras, limites, autoria, retroativo, repetição, recuperação e falhas. A conferência no Chrome também cobre restauração de campos controlados, isolamento por aluno, falta de rede, edição durante envio e layout móvel. Esses testes não substituem a validação das regras no ambiente Firebase.

As vozes são as disponibilizadas pelo navegador e pelo dispositivo; uma voz remota pode precisar de internet. A seleção por nome é uma preferência heurística, não uma garantia de qualidade neural. Não há chave de serviço de voz externo configurada no projeto. Referência: [vozes da Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice).
