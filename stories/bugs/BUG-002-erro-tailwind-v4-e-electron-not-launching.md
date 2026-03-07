# BUG-002: Erro de Configuração Tailwind v4 e Falha de Inicialização do Electron

## Descrição:
Ao rodar `npm run dev` no módulo `front`, a aplicação falha devido a uma mudança crítica no Tailwind CSS v4, que agora exige o pacote `@tailwindcss/postcss`. Além disso, o comando `vite` inicia apenas o servidor de desenvolvimento web no navegador, sem disparar o processo principal do Electron.

## Análise Técnica:
1.  **Tailwind CSS v4:** A versão instalada (v4) removeu o suporte direto ao plugin `tailwindcss` no PostCSS. É necessário instalar `@tailwindcss/postcss`.
2.  **Electron Launch:** O `vite` por si só não sabe que deve abrir o Electron. Precisamos de um orquestrador ou de scripts no `package.json` que rodem o `vite` (renderer) e o `electron` (main) simultaneamente.
3.  **Caminho do Logo:** O erro de `index.css` impede a renderização, mas o `logo.png` precisa estar acessível na pasta `public` do front para ser exibido corretamente.

## Correções Necessárias:
1.  **Dependências:** Instalar `@tailwindcss/postcss` em `applications/front`.
2.  **Configuração PostCSS:** Atualizar `postcss.config.js` para usar o novo plugin.
3.  **Scripts de Execução:** Configurar o `electron-vite` ou scripts `concurrently` para abrir o Electron apontando para o localhost do Vite.
4.  **Assets:** Garantir que o `logo.png` esteja em `applications/front/public/logo.png`.

## Impacto:**
-   A aplicação não renderiza estilos.
-   A experiência "Desktop" (Electron) não é iniciada.
