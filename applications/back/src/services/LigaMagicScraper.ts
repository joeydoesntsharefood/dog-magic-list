import puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

export interface LigaMagicOption {
  name: string;
  setName: string;
  link: string;
}

export interface LigaMagicOffer {
  storeName: string;
  storeLogo: string;
  price: string;
  priceValue: number;
  availability: string;
  link: string;
}

export interface ScraperResult {
  avgPrice: string | null;
  offers: LigaMagicOffer[];
  options?: LigaMagicOption[]; // Caso haja ambiguidade
}

export class LigaMagicScraper {
  private BASE_URL = 'https://www.ligamagic.com.br/';
  private DEBUG_ROOT = path.join(process.cwd(), 'debug');

  constructor() {
    if (!fs.existsSync(this.DEBUG_ROOT)) fs.mkdirSync(this.DEBUG_ROOT);
  }

  private createDebugFolder(cardName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderName = `${timestamp}_${cardName.replace(/[^a-z0-9]/gi, '_')}`;
    const fullPath = path.join(this.DEBUG_ROOT, folderName);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
  }

  buildSearchUrl(cardName: string): string {
    const cleanName = cardName.split('//')[0].trim();
    return `${this.BASE_URL}?view=cards/search&card=${encodeURIComponent(cleanName)}`;
  }

  async getOffers(cardName: string, directUrl?: string): Promise<ScraperResult> {
    const debugPath = this.createDebugFolder(cardName);
    const browser = await puppeteer.launch({ 
      headless: false, 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,1024']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 1024 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
      const targetUrl = directUrl || this.buildSearchUrl(cardName);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

      // Verificar se caímos em uma lista de busca ou em múltiplas versões (ex: terrenos básicos)
      const isSearchPage = page.url().includes('view=cards/search');
      const hasMultipleVersions = await page.$('.card-search-item, .mtg-single, .cards-search-list');

      if ((isSearchPage || hasMultipleVersions) && !directUrl) {
        console.log(`[Scraper] ⚠️ AMBIGUITY_DETECTED: Fetching options...`);
        const options = await page.evaluate(() => {
          // Captura links de edições específicas
          const items = Array.from(document.querySelectorAll('.card-search-item, .mtg-single, a[href*="view=cards/card&ed="]'));
          return items.slice(0, 15).map(item => {
            const linkEl = item.querySelector('a') || item;
            const name = item.querySelector('.card-name, .nome-auxiliar')?.textContent?.trim() || 'Desconhecido';
            const setName = item.querySelector('.card-set, .edicao')?.textContent?.trim() || '---';
            const link = (linkEl as HTMLAnchorElement).href;
            return { name, setName, link };
          }).filter(o => o.link.includes('view=cards/card'));
        });

        await browser.close();
        return { avgPrice: null, offers: [], options };
      }

      // Se chegamos aqui, estamos na página final da carta
      await page.waitForSelector('#container-buy-mkp', { timeout: 15000 });
      await page.evaluate(() => window.scrollBy(0, 600));
      await new Promise(r => setTimeout(r, 2000));

      const result = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#container-buy-mkp .mp-loja-linha'));
        const offers = rows.slice(0, 20).map(row => {
          const storeImg = row.querySelector('.mp-loja-nome img') as HTMLImageElement;
          const storeName = storeImg?.getAttribute('title') || 'Loja';
          const priceText = row.querySelector('.mp-loja-preco')?.textContent?.trim() || '0';
          const priceValue = parseFloat(priceText.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
          return {
            storeName,
            storeLogo: storeImg?.src || '',
            price: priceText,
            priceValue,
            availability: row.querySelector('.mp-loja-estoque')?.textContent?.trim() || '1',
            link: (row.querySelector('.mp-loja-botao a') as HTMLAnchorElement)?.href || ''
          };
        }).filter(o => o.priceValue > 0 && o.link !== '');
        return { offers };
      });

      let avgPriceStr = '---';
      if (result.offers.length > 0) {
        const total = result.offers.reduce((acc, curr) => acc + curr.priceValue, 0);
        avgPriceStr = `R$ ${(total / result.offers.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }

      await browser.close();
      return { avgPrice: avgPriceStr, offers: result.offers };
    } catch (error) {
      console.error('[Scraper] ERROR:', (error as Error).message);
      await browser.close();
      return { avgPrice: null, offers: [] };
    }
  }
}
