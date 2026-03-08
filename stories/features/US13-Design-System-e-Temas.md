# Design System e Temas Dinâmicos (US13)

Esta fase foca na evolução visual do projeto, permitindo a troca de temas (Light, Dark, Mythic, etc.) sem comprometer a integridade da UX e a performance do Tailwind CSS.

---

## US13 - Multi-theme Engine (Tokens Semânticos)

### Descrição:
Como usuário, quero poder escolher entre diferentes temas visuais (ex: Tema Clássico, Dark Mode Profundo, Tema Mítico) para personalizar minha experiência de uso, mantendo a consistência de layout e responsividade.

### Critérios de Aceitação:
1. **Tokens Semânticos:** Substituição de cores fixas do Tailwind por variáveis CSS (ex: `--color-bg-primary`, `--color-accent`).
2. **Seletor de Temas:** Novo componente de UI para alternar temas instantaneamente.
3. **Preservação de Layout:** A troca de tema não deve alterar paddings, margens, fontes ou comportamento responsivo.
4. **Persistência de Preferência:** O tema escolhido deve ser salvo no perfil do usuário (Cloud) e reaplicado ao fazer login.

---

## Arquitetura de Cores Proposta

O Tailwind será configurado para ler variáveis CSS injetadas no `:root` ou em classes específicas (ex: `.theme-mythic`).

### Exemplo de Configuração de Tokens:
- **Base:** Background, Surfaces, Borders.
- **Brand:** Primary (Cor de destaque), Secondary.
- **Status:** Success (Preço baixo), Warning, Error (Scraping falhou).
- **Rarity:** Cores específicas para raridades de cartas (Common, Uncommon, Rare, Mythic).

---

## Novos Temas Planejados

### 1. "Midnight" (O Atual):
- Foco em produtividade noturna.
- Tons de azul escuro e cinzas profundos.
- Cores de destaque: Neon Cyan / Purple.

### 2. "Planeswalker Gold" (Rentável/Premium):
- Visual mais "luxuoso" e limpo.
- Tons de dourado metálico, branco marfim e preto elegante.
- Tipografia mais serifada em títulos (estilo Magic).

### 3. "High Contrast" (Acessibilidade):
- Foco total em leitura de preços.
- Contrastes fortes e tipografia bold.

---

## Requisitos Técnicos:
- **Tailwind Config:** Atualizar `tailwind.config.js` para usar `color: { primary: 'var(--color-primary)' }`.
- **Global CSS:** Definição dos blocos de variáveis para cada tema.
- **Provider de Tema:** Context API no React para gerenciar e persistir o estado do tema.
