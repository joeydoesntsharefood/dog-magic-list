# BUG-004: Conflito de Escopo ESM vs CommonJS no Electron

## Descrição:
O erro `ReferenceError: require is not defined in ES module scope` ocorre porque o `package.json` do módulo `front` contém `"type": "module"`. Isso faz com que o Node/Electron trate todos os arquivos `.js` gerados pelo `tsc` como ES Modules, onde o `require` não existe. No entanto, o processo principal do Electron é mais estável e compatível com CommonJS, especialmente quando usamos `__dirname`.

## Análise Técnica:
1.  **Package.json Scope:** O flag `"type": "module"` é necessário para o Vite/React moderno, mas afeta o diretório `electron/` onde o `main.js` reside.
2.  **Solução de Extensão:** Para o Electron tratar o arquivo como CommonJS mesmo dentro de um projeto ESM, a extensão deve ser obrigatoriamente `.cjs`.
3.  **Transpilação:** O comando `tsc` precisa ser ajustado para gerar arquivos com a extensão correta ou precisamos renomeá-los após a transpilação.

## Correções Necessárias:
1.  **Extensão dos Arquivos:** Alterar o `main` no `package.json` para `electron/main.cjs`.
2.  **Script de Dev:** Ajustar o script `dev:electron` para renomear os arquivos `.js` gerados para `.cjs` antes de iniciar o Electron.
3.  **Código-Fonte:** Garantir que o `main.ts` utilize o padrão CommonJS que já implementamos.

## Impacto:**
-   Impedimento total de inicialização da janela do Electron.
-   Quebra de compatibilidade de módulos entre Renderer (Vite/ESM) e Main (Electron/CJS).
