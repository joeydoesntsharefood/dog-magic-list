# BUG-009: Vazamento de Estado entre Sessões do Wizard

## Descrição:
Ao sair do Deck Wizard e retornar para criar um novo registro, os cards selecionados na sessão anterior permanecem na lista. O estado do Wizard não é reiniciado ao mudar de aba ou ao finalizar um deck.

## Análise Técnica:
*   O estado `wizardDeck` e `deckProfile` são mantidos no componente `App` e não possuem um trigger de reset automático quando o `wizardStep` volta a zero ou quando o usuário troca para a aba `inventory`.

## Correção Necessária:
1.  Implementar uma função `resetWizard()` que limpa `wizardDeck`, `deckProfile` e reseta `wizardStep`.
2.  Chamar esta função sempre que o usuário clicar em `[+ NEW_GRIMOIRE]` ou completar a gravação de um deck.

## Status:
- **Registrado:** Aguardando correção.
