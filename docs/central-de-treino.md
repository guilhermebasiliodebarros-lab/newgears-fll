# Central de treino e melhorias de interface

Implementado em 18/11/2026 no projeto local.

## O que mudou

- Entrada com a identidade New Gears, ilustração vetorial leve, acesso público e layout adaptável. Campos com rótulos associados, preenchimento pelo gerenciador de senhas, mostrar/ocultar senha e ajuda de primeiro acesso.
- Visão geral com hierarquia mais clara, destaque para atrasos e acesso à tarefa escolhida. O indicador de integrantes ativos agora exclui perfis inativos.
- Central de treino disponível no menu do técnico e do aluno, na busca Ctrl/Cmd+K e no novo convite da visão geral.
- Ícone da equipe na aba, título e descrição próprios. A tela inicial de carregamento acompanha o fundo escuro.

## Como usar a Central de treino

1. Abra **Central de treino** no menu principal.
2. Escolha Robô, Programação, Inovação ou Apresentação. Cada frente tem orientações e checklist próprios.
3. Escreva um objetivo verificável e reserve 10, 15, 25, 30, 45 ou 60 minutos.
4. Comece o treino. É possível pausar e continuar. O tempo usa um horário de término, por isso continua ao navegar para outra área e recupera corretamente após recarregar a página.
5. Marque os passos e anote resultados e próximos testes. As anotações são opcionais e podem ser feitas durante o treino.
6. Clique em **Concluir e registrar**. O fim do cronômetro pede uma reflexão; não cria um registro automaticamente. Também é possível concluir antes do tempo planejado.
7. Consulte os aprendizados no histórico ou clique em **Exportar** para baixar um arquivo de texto. O atalho do diário abre a área existente para compartilhar o resultado com a equipe.

No celular, o planejamento aparece antes do cronômetro, seguido do checklist e dos aprendizados. Controles de tempo e de frente ficam protegidos contra mudanças acidentais após o início. Os cronômetros de round existentes continuam na área do robô.

## Dados e limites

Os treinos são pessoais e locais: rascunho, sessão atual e últimos 20 registros ficam no armazenamento do navegador, separados pela identidade do perfil e pela temporada. Eles não sincronizam entre dispositivos nem são enviados ao Firebase. Limpar os dados do navegador também remove esses registros; a exportação permite guardar uma cópia. Se o armazenamento estiver bloqueado, o aviso global existente informa a limitação.

O histórico conta somente o tempo de foco consumido, descontando pausas e tempo restante ao encerrar. Os indicadores mostram apenas os registros retidos neste dispositivo. A exportação inclui objetivo, duração planejada e utilizada, checklist e aprendizados.

## Conferência

- `npm test`: inclui cenários de expiração, pausa, retomada, recarga, início sem objetivo, conclusão duplicada, dados corrompidos, separação por chave e limite do histórico.
- `npm run build`: compila o aplicativo e carrega a Central de treino sob demanda.
- `test/fixtures/training-hub.html`: cenário de interface com dados fictícios, troca de perfis e os componentes reais. Não importa Firebase nem faz chamadas às APIs da equipe.

A revisão no navegador conferiu pausa, recarga, navegação durante a contagem, troca de perfil, conclusão, leitura do aprendizado e download. As larguras de 320 e 390 px não apresentaram rolagem horizontal. O tema dourado e o controle de visibilidade da senha também foram verificados. A entrada autenticada e operações no banco de produção não fizeram parte dessa conferência.

Capturas da interface (a Central de treino usa dados fictícios):

- [Entrada no computador](central-treino/acesso-desktop.jpg).
- [Entrada no celular](central-treino/acesso-celular.jpg).
- [Central de treino no computador](central-treino/central-desktop.jpg).
- [Central de treino no celular](central-treino/central-celular.jpg).

## Próximas possibilidades

As seguintes ideias ficam como evolução futura, sem integração nesta etapa:

- Sincronizar sessões e compartilhar um resumo de treino com a equipe, usando as permissões e os registros já existentes.
- Vincular o objetivo a uma tarefa e levar o aprendizado diretamente para um rascunho no diário.
- Comparar consistência de saídas, além da melhor pontuação, com os registros reais dos rounds.
- Transformar feedbacks de avaliação em próximos treinos sugeridos, sem criar novas obrigações automaticamente.
