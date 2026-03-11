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
    <div className={`mb-16 ${!isTest ? 'animate-in fade-in duration-500' : ''}`} data-testid="search-bar">
      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors text-lg italic font-serif">?</span>
          <input 
            type="text" 
            placeholder="Query market database..." 
            value={searchName} 
            onChange={(e) => setSearchName(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && onSearch()} 
            className="w-full bg-surface border border-border p-5 pl-12 rounded-sm focus:outline-none focus:border-primary/50 transition-all text-sm font-medium text-white placeholder:text-slate-600 uppercase tracking-widest" 
          />
        </div>
        <button 
          onClick={onSearch} 
          disabled={searching} 
          className="px-10 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-sm hover:bg-white transition-all disabled:opacity-30"
        >
          {searching ? 'Scanning...' : 'Execute_Scan'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full max-w-2xl bg-surface border border-primary/20 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-3 px-5 border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-secondary bg-white/5">Candidates_Stream</div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {suggestions.map(card => (
              <div 
                key={card.id} 
                onClick={() => onSelectSuggestion(card.name)} 
                className="p-4 border-b border-white/5 last:border-0 hover:bg-primary/5 cursor-pointer flex justify-between items-center transition-all group"
                data-testid={`suggestion-${card.id}`}
              >
                <span className="text-sm font-bold text-slate-300 group-hover:text-primary tracking-tight uppercase">{card.name}</span>
                <ColorIdentityDots colors={card.colors} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
