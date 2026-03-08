# Suíte de Inteligência e Ferramentas Avançadas (US05 - US09)

Este documento detalha o conjunto de funcionalidades avançadas para otimização de custo, análise técnica e utilitários de gameplay.

---

## US05 - Otimizador de Carrinho Multi-Loja (Cart Optimizer)

### Descrição:
Como um comprador econômico, quero que o sistema calcule a melhor combinação de lojas para comprar minha lista, considerando não apenas o menor preço unitário, mas também o impacto do frete no custo total.

### Critérios de Aceitação:
1. **Algoritmo de Combinação:** O sistema deve agrupar cartas por loja e calcular o custo total (Cartas + Frete Estimado).
2. **Sugestão de Consolidação:** Se mover uma carta de R$ 10,00 da Loja A para a Loja B (onde ela custa R$ 12,00) economizar um frete de R$ 15,00, o sistema deve recomendar a troca.
3. **Filtro de "Máximo de Lojas":** O usuário pode definir um limite (ex: "comprar em no máximo 3 lojas") para simplificar o recebimento.

### Requisitos Técnicos:
- **Lógica:** Implementação de um algoritmo de otimização (Greedy ou Combinatório) no `PriceService`.
- **UI:** Nova tela de "Resumo de Compra" com o agrupamento por lojas e botão "Ver no Marketplace".

---

## US06 - Sugestor de Substituições Econômicas (Budget Finder)

### Descrição:
Como um jogador com orçamento limitado, quero encontrar alternativas baratas para cartas caras sem perder a funcionalidade do deck.

### Critérios de Aceitação:
1. **Alerta de Custo:** Cartas acima de um valor configurável (ex: R$ 50,00) ganham um ícone de "Sugestão Budget".
2. **Busca por Semântica:** O sistema utiliza as tags de função do Scryfall (ex: `function:removal`, `function:draw`, `function:ramp`) para buscar cartas similares com preço menor.
3. **Comparação Lado a Lado:** Modal mostrando a carta cara e 2-3 alternativas baratas com seus respectivos preços.

---

## US07 - Simulador de Mão Inicial (Playtest Goldfish)

### Descrição:
Como um construtor de decks, quero simular a consistência das minhas mãos iniciais e os primeiros turnos para validar a curva de mana.

### Critérios de Aceitação:
1. **Gerador de Mão:** Botão para gerar uma mão inicial de 7 cartas aleatórias do deck atual.
2. **Mulligan:** Funcionalidade de "Mulligan" (Londres) para testar novas mãos.
3. **Simulador de Turno (T1-T3):** Interface simples para "comprar carta do topo" e simular a descida de terrenos e feitiços nos primeiros turnos.

---

## US08 - Análise de Saúde do Deck (Deck Health)

### Descrição:
Como um jogador competitivo ou entusiasta, quero visualizações estatísticas do meu deck para entender seu equilíbrio.

### Critérios de Aceitação:
1. **Curva de Mana (CMC):** Gráfico de barras mostrando a distribuição de custos de mana.
2. **Color Pie:** Gráfico de pizza com a distribuição de símbolos de mana e fontes de cores (terrenos).
3. **Categorias Operacionais:** Gráfico mostrando a contagem de categorias essenciais (Ramp, Draw, Removal, Protection).

### Requisitos Técnicos:
- **Frontend:** Integração com biblioteca de gráficos (ex: Recharts ou Chart.js).

---

## US09 - Histórico de Preços Local (Price Tracker)

### Descrição:
Como um investidor de coleções, quero acompanhar a valorização ou desvalorização das minhas cartas ao longo do tempo.

### Critérios de Aceitação:
1. **Snapshots de Preço:** Sempre que o scraper rodar, ele salva o menor preço encontrado em uma tabela de histórico.
2. **Gráfico de Tendência:** Na visualização de detalhes da carta (na Library ou Wishlist), exibir um gráfico de linha com a variação de preço nas últimas semanas/meses.

### Requisitos Técnicos:
- **Database:** Nova tabela `price_history` (id, card_id, price, timestamp).
