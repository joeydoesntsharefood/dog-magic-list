import React from 'react';
import ColorIdentityDots from '../../shared/ColorIdentityDots';
import { CardSuggestion, CardVersion, DeckProfile } from '../../../types';

interface CommanderStepProps {
  searchName: string;
  setSearchName: (name: string) => void;
  onSearch: (name: string) => void;
  suggestions: CardSuggestion[];
  onSelectCard: (name: string) => void;
  selectedVersion: CardVersion | null;
  onDesignateCommander: (version: CardVersion) => void;
  setExpandedCard: (url: string | null) => void;
}

const CommanderStep: React.FC<CommanderStepProps> = ({ 
  searchName,
  setSearchName,
  onSearch, 
  suggestions, 
  onSelectCard, 
  selectedVersion, 
  onDesignateCommander,
  setExpandedCard
}) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in" data-testid="wizard-commander-step">
      <h3 className="text-xs font-black text-[#9E8C6A] uppercase tracking-widest text-center">// DESIGNATE_COMMANDER</h3>
      <div className="relative flex gap-2">
        <input 
          type="text" 
          placeholder="QUERY_LEGENDARY..." 
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(searchName)} 
          className="flex-1 bg-black border border-zinc-800 p-4 focus:border-[#9E8C6A] outline-none text-xs uppercase" 
        />
        <button 
          onClick={() => onSearch(searchName)} 
          className="bg-zinc-900 px-6 border border-zinc-800 text-[10px] font-black uppercase"
        >
          Search
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto border border-zinc-900 bg-black">
        {suggestions.map(card => (
          <div 
            key={card.id} 
            onClick={() => onSelectCard(card.name)} 
            className="p-4 border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer text-xs font-bold flex justify-between uppercase"
          >
            <span>{card.name}</span> <ColorIdentityDots colors={card.colors} />
          </div>
        ))}
      </div>
      {selectedVersion && (
        <div className="flex flex-col items-center gap-6 animate-in zoom-in-95">
          <div 
            className="pixel-border border-2 border-zinc-800 p-1 bg-zinc-900 cursor-zoom-in" 
            onDoubleClick={() => setExpandedCard(selectedVersion.imageUrl)}
          >
            <img src={selectedVersion.imageUrl} className="w-64 grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
          <button 
            onClick={() => onDesignateCommander(selectedVersion)} 
            className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-[#8A3A34] hover:text-white transition-all"
          >
            [DESIGNATE_COMMANDER]
          </button>
        </div>
      )}
    </div>
  );
};

export default CommanderStep;
