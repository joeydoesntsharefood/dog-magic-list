import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('US01.1: Frontend - Listagem de Decks (REST API)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('import.meta', { env: { MODE: 'test' } });
  });

  it('deve carregar e exibir as listas do backend ao iniciar', async () => {
    const mockLists = [
      { id: '1', name: 'DECK TESTE', format: 'COMMANDER', created_at: new Date().toISOString() }
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLists,
    } as Response);

    render(<App />);

    const deckName = await screen.findByText(/DECK TESTE/i);
    expect(deckName).toBeInTheDocument();
    expect(screen.getByText(/COMMANDER/i)).toBeInTheDocument();
  });
});
