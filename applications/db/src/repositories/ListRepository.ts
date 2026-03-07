import { Database } from '../Database';
import { v4 as uuidv4 } from 'uuid';

export class ListRepository {
  constructor(private database: Database) {}

  async createList(data: { name: string }) {
    const newList = {
      id: uuidv4(),
      name: data.name,
      created_at: new Date().toISOString(),
    };

    await this.database.db
      .insertInto('lists')
      .values(newList)
      .execute();

    return newList;
  }

  async getAllLists() {
    return await this.database.db
      .selectFrom('lists')
      .selectAll()
      .execute();
  }
}
