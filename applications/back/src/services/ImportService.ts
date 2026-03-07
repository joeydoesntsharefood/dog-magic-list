import { PriceService, CardPriceResult } from './PriceService';

export interface ImportedCard {
  quantity: number;
  data: CardPriceResult; // Retorna o objeto completo com todas as versões
}

export class ImportService {
  constructor(private priceService: PriceService) {}

  parseLine(line: string): { quantity: number; name: string } {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)\s+(.*)$/);
    if (match) {
      return {
        quantity: parseInt(match[1], 10),
        name: match[2].trim()
      };
    }
    return { quantity: 1, name: trimmed };
  }

  async importDeck(rawText: string): Promise<ImportedCard[]> {
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const result: ImportedCard[] = [];

    for (const line of lines) {
      const { quantity, name } = this.parseLine(line);
      try {
        const cardData = await this.priceService.getCardVersions(name);
        if (cardData.versions.length > 0) {
          result.push({
            quantity,
            data: cardData
          });
        }
      } catch (error) {
        console.warn(`[Import] Localize fail: ${name}`);
      }
    }

    return result;
  }
}
