# F01: Core de Gestão de Cartas e Listas

Este módulo é o coração da aplicação, permitindo a gestão de inventário, wishlists e a comunicação inicial com APIs de cartas.

## US01.1: Criação e Gestão de Listas (CRUD)
**Descrição:** Como jogador de MTG, desejo criar, renomear e excluir diferentes listas (Decks, Wishlists, Trade) para organizar minha coleção.

### Critérios de Aceite (AC):
1.  O usuário deve conseguir criar uma nova lista com nome único.
2.  A lista deve persistir no SQLite local via IPC.
3.  O usuário deve conseguir editar o nome de uma lista existente.
4.  A exclusão de uma lista deve remover todas as suas associações de cartas no banco de dados.

### Estratégia TDI:
*   **Teste Unitário (Backend):** Validar funções do repositório SQLite para insert, update e delete de listas.
*   **Teste Unitário (Frontend):** Mockar as chamadas IPC para garantir que a UI envia o payload correto.
*   **Teste de Integração:** Criar uma lista via UI e validar se o registro existe no arquivo SQLite local.

---

## US01.2: Busca de Cartas por Nome (API Externa)
**Descrição:** Como usuário, desejo buscar cartas pelo nome para adicioná-las às minhas listas.

### Critérios de Aceite (AC):
1.  A busca deve ser disparada ao digitar (debounce) ou ao pressionar enter.
2.  Deve retornar uma lista de sugestões com imagem e nome da carta (utilizando API como Scryfall/MtgApi).
3.  Se a carta for selecionada pela primeira vez, disparar o evento assíncrono para cache local e upload para o Google Drive.

### Estratégia TDI:
*   **Teste Unitário (Service):** Validar o parse da resposta da API externa para o modelo interno.
*   **Teste de Integração:** Simular o fluxo de busca e validar se o evento de "cache_image" foi enviado para a fila do RabbitMQ.

---

## US01.3: Cálculo de Valor Aproximado da Lista
**Descrição:** Como usuário, desejo ver o valor total estimado da minha lista para planejar minhas compras.

### Critérios de Aceite (AC):
1.  O sistema deve somar o valor de mercado (cached) de todas as cartas na lista.
2.  Se o valor de uma carta estiver desatualizado (> 24h), marcar para re-fetch automático em background.
3.  Apresentar o valor total na moeda local (BRL) utilizando a paleta de cores definida para destaque.

### Estratégia TDI:
*   **Teste Unitário:** Validar a função de soma com diferentes quantidades e estados de preço (null/zero).
*   **Teste de Integração:** Verificar se o valor da UI é atualizado após um evento bem-sucedido de atualização de preço vindo do backend.
