import { CardClassifier, CardCategory } from './CardClassifier';

export interface CardSearchResult {
  id: string;
  name: string;
  mana_cost: string;
  colors: string[];
  type_line: string;
}

export interface CardVersion {
  id: string;
  name: string;
  setName: string;
  setCode: string;
  rarity: string;
  priceUSD: string | null;
  priceFoilUSD: string | null;
  priceBRL: string | null;
  priceFoilBRL: string | null;
  imageUrl: string;
  scryfallUri: string;
  category: CardCategory;
  legalities: Record<string, string>;
  colorIdentity: string[]; // NOVO: Identidade de Cor
}

export interface CardPriceResult {
  name: string;
  versions: CardVersion[];
}

export class PriceService {
  private SCRYFALL_API_SEARCH = 'https://api.scryfall.com/cards/search';
  private CURRENCY_API = 'https://economia.awesomeapi.com.br/last/USD-BRL';
  private classifier = new CardClassifier();

  async searchCards(query: string): Promise<CardSearchResult[]> {
    const response = await fetch(`${this.SCRYFALL_API_SEARCH}?q=${encodeURIComponent(query)}&unique=cards`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data.slice(0, 10).map((card: any) => ({
      id: card.id,
      name: card.name,
      mana_cost: card.mana_cost || '',
      colors: card.colors || [],
      type_line: card.type_line || ''
    }));
  }

  async getCardVersions(cardName: string): Promise<CardPriceResult> {
    const scryfallResponse = await fetch(`${this.SCRYFALL_API_SEARCH}?q=!"${encodeURIComponent(cardName)}"&unique=prints`);
    
    if (!scryfallResponse.ok) {
      if (scryfallResponse.status === 404) throw new Error('Carta não encontrada');
      throw new Error('Erro ao buscar versões no Scryfall');
    }

    const data = await scryfallResponse.json();
    const versionsData = data.data;

    let exchangeRate = 1;
    try {
      const currencyResponse = await fetch(this.CURRENCY_API);
      const currencyData = await currencyResponse.json();
      exchangeRate = parseFloat(currencyData.USDBRL.bid);
    } catch (e) {
      console.error('Falha ao obter cotação, usando 1:1');
    }

    const versions: CardVersion[] = versionsData.map((v: any) => {
      const pNormal = v.prices?.usd || null;
      const pFoil = v.prices?.usd_foil || null;

      const category = this.classifier.classify({
        name: v.name,
        type_line: v.type_line,
        oracle_text: v.oracle_text || v.card_faces?.[0]?.oracle_text || ''
      });

      return {
        id: v.id,
        name: v.name,
        setName: v.set_name,
        setCode: v.set,
        rarity: v.rarity,
        priceUSD: pNormal,
        priceFoilUSD: pFoil,
        priceBRL: pNormal ? (parseFloat(pNormal) * exchangeRate).toFixed(2) : null,
        priceFoilBRL: pFoil ? (parseFloat(pFoil) * exchangeRate).toFixed(2) : null,
        imageUrl: v.image_uris?.normal || v.card_faces?.[0]?.image_uris?.normal || '',
        scryfallUri: v.scryfall_uri,
        category,
        legalities: v.legalities,
        colorIdentity: v.color_identity || [] // Injetando Identidade de Cor
      };
    });

    return {
      name: versionsData[0].name,
      versions
    };
  }
}
