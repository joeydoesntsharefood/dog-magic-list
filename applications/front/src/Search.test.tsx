import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('US01.5: Frontend - Consulta Rápida de Preços', () => {
  beforeEach(() => {
    vi.stubGlobal('import.meta', { env: { MODE: 'test' } });
    
    vi.mocked(fetch).mockImplementation((url: any) => {
      if (url.includes('/lists')) return Promise.resolve({ ok: true, json: async () => [] } as Response);
      if (url.includes('/search')) return Promise.resolve({ 
        ok: true, 
        json: async () => [{ id: '1', name: 'Black Lotus', mana_cost: '{0}', colors: [] }] 
      } as Response);
      if (url.includes('/prices')) return Promise.resolve({
        ok: true,
        json: async () => ({
          name: 'Black Lotus',
          versions: [{
            id: '1', name: 'Black Lotus', rarity: 'rare', priceUSD: '10.00', priceBRL: '55.20',
            imageUrl: 'http://image.url', scryfallUri: 'http://scryfall.url', colorIdentity: [],
            legalities: { commander: 'legal' }, category: 'THREAT', setName: 'Alpha', cmc: 0
          }]
        })
      } as Response);
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });
  });

  it('deve buscar, selecionar e exibir o preço convertido', async () => {
    render(<App />);
    
    // 1. Ir para MARKET
    const tabButton = await screen.findByText(/MARKET/i);
    fireEvent.click(tabButton);
    
    // 2. Digitar busca
    const input = await screen.findByPlaceholderText(/INITIATE_SEARCH.../i);
    fireEvent.change(input, { target: { value: 'Black Lotus' } });
    
    // 3. Clicar scan
    const button = screen.getByText(/\[INITIATE_SCAN\]/i);
    fireEvent.click(button);

    // 4. Aguardar a Stream aparecer
    await waitFor(() => {
      expect(screen.getByText(/CANDIDATES_STREAM/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // 5. Clicar na sugestão (usando getAll pq pode ter o texto no log também)
    const suggestions = await screen.findAllByText(/Black Lotus/i);
    fireEvent.click(suggestions[0]);

    // 6. Validar preço
    await waitFor(() => {
      expect(screen.getByText(/55,20/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
