# Documentação Detalhada para Construção de Decks de Magic: The Gathering

Esta documentação expande os pilares de construção de decks discutidos anteriormente, adaptando-os para três formatos principais: Competitive Standard (com foco em Tiers 1 e 2), Commander e Pauper. Para cada formato, incluímos adaptações dos 7 pilares fundamentais, fórmulas matemáticas (incluindo distribuições hipergeométricas para probabilidades de draws), curvas de mana ideais e exemplos de decks com 3 variações de budget: **Low (<$50)**, **Middle ($50-200)** e **High (>$200)**. Os budgets são baseados em preços de tabletop aproximados (via MTGGoldfish e TCGPlayer), priorizando eficiência e competitividade.

Os dados foram compilados de fontes como MTGGoldfish metagame analyses, ChannelFireball articles, EDHREC commander guides e discussões em fóruns como MTG Salvation e Reddit.

## Pilares Fundamentais de Construção de Decks

Estes 7 pilares aplicam-se a todos os formatos, com adaptações por archetype (Aggro, Midrange, Control, Combo). Eles garantem consistência, sinergia e adaptação ao meta.

| Pilar | Descrição Geral | Adaptação por Formato |
|-------|-----------------|-----------------------|
| **1. Cartas Poderosas** | Cartas eficientes com alto valor (ex.: remoção 2x1, criaturas com ETB). | Standard: Foco em staples rotacionais. Commander: Singleton, priorize versatilidade. Pauper: Commons eficientes como Lightning Bolt. |
| **2. Plano Claro** | Arquétipo definido (ex.: Aggro = dano rápido; Combo = peças chave). Inclua Plan B (sideboard). | Standard: Meta-driven (T1 agressivo). Commander: Commander-centrado. Pauper: Budget combos como Affinity. |
| **3. Mana Base e Curva** | Distribuição suave de CMC; pico em 2-3 para aggro. | Standard: 24-26 lands. Commander: 36-38 + ramp. Pauper: 20-24, com basics. |
| **4. Interação** | Removal, counters, disruption (8-12 slots). | Standard: Sideboard pesado. Commander: Board wipes. Pauper: Bolt-like removal. |
| **5. Vantagem de Carta** | Draw/loot (8-10 fontes). | Standard: Cantrips. Commander: Engines como Rhystic Study. Pauper: Mulldrifter. |
| **6. Ramp/Sinergia** | Aceleração e combos temáticos. | Standard: Mínimo em aggro. Commander: 10-15 ramp. Pauper: Affinity ramps. |
| **7. Sideboard/Metagame** | 15 cartas para matchups; teste vs. meta. | Standard: Crucial para T1/T2. Commander: N/A (casual). Pauper: Budget answers. |

## Fórmulas Matemáticas para Otimização de Decks

Use distribuições hipergeométricas para calcular probabilidades (ex.: chance de draw de lands). Fórmulas inspiradas em Frank Karsten (ChannelFireball) e calculadoras como Riftgate.

### Fórmula Básica de Lands
- **Lands = 18 + (10 × Avg_CMC_nonlands)** (para 60 cards; ajuste para 100 em Commander: +10-15).
- **Avg_CMC** = Σ (CMC_i × Qtd_i) / Nonlands.
- Ajuste hipergeométrico: Calcule P(≥3 lands em 7 cards) ≥90% usando fórmula:
  ```
  P(X = k) = [C(K, k) × C(N-K, n-k)] / C(N, n)
  ```
  Onde: N = deck size, K = lands, n = draws (7), k = lands desejados (3+). Use ferramentas como Hypergeometric Calculator para simular.

### Curva de Mana Ideal
Distribuição "bell curve" por archetype. Ajuste para formato (ex.: Pauper tem menos high-CMC).

| CMC | Aggro | Midrange | Control | Combo |
|-----|-------|----------|---------|-------|
| 1   | 8-12  | 4-8      | 2-4     | 4-8   |
| 2   | 10-14 | 8-12     | 6-10    | 8-12  |
| 3   | 6-10  | 10-14    | 8-12    | 6-10  |
| 4+  | 2-6   | 4-8      | 8-12    | 4-8   |
| Avg CMC | 2.0-2.5 | 2.5-3.0 | 3.0-3.5 | 2.5-3.0 |

- **Passo a Passo Algorítmico**:
  1. Defina archetype e budget.
  2. Calcule Avg_CMC e lands.
  3. Preencha slots: 40% threats, 20% interação, 15% draw, 10% ramp.
  4. Simule 1000 mãos (use Moxfield ou código Python com hypergeometric_pop em scipy.stats).
  5. Ajuste para P(mana flood <10%, screw <15%).
  6. Teste vs. meta (winrate >50%).

