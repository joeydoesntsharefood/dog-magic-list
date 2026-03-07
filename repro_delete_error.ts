
const { Database } = require('./applications/db/src/Database');
const { DeckRepository } = require('./applications/db/src/repositories/DeckRepository');
const path = require('path');
const fs = require('fs');

async function testDeletion(deckId) {
  const dbPath = path.join(process.cwd(), 'applications/back/magic-list.db');
  console.log('--- DIAGNOSTIC START ---');
  console.log('Database Path:', dbPath);
  
  if (!fs.existsSync(dbPath)) {
    console.error('ERROR: Database file not found at', dbPath);
    return;
  }

  const db = new Database(dbPath);
  const deckRepo = new DeckRepository(db);

  try {
    console.log(`Searching for Deck ID: ${deckId}`);
    const deck = await db.db.selectFrom('lists').selectAll().where('id', '=', deckId).executeTakeFirst();
    
    if (!deck) {
      console.log('RESULT: Deck NOT found in database.');
      // Listar alguns IDs para ajudar
      const all = await db.db.selectFrom('lists').select('id').limit(5).execute();
      console.log('Available IDs in DB:', all.map(a => a.id));
      return;
    }
    
    console.log('RESULT: Deck found!', JSON.stringify(deck, null, 2));
    
    console.log('Attempting deletion via deckRepo.deleteDeck...');
    await deckRepo.deleteDeck(deckId);
    console.log('SUCCESS: Deletion completed without throwing.');
    
    const recheck = await db.db.selectFrom('lists').selectAll().where('id', '=', deckId).executeTakeFirst();
    if (recheck) {
      console.error('ERROR: Deck STILL exists after deletion call!');
    } else {
      console.log('VERIFIED: Deck removed from database.');
    }

  } catch (err) {
    console.error('FAILURE DURING DELETION:', err.message);
  } finally {
    await db.close();
    console.log('--- DIAGNOSTIC END ---');
  }
}

const targetId = process.argv[2] || '70c26648-8d50-4bf8-a1a0-9484bbfe4205';
testDeletion(targetId);
