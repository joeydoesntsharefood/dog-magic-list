# F02: Integração LigaMagic - Marketplace Brasil

Este módulo foca na extração de dados reais de lojas brasileiras para viabilizar a comparação de preços e automação de compras.

## US02.1: Scraper de Ofertas em Tempo Real
**Descrição:** Como usuário, desejo ver as ofertas reais de lojas brasileiras (nome da loja, preço e estoque) para a carta que estou visualizando.

### Critérios de Aceite (AC):
1.  O backend deve utilizar **Puppeteer** para navegar até a página da carta na LigaMagic.
2.  Deve aguardar o carregamento da tabela de ofertas (gerada via JavaScript).
3.  Deve extrair uma lista de até 10 melhores ofertas contendo:
    *   Nome da Loja.
    *   Preço em BRL.
    *   Estado da carta (NM, SP, etc).
    *   Link direto para o marketplace/loja.
4.  O processo deve ser assíncrono para não travar o servidor.

## US02.2: Links de Compra Direta
**Descrição:** Como usuário, desejo clicar em uma oferta e ser redirecionado para a loja correspondente para finalizar a compra.

### Critérios de Aceite (AC):
1.  A UI deve exibir um botão "Comprar" ao lado de cada oferta da loja.
2.  O link deve abrir no navegador padrão do sistema operacional (via Electron Shell API).

---

## Estratégia TDI:
*   **Teste Unitário (Scraper):** Validar a extração de dados usando um HTML mockado da LigaMagic para garantir que os seletores CSS estão corretos.
*   **Teste de Integração:** Simular o fluxo do frontend pedindo ofertas e o backend retornando uma estrutura de dados válida.
