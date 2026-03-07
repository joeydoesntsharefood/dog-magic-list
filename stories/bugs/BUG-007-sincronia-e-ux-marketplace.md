# BUG-007: Problemas de Sincronia no Marketplace e Otimização de UX

## Descrição:
1.  **Falso Positivo de Dados:** Ao clicar em "Ver Ofertas", o backend retorna rapidamente um array vazio antes do Puppeteer finalizar ou se o container não carregar a tempo, deixando a UI em um estado inconsistente.
2.  **UX de Carregamento:** O sistema exige que o usuário clique em um botão mesmo quando os dados já existem no cache local.

## Análise Técnica:
*   **Corrida Crítica:** O Fastify pode estar finalizando a request se o Scraper não bloquear corretamente a execução ou se o tratamento de erro no backend retornar um objeto vazio por padrão.
*   **Limpeza Preventiva:** É necessário garantir que, se não houver dados válidos, o registro no banco não seja criado (ou seja limpo) para forçar uma nova tentativa limpa.
*   **Auto-fetch:** A UI deve disparar a chamada de ofertas automaticamente no `useEffect` ao selecionar uma carta, caso o cache seja válido, ocultando o botão principal.

## Melhorias Planejadas:
1.  **Backend:** Garantir que o Scraper só retorne se encontrar ao menos 1 oferta ou atingir o timeout real (bloqueando a resposta).
2.  **Frontend:**
    *   Implementar auto-carregamento de ofertas ao selecionar carta.
    *   Esconder botão "Ver Ofertas" se `offersData` existir, exibindo apenas o ícone de refresh.
    *   Tratamento visual para "Nenhuma oferta encontrada" apenas após confirmação do scraper.

## Status Atual:
- **Registrado:** Aguardando instrução para implementação.
