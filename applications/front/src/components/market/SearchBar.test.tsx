import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  it('renders correctly with default state', () => {
    render(
      <SearchBar 
        searchName="" 
        setSearchName={() => {}} 
        onSearch={() => {}} 
        searching={false} 
        suggestions={[]} 
        onSelectSuggestion={() => {}} 
      />
    );

    expect(screen.getByPlaceholderText(/INITIATE_SEARCH/i)).toBeDefined();
    expect(screen.getByText(/INITIATE_SCAN/i)).toBeDefined();
  });

  it('calls setSearchName when input changes', () => {
    const setSearchName = vi.fn();
    render(
      <SearchBar 
        searchName="" 
        setSearchName={setSearchName} 
        onSearch={() => {}} 
        searching={false} 
        suggestions={[]} 
        onSelectSuggestion={() => {}} 
      />
    );

    const input = screen.getByPlaceholderText(/INITIATE_SEARCH/i);
    fireEvent.change(input, { target: { value: 'Counterspell' } });
    
    expect(setSearchName).toHaveBeenCalledWith('Counterspell');
  });

  it('calls onSearch when button is clicked', () => {
    const onSearch = vi.fn();
    render(
      <SearchBar 
        searchName="Counterspell" 
        setSearchName={() => {}} 
        onSearch={onSearch} 
        searching={false} 
        suggestions={[]} 
        onSelectSuggestion={() => {}} 
      />
    );

    fireEvent.click(screen.getByText(/INITIATE_SCAN/i));
    expect(onSearch).toHaveBeenCalled();
  });

  it('renders suggestions when provided', () => {
    const suggestions = [{ id: '1', name: 'Counterspell', mana_cost: '{U}{U}', colors: ['U'] }];
    render(
      <SearchBar 
        searchName="Counterspell" 
        setSearchName={() => {}} 
        onSearch={() => {}} 
        searching={false} 
        suggestions={suggestions} 
        onSelectSuggestion={() => {}} 
      />
    );

    expect(screen.getByText(/CANDIDATES_STREAM/i)).toBeDefined();
    expect(screen.getByText('Counterspell')).toBeDefined();
  });

  it('calls onSelectSuggestion when suggestion is clicked', () => {
    const onSelectSuggestion = vi.fn();
    const suggestions = [{ id: '1', name: 'Counterspell', mana_cost: '{U}{U}', colors: ['U'] }];
    render(
      <SearchBar 
        searchName="Counter" 
        setSearchName={() => {}} 
        onSearch={() => {}} 
        searching={false} 
        suggestions={suggestions} 
        onSelectSuggestion={onSelectSuggestion} 
      />
    );

    fireEvent.click(screen.getByText('Counterspell'));
    expect(onSelectSuggestion).toHaveBeenCalledWith('Counterspell');
  });
});
