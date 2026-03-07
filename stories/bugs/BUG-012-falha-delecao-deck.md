# BUG-012: Falha na Deleção de Deck (Confirm & Fetch Error)

## Descrição:
Ao tentar excluir um deck da lista principal, o usuário enfrentou:
1.  **Interface Inadequada:** Uso de `window.confirm()` que abria fora do container Electron.
2.  **Erro de Deleção:** Erro no backend (provavelmente violação de chave estrangeira ou cascade inativo).
3.  **Fail Fetch:** Erro de rede ou indisponibilidade do backend durante a tentativa.

## Análise Técnica:
*   **Banco de Dados:** SQLite por padrão não ativa `foreign_keys`. Se o cascade for definido no `CREATE TABLE` mas o PRAGMA não for enviado na conexão, a deleção de uma `list` falha se houver `deck_cards` associados.
*   **UX:** O botão de deletar não oferecia feedback de "certeza", disparando diretamente o diálogo do sistema.
*   **Estabilidade:** A falta de IDs únicos estáveis no Wizard causava erros de índice ao manipular o deck em estados filtrados.

## Correções Realizadas:
1.  **Backend (Estabilidade):**
    *   Ativado `PRAGMA foreign_keys = ON` na conexão do `better-sqlite3`.
    *   Refatorado `DeckRepository.deleteDeck` para usar uma transação que limpa `deck_cards` explicitamente antes de remover a `list` (garantia dupla).
    *   Melhorado o logging de erro para retornar mensagens específicas via JSON.
2.  **Frontend (UX & Segurança):**
    *   Implementado padrão **Double-Click/Confirmation State** no botão:
        *   1º Clique: Muda o texto para `[CONFIRM_ERASE?]` e aplica estilo de alerta.
        *   2º Clique: Dispara o `fetch`.
        *   `onMouseLeave`: Reseta o estado para evitar deleções acidentais.
    *   Substituído `confirm()` por estado interno do React.
    *   Adicionado tratamento de erro visual que exibe a mensagem real vinda do backend.
3.  **Wizard (Consistência):**
    *   Introduzido `uid` (nanoid-like) para cada carta adicionada, garantindo que remoções e trocas de versão funcionem corretamente mesmo com filtros ativos.

## Status:
- **Verificado:** Diagnóstico via script `repro_delete_error.ts` confirmou que a lógica de repositório agora funciona sem erros de restrição.
- **Implementado:** Código mergeado e testado com Vitest.
