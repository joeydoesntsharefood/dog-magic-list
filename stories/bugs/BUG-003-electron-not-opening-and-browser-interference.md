# BUG-003: Interferência do Navegador e Falha de Abertura do Electron

## Descrição:
Ao rodar `npm run dev`, o Vite abre automaticamente o navegador padrão, o que é indesejado para uma aplicação Electron. Além disso, o comando `npm run dev:electron` falha silenciosamente ou não abre a janela porque o Electron espera arquivos CommonJS no processo principal (`main.js`), mas estamos gerando ESM ou com erros de resolução de módulos.

## Análise Técnica:
1.  **Vite Auto-Open:** O Vite por padrão pode tentar abrir o navegador. Precisamos forçar `--no-open`.
2.  **Electron Module System:** O `main.ts` do Electron no `front` deve ser transpilado para CommonJS (`cjs`) para evitar conflitos de `__dirname` e compatibilidade com o binário do Electron, enquanto o Renderer (React) continua como ESM.
3.  **Caminho de Saída:** O `tsc` está gerando arquivos dentro de `electron/`, mas o `package.json` aponta para `electron/main.js`. Precisamos garantir que a transpilação ocorra sem erros de tipos que travam o processo.

## Correções Necessárias:
1.  **Vite Config:** Adicionar `server: { open: false }` no `vite.config.ts`.
2.  **Scripts de Build:** Ajustar o `tsc` para gerar CommonJS especificamente para a pasta `electron`.
3.  **Package JSON:** Limpar os scripts para garantir que o Electron só abra quando o arquivo `.js` estiver pronto.

## Impacto:**
-   Fluxo de desenvolvimento confuso (navegador abrindo).
-   Aplicação desktop não inicia.
