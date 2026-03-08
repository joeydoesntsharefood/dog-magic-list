import React from 'react';
import ColorIdentityDots from '../shared/ColorIdentityDots';
import { CardSuggestion } from '../../types';

interface SearchBarProps {
  searchName: string;
  setSearchName: (name: string) => void;
  onSearch: () => void;
  searching: boolean;
  suggestions: CardSuggestion[];
  onSelectSuggestion: (name: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchName, 
  setSearchName, 
  onSearch, 
  searching, 
  suggestions, 
  onSelectSuggestion 
}) => {
  const isTest = (import.meta as any).env?.MODE === 'test';

  return (
    <div className={`mb-12 ${!isTest ? 'animate-in fade-in duration-500' : ''}`} data-testid="search-bar">
      <div className="flex gap-2 mb-12">
        <div className="flex-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-zinc-500">// INPUT_PROMPT</h2>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">{`>>`}</span>
            <input 
              type="text" 
              placeholder="INITIATE_SEARCH..." 
              value={searchName} 
              onChange={(e) => setSearchName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && onSearch()} 
              className="w-full bg-[#0F0F0F] border border-[#1C1C1C] p-4 pl-12 focus:outline-none focus:border-zinc-600 transition-all uppercase text-xs tracking-widest" 
            />
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <button 
            onClick={onSearch} 
            disabled={searching} 
            className="h-[52px] px-8 bg-zinc-900 border border-zinc-800 text-[10px] font-black hover:bg-white hover:text-black transition-all disabled:opacity-30 uppercase tracking-widest"
          >
            {searching ? '[BUSY...]' : '[INITIATE_SCAN]'}
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="border border-[#1C1C1C] bg-black">
          <div className="p-2 px-4 border-b border-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-500">CANDIDATES_STREAM</div>
          {suggestions.map(card => (
            <div 
              key={card.id} 
              onClick={() => onSelectSuggestion(card.name)} 
              className="p-4 border-b border-zinc-900 last:border-0 hover:bg-zinc-900 cursor-pointer flex justify-between items-center transition-colors"
              data-testid={`suggestion-${card.id}`}
            >
              <span className="text-xs font-bold uppercase">{card.name}</span>
              <ColorIdentityDots colors={card.colors} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
