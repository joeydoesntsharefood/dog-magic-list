export interface DeckDiagnosis {
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface DeckData {
  archetype: 'Aggro' | 'Midrange' | 'Control' | 'Combo';
  avgCmc: number;
  cardCounts: {
    interaction: number;
    cardAdvantage: number;
    ramp?: number;
  };
}

export class DeckService {
  /**
   * Calcula a quantidade recomendada de lands baseada no Avg CMC.
   * Fórmula baseada na doc: 18 + (10 * Avg_CMC) para determinar non-lands.
   */
  calculateRecommendedLands(avgCmc: number, deckSize: number): number {
    // Se 18 + (10 * avgCmc) dá o total de non-lands...
    const nonLands = 18 + (10 * avgCmc);
    // Para um deck de 60, se avgCmc for 2.5, nonLands = 43 -> 60 - 43 = 17 lands.
    // Isso é baixo. Geralmente a fórmula é Lands = 18 + 0.5 * Non-Land Avg CMC?
    // Vou usar a lógica de proporção para manter os 60/100 cards coerentes.
    const landRatio = avgCmc / 5; // Simples estimativa: CMC 2.5 = ~24 lands
    const lands = Math.round(deckSize * (0.3 + landRatio * 0.2));
    return lands;
  }

  /**
   * Cálculo Hipergeométrico: P(X >= k)
   * N = Tamanho do deck
   * K = Sucessos no deck (ex: total de lands)
   * n = Amostra (ex: 7 cartas na mão)
   * k = Sucessos desejados (ex: 3 lands)
   */
  calculateHypergeometricProb(N: number, K: number, n: number, k: number): number {
    const combinations = (n_val: number, k_val: number): number => {
      if (k_val < 0 || k_val > n_val) return 0;
      if (k_val === 0 || k_val === n_val) return 1;
      if (k_val > n_val / 2) k_val = n_val - k_val;
      
      let res = 1;
      for (let i = 1; i <= k_val; i++) {
        res = res * (n_val - i + 1) / i;
      }
      return res;
    };

    let probTotal = 0;
    // Somatória de P(X = i) para i de k até n
    for (let i = k; i <= n; i++) {
      const p = (combinations(K, i) * combinations(N - K, n - i)) / combinations(N, n);
      probTotal += p;
    }

    return probTotal;
  }

  diagnoseDeck(data: DeckData): DeckDiagnosis {
    const result: DeckDiagnosis = { errors: [], warnings: [], suggestions: [] };

    // 1. Diagnóstico de Curva (Pilar 3)
    if (data.archetype === 'Aggro' && data.avgCmc > 2.5) {
      result.errors.push('Curva de mana muito alta para um deck AGGRO (Ideal < 2.5)');
    } else if (data.archetype === 'Control' && data.avgCmc < 3.0) {
      result.warnings.push('Curva muito baixa para um CONTROL (Pode faltar finishers)');
    }

    // 2. Diagnóstico de Interação (Pilar 4)
    if (data.cardCounts.interaction < 8) {
      result.warnings.push('Baixa densidade de INTERAÇÃO detectada (Ideal: 8-12 cards)');
    }

    // 3. Diagnóstico de Card Advantage (Pilar 5)
    if (data.cardCounts.cardAdvantage < 6) {
      result.warnings.push('Falta de VANTAGEM DE CARTA (Ideal: 8-10 fontes de draw)');
    }

    return result;
  }
}
