import React from 'react';
import ColorIdentityDots from '../../shared/ColorIdentityDots';
import { CardSuggestion, CardVersion, CardPriceResult, WizardDeckItem, DeckProfile } from '../../../types';

interface ConstructionStepProps {
  deckProfile: DeckProfile;
  searchName: string;
  setSearchName: (name: string) => void;
  onSearchCards: () => void;
  suggestions: CardSuggestion[];
  onSelectCard: (name: string) => void;
  selectedVersion: CardVersion | null;
  searchResult: CardPriceResult | null;
  wizardQuantity: number;
  setWizardQuantity: (q: number) => void;
  onAddCard: (cardResult: CardPriceResult, selected: CardVersion) => void;
  wizardDeck: WizardDeckItem[];
  deckLocalFilter: string;
  setDeckLocalFilter: (f: string) => void;
  onPurgeViolations: () => void;
  onRemoveCard: (uid: string) => void;
  onUpdateCardVersion: (uid: string, version: CardVersion) => void;
  setExpandedCard: (url: string | null) => void;
  onNext: () => void;
  confirmingRemoveCardUid: string | null;
  setConfirmingRemoveCardUid: (uid: string | null) => void;
  activeEditionSelector: number | null;
  setActiveEditionSelector: (idx: number | null) => void;
  validateCardLegality: (card: CardVersion) => { isLegal: boolean; reason?: string };
}

