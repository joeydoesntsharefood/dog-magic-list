// --- TIPAGENS DE DOMÍNIO ---

export interface List {
  id: string;
  name: string;
  format?: string;
  archetype?: string;
  target_budget?: number;
}

export interface CardSuggestion {
  id: string;
  name: string;
  mana_cost: string;
  colors: string[];
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
  category: string;
  cmc: number;
  legalities: Record<string, string>;
  colorIdentity: string[];
}

export interface CardPriceResult {
  name: string;
  versions: CardVersion[];
}

export interface LigaMagicOffer {
  storeName: string;
  storeLogo: string;
  price: string;
  availability: string;
  link: string;
}

export interface LigaMagicOption {
  name: string;
  setName: string;
  link: string;
}

export interface OffersResult {
  avgPrice: string | null;
  offers: LigaMagicOffer[];
  options?: LigaMagicOption[];
  updatedAt: string | null;
  fromCache?: boolean;
}

export interface WizardDeckItem {
  uid: string;
  allVersions: CardVersion[];
  selectedVersion: CardVersion;
  quantity: number;
}

export interface DeckProfile {
  format: 'STANDARD' | 'COMMANDER' | 'PAUPER' | null;
  objective: 'COMPETITIVE' | 'FUN' | null;
  archetype: 'AGGRO' | 'MIDRANGE' | 'CONTROL' | 'COMBO' | null;
  targetBudget: number;
  commander?: CardVersion | null;
}

// --- CONSTANTES ---

export const API_BASE_URL = 'http://localhost:3001';
