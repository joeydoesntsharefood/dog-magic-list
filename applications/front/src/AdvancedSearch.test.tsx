import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('US01.6: Frontend - Busca Avançada e Seleção', () => {
  beforeEach(() => {
    vi.stubGlobal('import.meta', { env: { MODE: 'test' } });
    
    vi.mocked(fetch).mockImplementation((url: any) => {
      if (url.includes('/lists')) return Promise.resolve({ ok: true, json: async () => [] } as Response);
      if (url.includes('/search')) return Promise.resolve({ 
        ok: true, 
        json: async () => [{ id: '1', name: 'Prefeito de Avabruck', mana_cost: '{1}{G}', colors: ['G'] }] 
      } as Response);
      if (url.includes('/prices')) return Promise.resolve({
        ok: true,
        json: async () => ({
          name: 'Prefeito de Avabruck',
          versions: [{
            id: '1', name: 'Prefeito de Avabruck', rarity: 'rare', priceUSD: '10.00', priceBRL: '50.00',
            imageUrl: 'http://image.url', scryfallUri: 'http://scryfall.url', colorIdentity: ['G'],
            legalities: { commander: 'legal' }, category: 'THREAT', setName: 'Innistrad', cmc: 2
          }]
        })
      } as Response);
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });
    vi.stubGlobal('Notification', vi.fn(() => ({ permission: 'granted' })));
  });

  it('deve exibir uma lista de sugestões após a busca', async () => {
    render(<App />);
    const tabButton = await screen.findByText(/MARKET/i);
    fireEvent.click(tabButton);
    
    const input = await screen.findByPlaceholderText(/INITIATE_SEARCH.../i);
    fireEvent.change(input, { target: { value: 'Prefeito' } });
    
    const button = screen.getByText(/\[INITIATE_SCAN\]/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/CANDIDATES_STREAM/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const suggestion = await screen.findByText(/Prefeito de Avabruck/i);
    expect(suggestion).toBeInTheDocument();
  });

  it('deve exibir detalhes da carta ao selecionar um candidato', async () => {
    render(<App />);
    const tabButton = await screen.findByText(/MARKET/i);
    fireEvent.click(tabButton);
    
    const input = await screen.findByPlaceholderText(/INITIATE_SEARCH.../i);
    fireEvent.change(input, { target: { value: 'Prefeito' } });
    
    const button = screen.getByText(/\[INITIATE_SCAN\]/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/CANDIDATES_STREAM/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const suggestion = await screen.findByText(/Prefeito de Avabruck/i);
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.getByText(/50,00/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
