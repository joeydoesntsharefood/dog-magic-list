import { Database } from '../Database';

export interface MarketData {
  card_id: string;
  card_name: string;
  avg_price: string | null;
  offers_json: string;
  updated_at: string;
}

export class MarketRepository {
  constructor(private database: Database) {}

  async getMarketData(cardId: string) {
    return await this.database.db
      .selectFrom('market_data')
      .selectAll()
      .where('card_id', '=', cardId)
      .executeTakeFirst();
  }

  async saveMarketData(data: MarketData) {
    // Tenta inserir, se já existir faz update (Upsert)
    const existing = await this.getMarketData(data.card_id);

    if (existing) {
      await this.database.db
        .updateTable('market_data')
        .set({
          avg_price: data.avg_price,
          offers_json: data.offers_json,
          updated_at: data.updated_at
        })
        .where('card_id', '=', data.card_id)
        .execute();
    } else {
      await this.database.db
        .insertInto('market_data')
        .values(data)
        .execute();
    }
  }
}
