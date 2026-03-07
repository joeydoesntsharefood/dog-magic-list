# BUG-011: Cálculo de Preço Médio inconsistente (Valores Nulos)

## Descrição:
O cálculo do preço médio (`avgVersionPrice`) no Wizard está dividindo o somatório total de preços pelo número total de versões da carta, incluindo versões que não possuem preço definido (`null` ou `---`). Isso puxa a média para baixo artificialmente.

## Análise Técnica:
*   A lógica atual: `allVersions.reduce(...) / allVersions.length`.
*   Se uma carta tem 10 versões mas apenas 2 têm preço, a divisão por 10 gera um valor incorreto.

## Correção Necessária:
1.  Filtrar o array `allVersions` para manter apenas itens onde `priceBRL` é válido e maior que zero antes de realizar o cálculo.
2.  Dividir o somatório apenas pela quantidade de versões com preço real.
3.  Exibir "---" caso nenhuma versão tenha preço disponível.

## Status:
- **Registrado:** Aguardando correção imediata.