Exemplo de código Python para simulação (use code_execution tool para rodar):
```python
from scipy.stats import hypergeom
deck_size = 60
lands = 24
draws = 7
min_lands = 3
prob = 1 - hypergeom.cdf(min_lands - 1, deck_size, lands, draws)
print(f"Probabilidade de ≥{min_lands} lands: {prob*100:.2f}%")
```

## Formato 1: Competitive Standard (Tiers 1 e 2)

Foco em 60 cards, meta rotacional. T1: Top meta (ex.: Izzet Lessons). T2: Viáveis mas não dominantes (ex.: Boros Dragons). Pilares: Alta interação vs. meta; curvas baixas para velocidade. Lands: 24-26. Fórmulas: Ajuste lands para P(4 lands por T4) ≥85%.

### Adaptações
- **Mana Curve**: Aggro pico em 1-2 CMC; Control em 3-4.
- **Sideboard**: 15 cards para counters a T1 decks.
- **Budgets**: Low usa commons/uncommons; High inclui mythics.

### Exemplos
- **Low Budget (<$50)**: Mono-Red Aggro (T2). Curva: 12x1, 10x2, 6x3. Lands: 22. Ex.: Heartfire Hero, Shock. Custo ~$35. Plano: Dano rápido.
- **Middle Budget ($50-200)**: Izzet Prowess (T2). Curva: 8x1, 12x2, 8x3. Lands: 24. Ex.: Emberheart Challenger, Monstrous Rage. Custo ~$150. Plano: Prowess triggers + burn.
- **High Budget (>$200)**: Dimir Midrange (T1). Curva: 4x1, 10x2, 12x3, 6x4+. Lands: 25. Ex.: Deep-Cavern Bat, Bloodletter of Aclazotz. Custo ~$321. Plano: Disrupção + valor.

## Formato 2: Commander (EDH)

100 cards singleton, commander-centrado. Pilares: Mais ramp/draw devido a multiplayer. Lands: 36-38 + 10-15 ramp. Fórmulas: Lands = 30 + CMC_commander + Avg_CMC; ajuste para P(4 mana T4) ≥90%. Curvas: Pico em 2-4 CMC; inclua 10 removal, 10 draw.

### Adaptações
- **Mana Curve**: Avg 3.0-3.5; 10-13 ramp.
- **Sinergia**: Tema ao redor do commander (ex.: tribal).
- **Budgets**: Low usa precon upgrades; High staples como Cyclonic Rift.

### Exemplos
- **Low Budget (<$50)**: Elves Tribal (Elvish Mystic como commander). Curva: 10x1-2, 20x3-4. Lands: 36 + 8 dorks. Custo ~$40. Plano: Ramp para overwhelm.
- **Middle Budget ($50-200)**: Infinite Guideline Station (5-color artifacts). Curva: 15x2-3, 10x4+. Lands: 37 + 10 rocks. Custo ~$100. Plano: Multicolored permanents combo.
- **High Budget (>$200)**: Food & Fellowship (Frodo/Sam). Curva: 12x2, 15x3, 10x4+. Lands: 38 + 12 ramp. Custo ~$300. Plano: Life gain + tokens.

## Formato 3: Pauper

60 cards, apenas commons. Pilares: Budget inato; foco em sinergias eficientes. Lands: 20-24. Fórmulas: Mesmas de Standard, mas Avg_CMC <3.0; P(3 lands T3) ≥95%. Curvas: Aggro-heavy.

### Adaptações
- **Mana Curve**: Pico em 1-3; commons como Bolt.
- **Sinergia**: Archetypes como Affinity (artifacts).
- **Budgets**: Todos low por natureza, mas high inclui playsets otimizados.

### Exemplos
- **Low Budget (<$50)**: Madness Burn. Curva: 10x1, 12x2, 6x3. Lands: 20. Ex.: Lightning Bolt, Alms of the Vein. Custo ~$26. Plano: Burn + madness.
- **Middle Budget ($50-200)**: Grixis Affinity. Curva: 8x1, 10x2, 10x3. Lands: 22. Ex.: Thoughtcast, Myr Enforcer. Custo ~$107. Plano: Artifact ramp + draw.
- **High Budget (>$200)**: Não comum em Pauper (max ~$150); ex.: Otimizado Grixis Affinity com sideboard full. Custo ~$149. Plano: Affinity combo + disruption.

## Ferramentas e Recursos
- **Simuladores**: Moxfield, Archidekt para testes.
- **Calculadoras**: Riftgate para lands; Hypergeometric para probs.
- **Meta Sources**: MTGGoldfish, EDHREC.
- **Automação**: Use Python (scipy) para simulações personalizadas.

Esta documentação serve como base para sua ferramenta de automação. Ajuste com dados reais via APIs como Scryfall.