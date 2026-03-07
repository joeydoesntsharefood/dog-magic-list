# Diretrizes Gemini - Dog Magic List

Este documento define as regras de desenvolvimento e conduta para o agente Gemini neste projeto.

## 1. Metodologia TDI & Qualidade (MANDATÓRIO)
O desenvolvimento segue o ciclo: **Testes Unitários -> Implementação -> Refatoração -> Testes de Integração.**
*   **VALIDAÇÃO OBRIGATÓRIA:** Após **QUALQUER** alteração de código, o agente deve obrigatoriamente executar:
    1.  `npm run typecheck` (ou `tsc --noEmit`) para garantir integridade de tipos.
    2.  `npm run test` para garantir que não houve regressões comportamentais.
*   Nenhuma tarefa é considerada concluída sem o log de sucesso de ambos os comandos.

## 2. Padrões Tecnológicos
*   **Stack:** Electron (Frontend), Node.js/Fastify (Backend), React, TypeScript, Tailwind CSS v4.
*   **Comunicação:** API REST local (`http://localhost:3001`). 
*   **Dados:** SQLite para persistência das listas de usuários.
*   **Imagens:** Consumo direto via API do Scryfall (sem cache local).
*   **Interface:** Estética "D2D Terminal" (Monoespaçada, Minimalista, Dark).

## 3. UI & Design
*   **Temas:** Seguir a paleta oficial (`assets/pallet.json`) e o sistema de temas em `src/themes.ts`.
*   **Identidade:** Logo em Splash Screen com efeito Glitch e Matrix Rain.
*   **Feedback:** Notificações nativas do sistema e Toasts na UI para erros/sucessos.

## 4. Metas
*   Suporte a múltiplas versões de cartas com tabelas de preços detalhadas.
*   Busca multilíngue e resiliente (fuzzy/search).
*   Marketplace em tempo real via Puppeteer com sistema de cache.
