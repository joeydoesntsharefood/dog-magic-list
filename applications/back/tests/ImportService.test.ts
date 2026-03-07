import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '../src/services/ImportService';

describe('US03.4: ImportService - Parser de Deck TXT', () => {
  let importService: ImportService;
  let mockPriceService: any;

  beforeEach(() => {
    mockPriceService = {
      getCardVersions: vi.fn().mockResolvedValue({
        name: 'Sol Ring',
        versions: [{ id: '1', name: 'Sol Ring', priceBRL: '10.00' }]
      })
    };
    importService = new ImportService(mockPriceService as any);
  });

  it('deve extrair quantidade e nome corretamente', () => {
    const line = "4 Lightning Bolt";
    const result = importService.parseLine(line);
    expect(result).toEqual({ quantity: 4, name: "Lightning Bolt" });
  });

  it('deve processar uma lista inteira e retornar dados completos', async () => {
    const rawText = "1 Sol Ring";
    const result = await importService.importDeck(rawText);
    expect(result).toHaveLength(1);
    expect(result[0].data.name).toBe('Sol Ring');
    expect(result[0].data.versions).toHaveLength(1);
  });
});
