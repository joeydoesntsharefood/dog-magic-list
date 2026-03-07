import { describe, it, expect, beforeEach } from 'vitest';
import { DeckService } from '../src/services/DeckService';

describe('US03.1: DeckService - Engine de Construção', () => {
  let deckService: DeckService;

  beforeEach(() => {
    deckService = new DeckService();
  });

  it('deve calcular corretamente a quantidade recomendada de lands para Standard (60 cards)', () => {
    const recommended = deckService.calculateRecommendedLands(2.5, 60);
    expect(recommended).toBeGreaterThan(20);
    expect(recommended).toBeLessThan(28);
  });

  it('deve calcular a probabilidade hipergeométrica corretamente', () => {
    // P(X >= 3) lands na mão inicial (7 cards) em um deck de 60 com 24 lands.
    const prob = deckService.calculateHypergeometricProb(60, 24, 7, 3);
    // O valor exato é ~0.5879
    expect(prob).toBeGreaterThan(0.58);
    expect(prob).toBeLessThan(0.60);
  });

  it('deve diagnosticar deck agressivo com curva pesada', () => {
    const deckData: any = {
      archetype: 'Aggro',
      avgCmc: 3.5,
      cardCounts: {
        interaction: 4,
        cardAdvantage: 2,
      }
    };

    const diagnostics = deckService.diagnoseDeck(deckData);
    expect(diagnostics.errors).toContain('Curva de mana muito alta para um deck AGGRO (Ideal < 2.5)');
    expect(diagnostics.warnings).toContain('Baixa densidade de INTERAÇÃO detectada (Ideal: 8-12 cards)');
  });
});
