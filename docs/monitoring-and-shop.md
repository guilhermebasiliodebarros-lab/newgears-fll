# Estabilidade, carregamento, visual e loja

## Monitoramento de erros

O monitoramento começa antes de o aplicativo abrir. Ele captura falhas de JavaScript, rejeições sem tratamento, erros das telas protegidas e falhas de carregamento de módulos. Os leitores de dados principais e de avaliações também registram erros de conexão ou permissão.

Em **Evolução → Estabilidade**, o técnico pode consultar até 40 ocorrências recentes deste navegador, reenviar registros pendentes, baixar o registro técnico ou limpar o histórico local. Falhas iguais em um intervalo de um minuto são agrupadas. O envio é automático, tem prazo de seis segundos e até três tentativas por registro; reconectar ou reenviar manualmente permite novas tentativas. A indisponibilidade do monitoramento não interrompe o aplicativo.

Os registros contêm código da falha, área, categoria do perfil, data, versão, família do navegador, categoria do dispositivo e até três referências de arquivos de código. O texto original da exceção, nomes, identificadores dos alunos, senhas, notas, conversas, chaves e URLs de requisições não são enviados. O servidor valida os campos e limita tamanho e frequência dos registros.

### Publicação e histórico compartilhado

`npm run build:pages` gera `dist`, incluindo o Worker que atende `/api/diagnostics`. A rota também está em `public/_routes.json`. É necessário publicar essa versão completa no Cloudflare Pages para o envio funcionar no endereço público.

Por padrão, cada ocorrência recebida é registrada nos logs do Worker como `newgears_client_issue`. Quando as variáveis privadas `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` já estão configuradas no servidor, o Worker também grava o histórico na coleção `clientDiagnostics`. Não coloque essas credenciais no código do navegador. Sem essa configuração, o recebimento nos logs continua funcionando, mas não há histórico persistente compartilhado no painel.

A consulta **Outros computadores** exige uma sessão Firebase Auth do técnico, com o papel de administrador validado pelo servidor, além da configuração de acesso ao Firestore. O acesso legado por usuário e senha locais não autoriza essa consulta. O painel informa essa condição; a captura local e o envio automático continuam disponíveis. Nenhuma regra pública de escrita no Firestore foi adicionada.

## Carregamento e visual

Relatórios, destinatários, histórico de temporadas, administração da vitrine, biblioteca do Giro e páginas públicas são carregados quando abertos. Backup, lembretes e monitoramento também têm módulos próprios. O leitor de PDF fica separado do carregamento inicial. As telas exibem uma indicação enquanto seus módulos carregam.

As assinaturas usadas nos resumos do painel de visão geral só ficam ativas enquanto esse painel está aberto; os formulários de robô continuam solicitando os dados necessários quando abertos pela barra de ferramentas. A loja mostra 12 itens por página e mantém os 58 itens acessíveis pelos filtros e pela paginação.

O tema compartilhado padroniza bordas, cantos, campos, estados de foco, títulos e painéis, preservando o tema escuro e os recursos existentes. Os componentes novos usam os mesmos controles e estados de carregamento, erro e lista vazia.

## Provador e desejos

O provador permite misturar peças de várias categorias e experimentar uma coleção completa. A prévia não altera o perfil nem o saldo. **Comprar e usar** compra somente a peça selecionada; **Equipar item** aplica somente essa peça já adquirida. **Voltar ao meu Giro** limpa as alterações da prévia.

O coração dos itens e **Guardar conjunto nos desejos** alimentam a aba **Desejos**. Cada perfil tem sua própria lista neste navegador. Ela permanece após recarregar a página; não sincroniza entre computadores. Se o armazenamento estiver bloqueado ou cheio, a lista fica na memória da aba e aparece um aviso.

O primeiro desejo ainda não adquirido é o objetivo atual. **Meu objetivo** permite escolher outro. A barra usa o saldo disponível e o preço atual; a lista também mostra quanto falta para cada item e para o conjunto de desejos pendentes. Itens já comprados não entram no custo restante.

## Verificação

As suítes `shopExperience` e `clientDiagnostics` cobrem isolamento das listas, normalização, metas, prévia sem mutação, coleções completas, remoção de dados privados do registro, validação de entrada, limite de requisições e autorização da consulta central. As verificações no navegador usam dados simulados, sem compras ou alterações no banco real.
