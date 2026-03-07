# US04 - Central de Ativos (My Library)

## Descrição:
Como um colecionador e jogador, quero manter um registro digital das cartas físicas que possuo em minha coleção (Biblioteca), para que eu possa consultar meu estoque antes de realizar novas compras no marketplace.

## Critérios de Aceitação:
1.  **Tab "LIBRARY":** Uma nova aba no menu lateral esquerdo denominada `[04] LIBRARY`.
2.  **Interface de Adição:** O usuário deve poder buscar cartas (via Scryfall API como no Wizard) e adicioná-las à biblioteca definindo a quantidade.
3.  **Persistência:** As cartas da biblioteca devem ser salvas em uma nova tabela SQLite `library_cards`.
4.  **Visualização em Grade:** Exibição das cartas possuídas com imagem (ao passar o mouse ou clique), nome, edição e quantidade total.
5.  **Gestão de Quantidade:** Botões `[+]` e `[-]` rápidos para atualizar o estoque de uma carta já registrada.
6.  **Filtro de Busca Local:** Barra de filtro para encontrar cartas dentro da própria biblioteca por nome.

## Requisitos Técnicos:
*   **Database:** Nova tabela `library_cards` com colunas: `id`, `card_id` (Scryfall ID), `name`, `set_name`, `image_url`, `quantity`.
*   **Backend:**
    *   `GET /library`: Retorna todas as cartas da coleção.
    *   `POST /library`: Adiciona ou incrementa uma carta.
    *   `PATCH /library/:id`: Atualiza a quantidade.
    *   `DELETE /library/:id`: Remove a carta da coleção.
*   **Frontend:** Novo estado `library` e componente de grid similar ao `DECK_REGISTRY` do Wizard, mas com foco em inventário.

## Impacto Futuro (Roadmap):
*   Integrar ao Wizard para exibir o badge `[OWNED]` em cartas que o usuário já possui na biblioteca durante a construção de um deck.

## Status:
- **Definido:** Aguardando implementação da infraestrutura de banco e UI.
