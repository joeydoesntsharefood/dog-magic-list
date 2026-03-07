import fastify from 'fastify';
import cors from '@fastify/cors';
import * as path from 'path';
import { Database } from '../../db/src/Database';
import { ListRepository } from '../../db/src/repositories/ListRepository';
import { MarketRepository } from '../../db/src/repositories/MarketRepository';
import { DeckRepository } from '../../db/src/repositories/DeckRepository';
import { PriceService } from './services/PriceService';
import { LigaMagicScraper } from './services/LigaMagicScraper';
import { ImportService } from './services/ImportService';

const server = fastify({ logger: true });
const priceService = new PriceService();
const scraper = new LigaMagicScraper();
const importService = new ImportService(priceService);

const dbPath = path.join(process.cwd(), 'magic-list.db');
const db = new Database(dbPath);
const listRepo = new ListRepository(db);
const marketRepo = new MarketRepository(db);
const deckRepo = new DeckRepository(db);

const start = async () => {
  try {
    await db.migrate();
    await server.register(cors, { origin: '*' });

    server.get('/lists', async () => await listRepo.getAllLists());

    server.get('/search', async (request, reply) => {
      const { q } = request.query as { q: string };
      if (!q) return reply.status(400).send({ error: 'Query obrigatória' });
      return await priceService.searchCards(q);
    });

    server.get('/prices', async (request, reply) => {
      const { name } = request.query as { name: string };
      if (!name) return reply.status(400).send({ error: 'Nome obrigatório' });
      try {
        return await priceService.getCardVersions(name);
      } catch (e: any) {
        return reply.status(404).send({ error: e.message });
      }
    });

    server.post('/decks/import', async (request, reply) => {
      const { rawText } = request.body as { rawText: string };
      if (!rawText) return reply.status(400).send({ error: 'TXT obrigatório' });
      return await importService.importDeck(rawText);
    });

    // NOVO: Endpoint para salvar Deck Completo (US03.7)
    server.post('/decks', async (request, reply) => {
      const data = request.body as any;
      if (!data.name) return reply.status(400).send({ error: 'Nome do deck é obrigatório' });
      try {
        const result = await deckRepo.saveFullDeck(data);
        return reply.status(201).send(result);
      } catch (e) {
        return reply.status(500).send({ error: 'Erro ao salvar deck' });
      }
    });

    server.get('/offers', async (request, reply) => {
      const { name, id, force, url } = request.query as { name: string, id: string, force?: string, url?: string };
      if (!name || !id) return reply.status(400).send({ error: 'Nome e ID são obrigatórios' });
      if (url) return await scraper.getOffers(name, url);

      const cached = await marketRepo.getMarketData(id);
      const isExpired = cached ? (Date.now() - new Date(cached.updated_at).getTime() > 24 * 60 * 60 * 1000) : true;

      if (cached && !isExpired && force !== 'true') {
        return { avgPrice: cached.avg_price, offers: JSON.parse(cached.offers_json), updatedAt: cached.updated_at, fromCache: true };
      }

      const result = await scraper.getOffers(name);
      if (result.options && result.options.length > 0) return { ...result, fromCache: false };

      if (result.offers.length > 0 || result.avgPrice) {
        await marketRepo.saveMarketData({ card_id: id, card_name: name, avg_price: result.avgPrice, offers_json: JSON.stringify(result.offers), updated_at: new Date().toISOString() });
        return { ...result, updatedAt: new Date().toISOString(), fromCache: false };
      }
      return { avgPrice: null, offers: [], updatedAt: null };
    });

    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ Backend REST API ativo (V3 - Full Deck Persistence)');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
