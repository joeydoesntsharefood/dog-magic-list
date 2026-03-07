import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('US03.1: Frontend - Wizard de Construção de Decks', () => {
  beforeEach(() => {
    vi.stubGlobal('import.meta', { env: { MODE: 'test' } });
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/lists')) return Promise.resolve({ ok: true, json: async () => [] });
      if (url.includes('/search')) return Promise.resolve({ ok: true, json: async () => [{ id: 'c1', name: 'Atraxa', mana_cost: '{G}{W}{U}{B}', colors: ['G','W','U','B'] }] });
      if (url.includes('/prices')) return Promise.resolve({
        ok: true,
        json: async () => ({
          name: 'Atraxa',
          versions: [{ 
            id: 'v1', name: 'Atraxa', colorIdentity: ['G','W','U','B'], legalities: { commander: 'legal' }, 
            priceBRL: '100.00', imageUrl: 'http://atraxa.img', category: 'THREAT', setName: 'Commander 2016'
          }]
        })
      });
      return Promise.resolve({ ok: true, json: async () => [] });
    }));
  });

  it('deve iniciar o Wizard e apresentar as perguntas de perfil', async () => {
    render(<App />);
    const wizardBtn = await screen.findByText(/\[\+ NEW_GRIMOIRE\]/i);
    fireEvent.click(wizardBtn);
    expect(screen.getByText(/SELECT_DECK_FORMAT/i)).toBeInTheDocument();
  });

  it('deve permitir configurar o budget e passar pelo fluxo de comandante', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText(/\[\+ NEW_GRIMOIRE\]/i));
    
    fireEvent.click(screen.getByText(/COMMANDER/i));
    fireEvent.click(screen.getByText(/COMPETITIVE/i));
    fireEvent.click(screen.getByText(/MIDRANGE/i));

    const budgetInput = screen.getByPlaceholderText(/SET_LIMIT_BRL.../i);
    fireEvent.change(budgetInput, { target: { value: '1000' } });
    
    fireEvent.click(screen.getByText(/\[PROCEED_TO_COMMANDER\]/i));

    expect(screen.getByText(/DESIGNATE_COMMANDER/i)).toBeInTheDocument();
    
    const cmdInput = screen.getByPlaceholderText(/QUERY_LEGENDARY.../i);
    fireEvent.change(cmdInput, { target: { value: 'Atraxa' } });
    fireEvent.click(screen.getByText(/Search/i));

    const suggestion = await screen.findByText(/Atraxa/i);
    fireEvent.click(suggestion);

    const designBtn = await screen.findByText(/\[DESIGNATE_COMMANDER\]/i);
    fireEvent.click(designBtn);

    await waitFor(() => {
      expect(screen.getByText(/BUDGET_REMAINING: R\$ 1\.000,00/i)).toBeInTheDocument();
    });
  });
});
