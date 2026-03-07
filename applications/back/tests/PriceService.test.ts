import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceService } from '../src/services/PriceService';

describe('US01.6: PriceService - Busca Avançada e Seleção', () => {
  let priceService: PriceService;

  beforeEach(() => {
    priceService = new PriceService();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('deve retornar uma lista de até 10 candidatos ao buscar cartas', async () => {
    const mockFetch = vi.mocked(fetch);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: '1', name: 'Prefeito de Avabruck', mana_cost: '{1}{G}', colors: ['G'], type_line: 'Creature' }
        ]
      }),
    } as Response);

    const results = await priceService.searchCards('Prefeito');
    expect(results).toHaveLength(1);
  });

  it('deve buscar versões e converter preço ao selecionar uma carta específica', async () => {
    const mockFetch = vi.mocked(fetch);

    // 1. Mock Scryfall Prints Search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { 
            id: '1', 
            name: 'Black Lotus', 
            set_name: 'Alpha', 
            set: 'lea', 
            rarity: 'rare',
            type_line: 'Artifact', // Adicionado
            prices: { usd: '10.00' },
            image_uris: { normal: 'http://image.url' },
            scryfall_uri: 'http://scryfall.url',
            legalities: { commander: 'legal' } // Adicionado
          }
        ]
      }),
    } as Response);

    // 2. Mock AwesomeAPI
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        USDBRL: { bid: '5.00' }
      }),
    } as Response);

    const result = await priceService.getCardVersions('Black Lotus');

    expect(result.name).toBe('Black Lotus');
    expect(result.versions[0].priceBRL).toBe('50.00');
  });
});
