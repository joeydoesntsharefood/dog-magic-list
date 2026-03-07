# F02: Inteligência de Mercado e Extração

Este módulo automatiza a coleta de dados de sites brasileiros e extração de decks para análise e planejamento.

## US02.1: Scraper de Preços (Market Insight)
**Descrição:** Como usuário, desejo comparar preços em sites brasileiros confiáveis sem sair do app.

### Critérios de Aceite (AC):
1.  O sistema deve realizar o scraping (via Fetch ou Puppeteer em background) de sites definidos (ex: LigaMagic, Bazar de Bagda) ao solicitar atualização de preço de uma carta.
2.  Deve extrair o menor valor disponível para cada estado (NM, SP, MP, HP).
3.  O resultado deve ser apresentado em uma tabela dentro da UI do Electron, utilizando a paleta `assets/pallet.json`.
4.  O scraping deve ocorrer de forma assíncrona (Event-Driven) para não travar a UI principal.

### Estratégia TDI:
*   **Teste Unitário (Scraper):** Testar o seletor CSS de cada site com HTML mockado para garantir extração correta.
*   **Teste de Integração:** Verificar se o evento de "price_update" é disparado após o scraper finalizar a execução no processo backend.

---

## US02.2: Importação de Listas de Decks Externos
**Descrição:** Como jogador, desejo colar um link ou lista de texto de sites de decks (ex: Moxfield, MTGGoldfish) para importar automaticamente para o app.

### Critérios de Aceite (AC):
1.  Deve aceitar URLs de sites de decklists populares.
2.  Extração de quantidade e nome de carta, ignorando linhas de comentários/headers irrelevantes.
3.  As cartas importadas devem ser associadas a uma nova lista no SQLite local.

### Estratégia TDI:
*   **Teste Unitário (Parser):** Validar o parser de texto/regex com diferentes formatos de exportação de decks (Arena, MTGO, Texto Puro).
*   **Teste de Integração:** Importar via URL real (em ambiente de teste controlado) e validar a criação da lista no banco de dados local.

---

## US02.3: Análise Técnica e Sugestões de Melhoria
**Descrição:** Como jogador, desejo que o sistema analise minha lista (curva de mana, tipos de carta) e sugira melhorias com base em parâmetros pré-definidos.

### Critérios de Aceite (AC):
1.  Cálculo de curva de mana (Mana Curve) e distribuição de cores (Color Pie).
2.  Apresentação visual dessas métricas usando componentes Headless UI altamente estilizados.
3.  Espaço para futuras sugestões vindas do agente de IA (Grok).

### Estratégia TDI:
*   **Teste Unitário:** Validar algoritmos de cálculo de curva de mana com listas de decks variadas.
*   **Teste de UI:** Garantir que o gráfico de distribuição de cores respeite a paleta oficial do projeto.
