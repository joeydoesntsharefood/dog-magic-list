import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeckDetail from './DeckDetail';

describe('DeckDetail Component', () => {
  const mockDeck = {
    id: '1',
    name: 'ELDRAZI DECK',
    format: 'COMMANDER',
    analysis_json: null,
    cards: [
      { id: 'c1', card_id: '123', name: 'Sol Ring', quantity: 1, category: 'RAMP', cmc: 1, price_brl: '50.00' },
      { id: 'c2', card_id: '456', name: 'Plains', quantity: 36, category: 'LAND', cmc: 0, price_brl: '1.00' }
    ]
  };

  it('renders deck name and card list', () => {
    render(<DeckDetail deck={mockDeck} onBack={() => {}} onUpdateAnalysis={() => {}} />);
    
    expect(screen.getByText('ELDRAZI DECK')).toBeDefined();
    expect(screen.getByText('Sol Ring')).toBeDefined();
    expect(screen.getByText('Plains')).toBeDefined();
    expect(screen.getByText('36x')).toBeDefined();
  });

  it('shows generate analysis button when analysis_json is missing', () => {
    render(<DeckDetail deck={mockDeck} onBack={() => {}} onUpdateAnalysis={() => {}} />);
    
    expect(screen.getByText(/No_Structural_Diagnosis_Found/i)).toBeDefined();
    expect(screen.getByText(/GENERATE_STRUCTURAL_DIAGNOSIS/i)).toBeDefined();
  });

  it('calls onUpdateAnalysis when generate button is clicked', () => {
    const onUpdateAnalysis = vi.fn();
    render(<DeckDetail deck={mockDeck} onBack={() => {}} onUpdateAnalysis={onUpdateAnalysis} />);
    
    fireEvent.click(screen.getByText(/GENERATE_STRUCTURAL_DIAGNOSIS/i));
    
    expect(onUpdateAnalysis).toHaveBeenCalledWith('1', expect.objectContaining({
      manaCurve: expect.any(Array),
      pillars: expect.objectContaining({
        LANDS: 36,
        RAMP: 1
      })
    }));
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<DeckDetail deck={mockDeck} onBack={onBack} onUpdateAnalysis={() => {}} />);
    
    fireEvent.click(screen.getByText(/\[BACK_TO_REGISTRY\]/i));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders charts when analysis_json is present', () => {
    const analysis = {
      manaCurve: [0, 1, 0, 0, 0, 0, 0, 0],
      pillars: { LANDS: 36, RAMP: 1, DRAW: 0, INTERACTION: 0 }
    };
    const deckWithAnalysis = { ...mockDeck, analysis_json: JSON.stringify(analysis) };
    
    render(<DeckDetail deck={deckWithAnalysis} onBack={() => {}} onUpdateAnalysis={() => {}} />);
    
    expect(screen.getByText(/\/\/ MANA_CURVE_DISTRIBUTION/i)).toBeDefined();
    expect(screen.getByText(/\/\/ PILLAR_COMPLIANCE/i)).toBeDefined();
    expect(screen.getByText('36 / 36')).toBeDefined(); // Target lands in Commander is 36
  });
});