const ConstructionStep: React.FC<ConstructionStepProps> = ({ 
  deckProfile, 
  searchName, 
  setSearchName, 
  onSearchCards, 
  suggestions, 
  onSelectCard, 
  selectedVersion, 
  searchResult, 
  wizardQuantity, 
  setWizardQuantity, 
  onAddCard, 
  wizardDeck, 
  deckLocalFilter, 
  setDeckLocalFilter, 
  onPurgeViolations, 
  onRemoveCard, 
  onUpdateCardVersion, 
  setExpandedCard, 
  onNext,
  confirmingRemoveCardUid,
  setConfirmingRemoveCardUid,
  activeEditionSelector,
  setActiveEditionSelector,
  validateCardLegality
}) => {
  const filteredDeck = wizardDeck.filter(item => 
    !deckLocalFilter.trim() || 
    item.selectedVersion.name.toLowerCase().includes(deckLocalFilter.toLowerCase()) || 
    item.selectedVersion.category.toLowerCase().includes(deckLocalFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start animate-in fade-in" data-testid="wizard-construction-step">
      <div className="w-full lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-0">
        {deckProfile.commander && (
          <div className="border border-[#9E8C6A]/20 bg-[#9E8C6A]/5 p-4 flex gap-4 items-center">
            <div className="w-16 h-16 grayscale border border-zinc-800 overflow-hidden cursor-zoom-in" onDoubleClick={() => setExpandedCard(deckProfile.commander?.imageUrl || null)}>
              <img src={deckProfile.commander.imageUrl} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black text-[#9E8C6A] uppercase">Commander</p>
              <p className="text-[10px] font-bold uppercase truncate">{deckProfile.commander.name}</p>
              <ColorIdentityDots colors={deckProfile.commander.colorIdentity} />
            </div>
          </div>
        )}
        <input 
          type="text" 
          placeholder="ADD_CARD..." 
          value={searchName} 
          onChange={(e) => setSearchName(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && onSearchCards()} 
          className="w-full bg-[#0F0F0F] border border-[#1C1C1C] p-3 text-[10px] focus:border-zinc-600 outline-none uppercase" 
        />
        <div className="max-h-60 overflow-y-auto border border-zinc-900 bg-black">
          {suggestions.map(card => (
            <div 
              key={card.id} 
              onClick={() => onSelectCard(card.name)} 
              className="p-3 border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer text-[10px] font-bold flex justify-between uppercase"
            >
              <span>{card.name}</span> <ColorIdentityDots colors={card.colors} />
            </div>
          ))}
        </div>
        {selectedVersion && searchResult && (
          <div className="border border-zinc-800 p-4 bg-zinc-950 animate-in zoom-in-95">
            <div className="cursor-zoom-in mb-4" onDoubleClick={() => setExpandedCard(selectedVersion.imageUrl)}>
              <img src={selectedVersion.imageUrl} className="w-full grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="flex items-center justify-between mb-4 border border-zinc-800 p-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase">Quantity</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setWizardQuantity(Math.max(1, wizardQuantity-1))} className="text-zinc-500 hover:text-white px-2">[-]</button>
                <span className="text-xs font-black">{wizardQuantity}</span>
                <button 
                  onClick={() => setWizardQuantity(wizardQuantity+1)} 
                  disabled={deckProfile.format === 'COMMANDER' && !selectedVersion?.setName?.toLowerCase().includes('basic land') && !['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Ilha', 'Pântano', 'Montanha', 'Floresta', 'Planície'].includes(selectedVersion.name)} 
                  className="text-zinc-500 hover:text-white px-2 disabled:opacity-20"
                >
                  [+]
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 text-[10px]">
              <ColorIdentityDots colors={selectedVersion.colorIdentity} /><span className="text-green-500 font-black">R$ {selectedVersion.priceBRL}</span>
            </div>
            <button onClick={() => onAddCard(searchResult, selectedVersion)} className="w-full bg-zinc-800 text-[10px] font-black p-2 hover:bg-white hover:text-black uppercase">[COMMIT_TO_DECK]</button>
          </div>
        )}
      </div>

      <div className="flex-1 w-full space-y-8">
        <div className="flex flex-col gap-4 border-b border-zinc-900 pb-4">
          <div className="flex justify-between items-center font-black text-[10px] text-zinc-500 tracking-widest uppercase">
            <span>// DECK_REGISTRY</span> <span>{wizardDeck.reduce((a,b)=>a+b.quantity, 0)} CARDS</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="FILTER..." 
              value={deckLocalFilter} 
              onChange={(e) => setDeckLocalFilter(e.target.value)} 
              className="flex-1 bg-black border border-zinc-800 p-2 text-[10px] focus:border-zinc-600 outline-none uppercase" 
            />
            <button onClick={onPurgeViolations} className="bg-zinc-900 border border-[#8A3A34] text-[#8A3A34] px-4 text-[8px] font-black uppercase hover:bg-[#8A3A34] hover:text-white transition-all">[PURGE]</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
          {filteredDeck.map((item, i) => {
            const legality = validateCardLegality(item.selectedVersion);
            const validVersions = item.allVersions.filter(v => v.priceBRL && parseFloat(v.priceBRL) > 0);
            const avgPrice = validVersions.length > 0 ? validVersions.reduce((a,b)=>a + parseFloat(b.priceBRL || '0'), 0) / validVersions.length : 0;
            return (
              <div key={item.uid} className={`p-4 bg-black flex justify-between items-center hover:bg-zinc-950 group border-l-4 ${legality.isLegal ? 'border-transparent' : 'border-[#8A3A34] animate-pulse'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-[8px] text-zinc-700 font-bold">{item.quantity}x</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase cursor-zoom-in" onDoubleClick={() => setExpandedCard(item.selectedVersion.imageUrl)}>{item.selectedVersion.name}</span>
                    {!legality.isLegal && <span className="text-[8px] text-[#8A3A34] font-black uppercase tracking-tighter">{legality.reason}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-6 relative">
                  <div className="group relative">
                    <div className="flex flex-col items-end cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveEditionSelector(activeEditionSelector === i ? null : i); }}>
                      <span className="text-[8px] font-bold text-zinc-600 uppercase">Avg: {avgPrice > 0 ? `R$ ${avgPrice.toFixed(2).replace('.',',')}` : '--'}</span>
                      <span className="text-xs font-black text-zinc-300">R$ {item.selectedVersion.priceBRL?.replace('.', ',') || '--'}</span>
                    </div>
                  </div>
                  {activeEditionSelector === i && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#0A0A0A] border border-[#9E8C6A] z-[60] p-4 shadow-2xl animate-in slide-in-from-top-2" onClick={(e)=>e.stopPropagation()}>
                      <h4 className="text-[9px] font-black text-[#9E8C6A] mb-4 uppercase border-b border-zinc-900 pb-2">Select_Edition_Tuning</h4>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                        {item.allVersions.map(v => (
                          <div 
                            key={v.id} 
                            onClick={() => { onUpdateCardVersion(item.uid, v); setActiveEditionSelector(null); }} 
                            className={`p-2 flex justify-between items-center hover:bg-zinc-900 cursor-pointer border ${item.selectedVersion.id === v.id ? 'border-[#9E8C6A]/40 bg-zinc-900' : 'border-transparent'}`}
                          >
                            <div className="flex flex-col"><span className="text-[9px] font-bold uppercase truncate max-w-[180px]">{v.setName}</span><span className="text-[7px] text-zinc-600 uppercase">{v.rarity}</span></div>
                            <span className="text-[10px] font-black text-green-600">R$ {v.priceBRL?.replace('.',',') || '--'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      if (confirmingRemoveCardUid === item.uid) onRemoveCard(item.uid);
                      else setConfirmingRemoveCardUid(item.uid);
                    }} 
                    onMouseLeave={() => setConfirmingRemoveCardUid(null)}
                    className={`ml-4 text-[10px] font-black transition-all ${confirmingRemoveCardUid === item.uid ? 'text-[#8A3A34] animate-pulse underline' : 'text-zinc-700 hover:text-[#8A3A34]'}`}
                  >
                    {confirmingRemoveCardUid === item.uid ? '[CONFIRM_REMOVE?]' : '[X]'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button 
          onClick={onNext} 
          disabled={wizardDeck.length === 0} 
          className="w-full bg-white text-black p-4 font-black uppercase tracking-widest hover:bg-[#8A3A34] hover:text-white transition-all disabled:opacity-20"
        >
          [FINAL_DECISION_PROMPT]
        </button>
      </div>
    </div>
  );
};

export default ConstructionStep;
