import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeckRepository } from '../src/repositories/DeckRepository';
import { Database } from '../src/Database';
import * as fs from 'fs';

describe('DeckRepository - Deleção de Decks', () => {
  let db: Database;
  let repo: DeckRepository;
  const TEST_DB_PATH = './test-deck-delete.db';

  beforeEach(async () => {
    db = new Database(TEST_DB_PATH);
    await db.migrate();
    repo = new DeckRepository(db);
  });

  afterEach(async () => {
    await db.close();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it('deve deletar uma lista e todas as suas cartas associadas', async () => {
    const deck = {
      name: "TEST_DECK",
      format: "COMMANDER",
      archetype: "AGGRO",
      targetBudget: 1000,
      cards: [
        { card_id: "c1", name: "Card 1", quantity: 1, price_brl: "10.00", category: "THREAT" },
        { card_id: "c2", name: "Card 2", quantity: 4, price_brl: "2.50", category: "LAND" }
      ]
    };

    const { id } = await repo.saveFullDeck(deck);
    
    // Verificar se persistiu
    const saved = await repo.getDeckWithCards(id);
    expect(saved.name).toBe("TEST_DECK");
    expect(saved.cards.length).toBe(2);

    // Deletar
    await repo.deleteDeck(id);

    // Verificar se a lista foi removida
    const deletedList = await db.db.selectFrom('lists').selectAll().where('id', '=', id).executeTakeFirst();
    expect(deletedList).toBeUndefined();

    // Verificar se as cartas foram removidas
    const deletedCards = await db.db.selectFrom('deck_cards').selectAll().where('list_id', '=', id).execute();
    expect(deletedCards.length).toBe(0);
  });
});
