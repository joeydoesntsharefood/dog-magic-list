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
      <div className="w-full lg:w-[340px] shrink-0 space-y-6 lg:sticky lg:top-0">
        {deckProfile.commander && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex gap-4 items-center shadow-inner">
            <div className="w-16 h-16 rounded-lg border border-white/10 overflow-hidden cursor-zoom-in shadow-lg" onDoubleClick={() => setExpandedCard(deckProfile.commander?.imageUrl || null)}>
              <img src={deckProfile.commander.imageUrl} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Commander</p>
              <p className="text-sm font-bold text-white truncate leading-tight">{deckProfile.commander.name}</p>
              <div className="mt-1">
                <ColorIdentityDots colors={deckProfile.commander.colorIdentity} />
              </div>
            </div>
          </div>
        )}
        
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search card to add..." 
            value={searchName} 
            onChange={(e) => setSearchName(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && onSearchCards()} 
            className="w-full bg-surface border border-white/5 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium" 
          />
        </div>

        <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/5 bg-surface/50 shadow-xl overflow-hidden">
          {suggestions.map(card => (
            <div 
              key={card.id} 
              onClick={() => onSelectCard(card.name)} 
              className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer text-sm font-semibold flex justify-between group transition-colors"
            >
              <span className="text-slate-300 group-hover:text-primary">{card.name}</span> <ColorIdentityDots colors={card.colors} />
            </div>
          ))}
        </div>

        {selectedVersion && searchResult && (
          <div className="rounded-3xl border border-white/10 p-6 bg-surface shadow-2xl animate-in zoom-in-95">
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-6 cursor-zoom-in" onDoubleClick={() => setExpandedCard(selectedVersion.imageUrl)}>
              <img src={selectedVersion.imageUrl} className="w-full transition-transform hover:scale-105 duration-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Quantity</span>
                <div className="flex items-center gap-5">
                  <button onClick={() => setWizardQuantity(Math.max(1, wizardQuantity-1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-primary transition-colors">-</button>
                  <span className="text-sm font-black w-4 text-center">{wizardQuantity}</span>
                  <button 
                    onClick={() => setWizardQuantity(wizardQuantity+1)} 
                    disabled={deckProfile.format === 'COMMANDER' && !selectedVersion?.setName?.toLowerCase().includes('basic land') && !['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Ilha', 'Pântano', 'Montanha', 'Floresta', 'Planície'].includes(selectedVersion.name)} 
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-primary transition-colors disabled:opacity-20"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm px-1">
                <ColorIdentityDots colors={selectedVersion.colorIdentity} />
                <span className="text-success font-black text-lg">R$ {selectedVersion.priceBRL}</span>
              </div>

              <button 
                onClick={() => onAddCard(searchResult, selectedVersion)} 
                className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all uppercase text-xs tracking-widest"
              >
                Add to Deck
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 w-full space-y-8">
        <div className="flex flex-col gap-6 border-b border-white/5 pb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Deck Registry</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{wizardDeck.reduce((a,b)=>a+b.quantity, 0)} cards total</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input 
                  type="text" 
                  placeholder="Filter cards..." 
                  value={deckLocalFilter} 
                  onChange={(e) => setDeckLocalFilter(e.target.value)} 
                  className="bg-surface border border-white/5 p-2.5 pl-9 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-xs font-medium w-48 transition-all" 
                />
              </div>
              <button 
                onClick={onPurgeViolations} 
                className="bg-error/10 text-error border border-error/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-error hover:text-white transition-all shadow-lg"
              >
                Purge
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {filteredDeck.map((item, i) => {
            const legality = validateCardLegality(item.selectedVersion);
            const validVersions = item.allVersions.filter(v => v.priceBRL && parseFloat(v.priceBRL) > 0);
            const avgPrice = validVersions.length > 0 ? validVersions.reduce((a,b)=>a + parseFloat(b.priceBRL || '0'), 0) / validVersions.length : 0;
            return (
              <div key={item.uid} className={`group p-4 bg-surface/40 hover:bg-surface border border-white/5 hover:border-primary/30 rounded-2xl transition-all flex justify-between items-center shadow-sm hover:shadow-xl ${!legality.isLegal ? 'bg-error/5 border-error/20' : ''}`}>
                <div className="flex items-center gap-5">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-lg">
                    <span className="text-xs font-black text-primary">{item.quantity}x</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-100 cursor-zoom-in hover:text-primary transition-colors" onDoubleClick={() => setExpandedCard(item.selectedVersion.imageUrl)}>
                      {item.selectedVersion.name}
                    </span>
                    {!legality.isLegal && (
                      <span className="text-[10px] text-error font-bold uppercase tracking-tight flex items-center gap-1 mt-0.5">
                        <span className="text-xs">⚠️</span> {legality.reason}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-8 relative">
                  <div className="flex flex-col items-end cursor-pointer group/edition" onClick={(e) => { e.stopPropagation(); setActiveEditionSelector(activeEditionSelector === i ? null : i); }}>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Avg: {avgPrice > 0 ? `R$ ${avgPrice.toFixed(2).replace('.',',')}` : '--'}</span>
                    <span className="text-sm font-black text-slate-200 group-hover/edition:text-primary transition-colors">R$ {item.selectedVersion.priceBRL?.replace('.', ',') || '--'}</span>
                  </div>

                  {activeEditionSelector === i && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-surface border border-white/10 shadow-2xl rounded-2xl z-[60] p-5 animate-in slide-in-from-top-2" onClick={(e)=>e.stopPropagation()}>
                      <h4 className="text-xs font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                        <span className="w-1 h-3 bg-primary rounded-full"></span> Select Edition
                      </h4>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                        {item.allVersions.map(v => (
                          <div 
                            key={v.id} 
                            onClick={() => { onUpdateCardVersion(item.uid, v); setActiveEditionSelector(null); }} 
                            className={`p-3 rounded-xl flex justify-between items-center hover:bg-primary/10 cursor-pointer border transition-all ${item.selectedVersion.id === v.id ? 'border-primary/50 bg-primary/5' : 'border-transparent'}`}
                          >
                            <div className="flex flex-col min-w-0 pr-4">
                              <span className="text-xs font-bold text-slate-200 truncate">{v.setName}</span>
                              <span className="text-[9px] text-slate-500 font-bold uppercase">{v.rarity}</span>
                            </div>
                            <span className="text-xs font-black text-success whitespace-nowrap">R$ {v.priceBRL?.replace('.',',') || '--'}</span>
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${confirmingRemoveCardUid === item.uid ? 'bg-error text-white scale-110' : 'bg-white/5 text-slate-600 hover:bg-error/10 hover:text-error'}`}
                  >
                    <span className="text-xs font-bold">{confirmingRemoveCardUid === item.uid ? '✓' : '×'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onNext} 
          disabled={wizardDeck.length === 0} 
          className="w-full bg-white hover:bg-primary hover:text-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-30 disabled:translate-y-0"
        >
          Finalize Construction
        </button>
      </div>
    </div>
  );
};

export default ConstructionStep;
