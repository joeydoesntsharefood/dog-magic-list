# BUG-008: Falha na Persistência Visual da Imagem (Sticky UX)

## Descrição:
Ao rolar a página para visualizar a tabela de preços ou as ofertas do marketplace, a imagem da carta (que é a referência visual principal) desaparece da tela. É necessário que a imagem permaneça fixada à esquerda enquanto o usuário navega pelos dados técnicos.

## Análise Técnica:
*   **Estrutura de Flexbox:** Atualmente, a seção de ofertas do marketplace está fora do container flex que contém a imagem.
*   **Posicionamento:** O atributo `sticky` precisa de um container pai que englobe todo o conteúdo rolável e o elemento fixo, além de garantir que nenhum pai intermediário possua `overflow: hidden` que quebre o comportamento.

## Correção Necessária:
1.  Reestruturar o JSX para que a coluna da esquerda (Imagem + Preço Médio) e a coluna da direita (Tabela + Opções + Marketplace) compartilhem o mesmo container pai `flex`.
2.  Aplicar `sticky` com um offset adequado no container da imagem.
3.  Garantir que a coluna da direita tenha `flex-1` para ocupar o espaço restante de forma independente.

## Status:
- **Registrado:** Aguardando implementação imediata.
