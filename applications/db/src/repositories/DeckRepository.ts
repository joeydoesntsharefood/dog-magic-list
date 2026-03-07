import { Database } from '../Database';
import { v4 as uuidv4 } from 'uuid';

export interface SaveDeckDTO {
  name: string;
  format: string | null;
  archetype: string | null;
  targetBudget: number | null;
  cards: {
    card_id: string;
    name: string;
    quantity: number;
    price_brl: string | null;
    category: string;
  }[];
}

export class DeckRepository {
  constructor(private database: Database) {}

  async saveFullDeck(data: SaveDeckDTO) {
    const listId = uuidv4();

    // Iniciar Transação
    await this.database.db.transaction().execute(async (trx) => {
      // 1. Salvar Lista Principal
      await trx
        .insertInto('lists')
        .values({
          id: listId,
          name: data.name,
          format: data.format,
          archetype: data.archetype,
          target_budget: data.targetBudget,
          created_at: new Date().toISOString()
        })
        .execute();

      // 2. Salvar Cartas do Deck
      if (data.cards.length > 0) {
        const cardRecords = data.cards.map(c => ({
          id: uuidv4(),
          list_id: listId,
          card_id: c.card_id,
          name: c.name,
          quantity: c.quantity,
          price_brl: c.price_brl,
          category: c.category
        }));

        await trx.insertInto('deck_cards').values(cardRecords).execute();
      }
    });

    return { id: listId };
  }

  async getDeckWithCards(listId: string) {
    const list = await this.database.db
      .selectFrom('lists')
      .selectAll()
      .where('id', '=', listId)
      .executeTakeFirst();

    const cards = await this.database.db
      .selectFrom('deck_cards')
      .selectAll()
      .where('list_id', '=', listId)
      .execute();

    return { ...list, cards };
  }
}
