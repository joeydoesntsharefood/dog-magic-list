# BUG-010: Ausência de Funcionalidade de Remoção no Wizard

## Descrição:
Uma vez que uma carta é adicionada ao grid de construção (`CURRENT_DECK_REGISTRY`), não há como removê-la ou diminuir sua quantidade. O usuário é forçado a resetar o Wizard se cometer um erro de adição.

## Análise Técnica:
*   O estado `wizardDeck` permite apenas adições via `handleAddCardToWizard`. Falta uma função disparada pela UI para filtrar o array e remover itens.

## Correção Necessária:
1.  Implementar `handleRemoveCardFromWizard(index: number)` para remover um item específico.
2.  Adicionar um botão de exclusão (`[X]` ou `[DELETE]`) em cada linha do registro do deck.
3.  Estilizar o botão seguindo a paleta `tattoo-red` para manter a consistência D2D Terminal.

## Status:
- **Registrado:** Aguardando implementação.
