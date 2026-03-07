# BUG-001: Desalinhamento Arquitetural (Comunicação e Responsabilidades)

## Descrição:
O agente implementou erroneamente a aplicação principal (Electron Main) dentro da pasta `back` e utilizou a ponte IPC (IDP) para comunicação direta entre processos no mesmo contexto de execução do Electron. Além disso, o Front foi configurado apenas como o processo Renderer.

## Correção Necessária:
1.  **Ajuste de Responsabilidade:** O Electron (Main + Renderer) deve residir no módulo `front`.
2.  **Ajuste de Comunicação:** O módulo `back` deve ser um processo Node.js/TypeScript independente que sobe uma **API REST** (Express/FastAPI style em Node) rodando em `localhost`.
3.  **Ajuste de Orquestração:** O Electron (`front`) deve ser o responsável por iniciar/spawnar o processo do backend (`back`) ao ser executado.
4.  **Ajuste de Dados:** A camada `db` deve ser consumida exclusivamente pelo processo de `back`, servindo os dados via API para o `front`.

## Impacto:**
-   Necessário mover `main.ts` e `preload.ts` para `applications/front/electron`.
-   Configurar servidor REST (Nest.Js/Fastify/Typescript) em `applications/back`.
-   Atualizar testes TDI para validar chamadas via `fetch` (ou `axios`) em vez de `window.api`.
