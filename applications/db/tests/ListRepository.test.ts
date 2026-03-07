import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ListRepository } from '../src/repositories/ListRepository';
import { Database } from '../src/Database';
import * as fs from 'fs';

describe('US01.1: ListRepository - Criação de Listas', () => {
  let db: Database;
  let repo: ListRepository;
  const TEST_DB_PATH = './test-magic.db';

  beforeEach(async () => {
    // Setup do banco de dados em memória ou arquivo temporário para teste
    db = new Database(TEST_DB_PATH);
    await db.migrate(); // Criar as tabelas
    repo = new ListRepository(db);
  });

  afterEach(async () => {
    await db.close();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it('deve criar uma nova lista com nome "Meus Decks" e retornar o ID', async () => {
    const listName = "Meus Decks";
    const result = await repo.createList({ name: listName });
    
    expect(result.id).toBeDefined();
    expect(result.name).toBe(listName);
    
    // Validar se persistiu
    const lists = await repo.getAllLists();
    expect(lists.length).toBe(1);
    expect(lists[0].name).toBe(listName);
  });
});
