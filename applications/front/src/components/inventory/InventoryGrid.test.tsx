import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InventoryGrid from './InventoryGrid';
import { List } from '../../types';

describe('InventoryGrid Component', () => {
  const mockLists: List[] = [
    { id: '1', name: 'DECK ALPHA', format: 'COMMANDER' },
    { id: '2', name: 'DECK BETA', format: 'STANDARD' }
  ];

  it('renders a list of decks', () => {
    render(
      <InventoryGrid 
        lists={mockLists} 
        onViewDeck={() => {}} 
        onDeleteDeck={() => {}} 
        onInitiateNewBuild={() => {}}
        confirmingDeleteDeckId={null}
        setConfirmingDeleteDeckId={() => {}}
      />
    );

    expect(screen.getByText('DECK ALPHA')).toBeDefined();
    expect(screen.getByText('DECK BETA')).toBeDefined();
    expect(screen.getByText('COMMANDER')).toBeDefined();
    expect(screen.getByText('STANDARD')).toBeDefined();
  });

  it('calls onViewDeck when a deck card is clicked', () => {
    const onViewDeck = vi.fn();
    render(
      <InventoryGrid 
        lists={mockLists} 
        onViewDeck={onViewDeck} 
        onDeleteDeck={() => {}} 
        onInitiateNewBuild={() => {}}
        confirmingDeleteDeckId={null}
        setConfirmingDeleteDeckId={() => {}}
      />
    );

    fireEvent.click(screen.getByText('DECK ALPHA'));
    expect(onViewDeck).toHaveBeenCalledWith('1');
  });

  it('shows empty state message when no lists are provided', () => {
    render(
      <InventoryGrid 
        lists={[]} 
        onViewDeck={() => {}} 
        onDeleteDeck={() => {}} 
        onInitiateNewBuild={() => {}}
        confirmingDeleteDeckId={null}
        setConfirmingDeleteDeckId={() => {}}
      />
    );

    expect(screen.getByText(/No_Records_Found/i)).toBeDefined();
  });

  it('calls onInitiateNewBuild when the button is clicked', () => {
    const onInitiateNewBuild = vi.fn();
    render(
      <InventoryGrid 
        lists={[]} 
        onViewDeck={() => {}} 
        onDeleteDeck={() => {}} 
        onInitiateNewBuild={onInitiateNewBuild}
        confirmingDeleteDeckId={null}
        setConfirmingDeleteDeckId={() => {}}
      />
    );

    fireEvent.click(screen.getByText(/INITIATE_NEW_BUILD/i));
    expect(onInitiateNewBuild).toHaveBeenCalled();
  });
});
