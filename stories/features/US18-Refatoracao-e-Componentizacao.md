# Refatoração e Arquitetura de Componentes (US18)

Este documento detalha a estratégia para decompor o `App.tsx` em componentes isolados, testáveis e reutilizáveis, preparando o terreno para os novos temas e funcionalidades de nuvem.

---

## Estratégia de Componentização

Para cada componente criado, deve existir um arquivo `<Componente>.test.tsx` correspondente, garantindo que a lógica de UI seja validada isoladamente.

### 1. Camada de Layout (Core)
- **`Layout/Shell.tsx`**: O container principal com a Sidebar e o Header. Gerencia o estado do Tema.
- **`Layout/Sidebar.tsx`**: Menu de navegação (Wizard, Library, Marketplace, Settings).
- **`Layout/Header.tsx`**: Informações de usuário, status da conexão com a nuvem e seletor de tema.

### 2. Domínio: Deck Wizard (Fluxo de Construção)
- **`Wizard/WizardContainer.tsx`**: Orquestrador de estado do fluxo.
- **`Wizard/Steps/CardSearchStep.tsx`**: Apenas a interface de busca e seleção.
- **`Wizard/Steps/ReviewStep.tsx`**: Revisão da lista final antes de salvar.
- **`Wizard/Components/WizardCard.tsx`**: Card específico do wizard com ações de quantidade.

### 3. Domínio: Marketplace & Scraper
- **`Marketplace/MarketplaceGrid.tsx`**: Exibição das ofertas.
- **`Marketplace/OfferRow.tsx`**: Linha individual de uma loja com preço e link.
- **`Marketplace/PriceChart.tsx`**: (Futuro) Gráfico de histórico de preços da carta.

### 4. Componentes Compartilhados (UI Kit)
- **`Shared/CardImage.tsx`**: Componente inteligente que lida com o cache local (WebP) e lazy loading.
- **`Shared/Button.tsx`**: Botão estilizado via tokens de tema.
- **`Shared/Modal.tsx`**: Abstração de diálogos.
- **`Shared/SearchBar.tsx`**: Input de busca com debounce integrado.

---

## Plano de Testes (TDI - Test-Driven Implementation)

Cada componente deve passar nos seguintes critérios de teste:
1. **Renderização:** O componente monta sem quebrar com diferentes props.
2. **Interação:** Cliques e inputs disparam as funções esperadas.
3. **Tematização:** O componente aplica as classes de cores baseadas nas variáveis CSS.
4. **Mock de Dados:** Uso de MSW (Mock Service Worker) ou mocks simples para simular respostas da API local/global.

---

## Estrutura de Pastas Proposta (`applications/front/src/`)

```text
src/
├── components/
│   ├── layout/
│   ├── wizard/
│   ├── marketplace/
│   ├── shared/
│   └── library/ (US04)
├── hooks/
│   ├── useAuth.ts
│   ├── useTheme.ts
│   └── usePriceSync.ts
├── services/
│   ├── api-global.ts
│   └── api-local.ts
├── store/ (Estado Global - Context ou Redux/Zustand)
└── App.tsx (Agora apenas o roteador/orquestrador de alto nível)
```

---

## Próximos Passos Técnicos
1. **Criar o `ThemeContext`:** Para suportar a US13 enquanto movemos os componentes.
2. **Extrair o `Sidebar`:** Primeiro componente a ser isolado para limpar o `App.tsx`.
3. **Mapear Props:** Definir as interfaces TypeScript para cada novo componente extraído.
