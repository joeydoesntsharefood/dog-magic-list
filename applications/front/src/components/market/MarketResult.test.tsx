import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarketResult from './MarketResult';
import { CardVersion, CardPriceResult } from '../../types';

describe('MarketResult Component', () => {
  const mockVersion: CardVersion = {
    id: '1', name: 'Counterspell', setName: 'Ice Age', setCode: 'ice', rarity: 'common',
    priceUSD: '1.00', priceFoilUSD: null, priceBRL: '5.00', priceFoilBRL: null,
    imageUrl: 'http://image.jpg', scryfallUri: 'http://scryfall.com', category: 'INTERACTION',
    cmc: 2, legalities: {}, colorIdentity: ['U']
  };

  const mockSearchResult: CardPriceResult = {
    name: 'Counterspell',
    versions: [mockVersion]
  };

  it('renders card name and image', () => {
    render(
      <MarketResult 
        searchResult={mockSearchResult} 
        selectedVersion={mockVersion} 
        onVersionChange={() => {}} 
        onFetchOffers={() => {}} 
        loadingOffers={false} 
        offersData={null} 
        onImageDoubleClick={() => {}}
      />
    );

    expect(screen.getByText('Counterspell')).toBeDefined();
    const image = screen.getByAltText('Counterspell');
    expect(image.getAttribute('src')).toBe('http://image.jpg');
  });

  it('renders version table', () => {
    render(
      <MarketResult 
        searchResult={mockSearchResult} 
        selectedVersion={mockVersion} 
        onVersionChange={() => {}} 
        onFetchOffers={() => {}} 
        loadingOffers={false} 
        offersData={null} 
        onImageDoubleClick={() => {}}
      />
    );

    expect(screen.getByText('Ice Age')).toBeDefined();
    expect(screen.getByText('R$ 5,00')).toBeDefined();
  });

  it('calls onVersionChange when a version row is clicked', () => {
    const onVersionChange = vi.fn();
    render(
      <MarketResult 
        searchResult={mockSearchResult} 
        selectedVersion={mockVersion} 
        onVersionChange={onVersionChange} 
        onFetchOffers={() => {}} 
        loadingOffers={false} 
        offersData={null} 
        onImageDoubleClick={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Ice Age'));
    expect(onVersionChange).toHaveBeenCalledWith(mockVersion);
  });

  it('shows loading state when offers are being fetched', () => {
    render(
      <MarketResult 
        searchResult={mockSearchResult} 
        selectedVersion={mockVersion} 
        onVersionChange={() => {}} 
        onFetchOffers={() => {}} 
        loadingOffers={true} 
        offersData={null} 
        onImageDoubleClick={() => {}}
      />
    );

    expect(screen.getByText(/SYNCHRONIZING_MARKET/i)).toBeDefined();
  });

  it('calls onFetchOffers when re-scan button is clicked', () => {
    const onFetchOffers = vi.fn();
    render(
      <MarketResult 
        searchResult={mockSearchResult} 
        selectedVersion={mockVersion} 
        onVersionChange={() => {}} 
        onFetchOffers={onFetchOffers} 
        loadingOffers={false} 
        offersData={null} 
        onImageDoubleClick={() => {}}
      />
    );

    fireEvent.click(screen.getByText(/RE_SCAN/i));
    expect(onFetchOffers).toHaveBeenCalledWith('Counterspell', '1', true);
  });
});
