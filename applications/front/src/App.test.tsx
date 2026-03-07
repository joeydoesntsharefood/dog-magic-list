import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('US01.1: Frontend - Criação de Listas (REST API)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('import.meta', { env: { MODE: 'test' } });
  });

  it('deve chamar a API POST ao clicar no botão de criar lista', async () => {
    const mockFetch = vi.mocked(fetch);
    
    // Mock do GET inicial e do POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'MEUS DECKS' }),
    } as Response);

    render(<App />);
    
    // Aguarda o loading
    const input = await screen.findByPlaceholderText(/ENTER_NAME.../i);
    const button = screen.getByText(/\[EXECUTE_CREATE\]/i);

    fireEvent.change(input, { target: { value: 'MEUS DECKS' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/lists', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'MEUS DECKS' }),
      }));
    });
  });
});
