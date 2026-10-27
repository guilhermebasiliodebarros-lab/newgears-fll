# Giro e loja de personalização

O Giro é a engrenagem animada da New Gears. Ele acompanha o painel autenticado, pode ser aberto pelo botão no canto da tela e comemora novos registros salvos pelos alunos. Ele acena, olha para os lados, mexe os pés e gira sua engrenagem; o botão **Dançar** inicia uma dança curta. No modo leve, mantém os movimentos do personagem e reduz efeitos de ambiente. A preferência do dispositivo por animações reduzidas desativa os movimentos automáticos; a dança pode ser iniciada explicitamente pelo botão e termina após 4,8 segundos. O mascote não aparece nas páginas públicas ou no modo TV independente.

As mensagens aparecem em um balão de fala. **Ouvir mensagem** lê o título, a descrição e a situação da recompensa usando a síntese de voz do navegador, com preferência por uma voz em português do Brasil. A boca e as barras do balão se animam durante a fala. **Parar áudio**, fechar o balão, trocar de mensagem ou sair da sessão interrompem a leitura. O áudio só começa por um clique; as vozes e sua disponibilidade dependem do navegador e do dispositivo, sem um serviço de áudio adicional configurado no projeto. Navegadores sem essa função exibem um aviso e mantêm as mensagens em texto.

Balões abertos manualmente permanecem até serem fechados. Os avisos automáticos dão tempo para leitura e permanecem enquanto o aluno interage com o Giro, dança ou ouve uma mensagem. A tecla **Esc** fecha o balão.

## Loja

A aba **Loja New Gears** reúne 21 itens entre cores do Giro, molduras de avatar, acessórios do mascote e títulos de perfil. O técnico pode consultar a loja em modo de prévia; compras e trocas são feitas pelo próprio aluno.

Cada aluno começa com **40 Gears de boas-vindas**. Essa quantidade é inicializada uma única vez na carteira, junto da primeira recompensa, compra ou troca. Gears são moedas virtuais e não têm valor monetário. Comprar itens não altera XP, notas ou posições no ranking.

Selecione um item para experimentá-lo no provador. **Comprar e usar** desconta o preço mostrado e equipa o item na mesma transação. Itens da coleção podem ser equipados novamente sem custo. O saldo insuficiente desativa a compra; erros mantêm o saldo e o visual anteriores. Molduras e títulos aparecem no perfil, e cores e acessórios acompanham o Giro.

## Contribuições

Somente novos registros confirmados e identificados com o ID do aluno geram recompensas. Edições não geram novos créditos. O Giro continua reconhecendo as contribuições mesmo quando o limite de moedas já foi alcançado.

| Registro | Gears por registro | Registros recompensados por dia |
| --- | ---: | ---: |
| Programação | Até 12 | 2 |
| Entrevista com especialista | Até 20 | 2 |
| Contato com especialista | Até 8 | 2 |
| Versão do robô | Até 12 | 2 |
| Anexo do robô | Até 10 | 2 |
| Ação de impacto | Até 15 | 2 |
| Diário de bordo | Até 5 | 1 |
| Evolução do protótipo | Até 15 | 2 |

O limite total é de **60 Gears por dia**, no horário de São Paulo. A última recompensa do dia pode ser parcial. Um recibo único por aluno, tipo e ID do registro impede créditos repetidos, inclusive depois da virada do dia. Registros antigos não são percorridos ou recompensados automaticamente.

O registro da contribuição é independente da confirmação dos Gears. Se a carteira estiver indisponível, o formulário continua salvo e o Giro informa que a recompensa está pendente. Os IDs pendentes ficam guardados no navegador do aluno; a loja oferece **Tentar receber Gears**. Repetir essa tentativa não duplica recompensas. O armazenamento local de pendências não é compartilhado entre dispositivos.

## Dados e publicação

As carteiras ficam em `studentGearProfiles/{studentId}` e os recibos em `studentGearRewards/{studentId}__{type}__{sourceId}`. Essas coleções integram o backup compartilhado e permanecem entre temporadas. A aparência equipada é copiada para `students/{studentId}.gearAppearance` na mesma transação da carteira; XP e outros campos do aluno não são sobrescritos.

Há um único ouvinte da carteira do aluno conectado. As reações partem dos formulários que acabaram de salvar, sem observar todas as coleções ou consultar o histórico para descobrir registros novos.

No ambiente com Firebase Auth, integre os blocos dessas duas coleções de `firestore.weekly-reports.rules` às regras publicadas. As regras verificam o integrante ativo, a carteira do próprio aluno, os preços do catálogo, a posse dos itens, a relação entre saldo e gastos, os recibos únicos e os limites diários. Regras globais permissivas devem excluir essas coleções. As permissões existentes de `students` também devem permitir atualizar a aparência do próprio aluno e impedir mudanças indevidas de autoria dos registros. Esses blocos não foram publicados por esta alteração e precisam ser conferidos no ambiente de destino.

Ao mudar preços, catálogo ou limites, atualize juntos `src/utils/gearShop.js` e os valores correspondentes no arquivo de regras. Execute `npm test` e `npm run build`. A suíte `gearShop` usa transações em memória e cobre saldo, compras, posse, limites, repetição e falhas; ela não substitui os testes das regras publicadas no Firebase.
