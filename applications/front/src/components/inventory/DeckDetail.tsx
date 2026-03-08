import React from 'react';

interface DeckDetailProps {
  deck: any;
  onBack: () => void;
  onUpdateAnalysis: (deckId: string, analysis: any) => void;
  onInitiateBuy?: () => void;
}

const DeckDetail: React.FC<DeckDetailProps> = ({ 
  deck, 
  onBack, 
  onUpdateAnalysis, 
  onInitiateBuy 
}) => {
  if (!deck) return null;

  const handleGenerateAnalysis = () => {
    const cards = deck.cards || [];
    const analysis = {
      manaCurve: [0, 1, 2, 3, 4, 5, 6, 7].map(c => 
        cards.filter((i: any) => i.category !== 'LAND' && (i.cmc === c))
             .reduce((a: number, b: any) => a + b.quantity, 0)
      ),
      pillars: {
        LANDS: cards.filter((i: any) => i.category === 'LAND').reduce((a: number, b: any) => a + b.quantity, 0),
        RAMP: cards.filter((i: any) => i.category === 'RAMP').reduce((a: number, b: any) => a + b.quantity, 0),
        DRAW: cards.filter((i: any) => i.category === 'CARD_ADVANTAGE').reduce((a: number, b: any) => a + b.quantity, 0),
        INTERACTION: cards.filter((i: any) => i.category === 'INTERACTION').reduce((a: number, b: any) => a + b.quantity, 0),
      }
    };
    onUpdateAnalysis(deck.id, analysis);
  };

  const analysisData = deck.analysis_json ? JSON.parse(deck.analysis_json) : null;

  return (
    <section className="max-w-6xl mx-auto animate-in fade-in duration-500 space-y-12 pb-24" data-testid="deck-detail">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button onClick={onBack} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">[BACK_TO_REGISTRY]</button>
            <span className="text-zinc-800">/</span>
            <span className="text-[10px] font-black text-[#9E8C6A] uppercase tracking-widest">{deck.format}</span>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">{deck.name}</h2>
        </div>
        <button 
          onClick={onInitiateBuy}
          className="bg-white text-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#8A3A34] hover:text-white transition-all"
        >
          [INITIATE_BUY_SEQUENCE]
        </button>
      </div>

      {!analysisData ? (
        <div className="p-16 border-2 border-dashed border-zinc-900 bg-black flex flex-col items-center gap-6 animate-in zoom-in-95">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">No_Structural_Diagnosis_Found</p>
          <button 
            onClick={handleGenerateAnalysis} 
            className="bg-zinc-900 border border-zinc-800 text-[10px] font-black text-[#9E8C6A] px-10 py-4 uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            [GENERATE_STRUCTURAL_DIAGNOSIS]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-1000">
          {/* MANA CURVE */}
          <div className="p-8 border border-zinc-900 bg-black/20">
            <h4 className="text-xs font-black mb-8 uppercase tracking-widest text-zinc-500">// MANA_CURVE_DISTRIBUTION</h4>
            <div className="flex items-end justify-between h-48 gap-2">
              {analysisData.manaCurve.map((count: number, cmc: number) => {
                const maxCount = Math.max(...analysisData.manaCurve, 1);
                const height = (count / maxCount) * 100;
                return (
                  <div key={cmc} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-zinc-900 relative group">
                      <div className="absolute bottom-0 left-0 w-full bg-[#8A3A34] transition-all duration-1000" style={{ height: `${height}%` }}></div>
                      <div className="h-32"></div>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">{count}x</span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-700">{cmc === 7 ? '7+' : cmc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PILLAR STATUS */}
          <div className="p-8 border border-zinc-900 bg-black/20 space-y-6">
            <h4 className="text-xs font-black mb-8 uppercase tracking-widest text-zinc-500">// PILLAR_COMPLIANCE</h4>
            {Object.entries(analysisData.pillars).map(([label, count]: [string, any]) => {
              const targets: any = { LANDS: deck.format === 'COMMANDER' ? 36 : 24, RAMP: deck.format === 'COMMANDER' ? 10 : 4, DRAW: deck.format === 'COMMANDER' ? 10 : 6, INTERACTION: deck.format === 'COMMANDER' ? 10 : 8 };
              const target = targets[label];
              const percent = Math.min((count / target) * 100, 100);
              return (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                    <span className="text-zinc-400">{label}</span>
                    <span className={count >= target ? 'text-green-500' : 'text-[#8A3A34]'}>{count} / {target}</span>
                  </div>
                  <div className="h-1 bg-zinc-900 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${count >= target ? 'bg-green-600' : 'bg-[#8A3A34]'}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CARD LISTING */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">// MASTER_DECK_LIST</h4>
        <div className="grid grid-cols-1 gap-2">
          {(deck.cards || []).sort((a: any, b: any) => a.category.localeCompare(b.category)).map((card: any) => (
            <div key={card.id} className="flex items-center gap-6 p-3 bg-black border border-zinc-900 hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 bg-zinc-900 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                <img 
                  src={`https://cards.scryfall.io/normal/front/${card.card_id.charAt(0)}/${card.card_id.charAt(1)}/${card.card_id}.jpg`} 
                  alt={card.name} 
                  className="w-full h-full object-cover scale-150" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-700">{card.quantity}x</span>
                  <h5 className="text-xs font-bold uppercase truncate">{card.name}</h5>
                </div>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">{card.category}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#9E8C6A]">R$ {card.price_brl?.replace('.', ',') || '--'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeckDetail;
