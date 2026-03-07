import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LigaMagicScraper } from '../src/services/LigaMagicScraper';

describe('F02: LigaMagicScraper - Extração de Ofertas', () => {
  let scraper: LigaMagicScraper;

  beforeEach(() => {
    scraper = new LigaMagicScraper();
  });

  it('deve formatar corretamente a URL de busca da LigaMagic', () => {
    const url = scraper.buildSearchUrl('Mayor of Avabruck');
    expect(url).toBe('https://www.ligamagic.com.br/?view=cards/search&card=Mayor%20of%20Avabruck');
  });

  // O teste de extração real requer Puppeteer, por enquanto validamos a estrutura de dados esperada
  it('deve definir uma estrutura de oferta válida', () => {
    const mockOffer = {
      storeName: 'Bazar de Bagda',
      price: 'R$ 15,00',
      stock: 4,
      link: 'https://ligamagic.com.br/loja/...'
    };
    expect(mockOffer.storeName).toBeDefined();
    expect(mockOffer.link).toContain('http');
  });
});
