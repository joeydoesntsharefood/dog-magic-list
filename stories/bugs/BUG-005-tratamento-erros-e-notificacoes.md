# BUG-005: Tratamento de Erros e Notificações do Sistema

## Descrição:
Erros de busca (ex: 404 ao procurar "Prefeito") ou falhas de conexão estão sendo exibidos via `alert` ou apenas no console. É necessário um sistema de feedback visual mais integrado à UI (Toasts/Alerts estilizados) e a implementação de notificações nativas do sistema operacional para eventos críticos ou conclusões de tarefas.

## Análise Técnica:
1.  **Erro 404 (Busca):** O endpoint `exact` do Scryfall é muito rígido. Se o usuário digitar um nome parcial ou em português que não seja uma tradução exata aceita, ele retorna 404.
2.  **Feedback Visual:** Atualmente usamos `alert()`, o que quebra a experiência do usuário e não segue a paleta de cores.
3.  **Notificações Nativas:** O Electron permite disparar notificações do sistema via `Notification` API (Web ou Electron Main). Precisamos expor isso para o front ou usar a API padrão do browser que o Electron suporta.

## Correções Necessárias:
1.  **Backend (Search Logic):** Alterar o parâmetro de `exact` para `fuzzy` na API do Scryfall para ser mais resiliente a erros de digitação ou nomes parciais.
2.  **Frontend (Toasts/Notifications):** 
    *   Implementar um sistema de "Toasts" (notificações em tela) usando a paleta `tattoo-red` para erros e `aged-bronze` para sucessos.
    *   Integrar a API de Notificações do Sistema para avisar quando um preço for encontrado ou se houver erro crítico.

## Impacto:**
-   Experiência do usuário mais fluida.
-   Redução de frustração ao pesquisar cartas com nomes parciais.
-   Comunicação proativa da aplicação mesmo quando minimizada.
