import { Kysely, SqliteDialect } from 'kysely';
import BetterSqlite3 from 'better-sqlite3';

interface ListTable {
  id: string;
  name: string;
  format: string | null;
  archetype: string | null;
  target_budget: number | null;
  created_at: string;
}

interface DeckCardTable {
  id: string;
  list_id: string;
  card_id: string; // Scryfall ID da versão escolhida
  name: string;
  quantity: number;
  price_brl: string | null;
  category: string;
}

interface MarketDataTable {
  card_id: string;
  card_name: string;
  avg_price: string | null;
  offers_json: string;
  updated_at: string;
}

interface DatabaseSchema {
  lists: ListTable;
  deck_cards: DeckCardTable;
  market_data: MarketDataTable;
}

export class Database {
  public db: Kysely<DatabaseSchema>;
  private sqlite: BetterSqlite3.Database;

  constructor(path: string) {
    this.sqlite = new BetterSqlite3(path);
    this.db = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({
        database: this.sqlite,
      }),
    });
  }

  async migrate() {
    await this.db.schema
      .createTable('lists')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('format', 'text')
      .addColumn('archetype', 'text')
      .addColumn('target_budget', 'real')
      .addColumn('created_at', 'text', (col) => col.notNull())
      .execute();

    await this.db.schema
      .createTable('deck_cards')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('list_id', 'text', (col) => col.references('lists.id').onDelete('cascade'))
      .addColumn('card_id', 'text', (col) => col.notNull())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('quantity', 'integer', (col) => col.notNull())
      .addColumn('price_brl', 'text')
      .addColumn('category', 'text')
      .execute();

    await this.db.schema
      .createTable('market_data')
      .ifNotExists()
      .addColumn('card_id', 'text', (col) => col.primaryKey())
      .addColumn('card_name', 'text', (col) => col.notNull())
      .addColumn('avg_price', 'text')
      .addColumn('offers_json', 'text', (col) => col.notNull())
      .addColumn('updated_at', 'text', (col) => col.notNull())
      .execute();
  }

  async close() {
    await this.db.destroy();
  }
}
