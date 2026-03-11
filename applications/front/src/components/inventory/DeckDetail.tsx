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
      <div className="flex justify-between items-end border-b border-border pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-[10px] font-black text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-2 uppercase tracking-[0.2em]">
              <span>←</span> Return_to_Vault
            </button>
            <div className="w-1 h-1 rounded-full bg-border"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{deck.format}</span>
          </div>
          <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase italic">{deck.name}</h2>
        </div>
        <button 
          onClick={onInitiateBuy}
          className="bg-primary text-black px-10 py-5 rounded-sm font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:bg-white transition-all transform hover:-translate-y-1"
        >
          Initiate_Market_Operation
        </button>
      </div>

      {!analysisData ? (
        <div className="py-32 rounded-sm border border-border bg-surface/30 flex flex-col items-center gap-8 animate-in zoom-in-95 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
          <p className="text-secondary font-bold uppercase tracking-[0.4em] text-xs z-10 opacity-60">Status: Analysis_Pending_Validation</p>
          <button 
            onClick={handleGenerateAnalysis} 
            className="bg-surface border border-primary/40 text-primary px-12 py-5 rounded-sm font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-all z-10"
          >
            Run_Structural_Diagnostics
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-1000">
          {/* MANA CURVE */}
          <div className="p-10 rounded-sm border border-border bg-surface artifact-glow">
            <div className="flex items-center justify-between mb-12">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">// Mana_Curve_Analysis</h4>
              <span className="text-[8px] font-bold text-slate-700">Ref: Standard_Deviation_v1.1</span>
            </div>
            <div className="flex items-end justify-between h-48 gap-4">
              {analysisData.manaCurve.map((count: number, cmc: number) => {
                const maxCount = Math.max(...analysisData.manaCurve, 1);
                const height = (count / maxCount) * 100;
                return (
                  <div key={cmc} className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full bg-border/30 rounded-sm relative group overflow-hidden border border-white/5">
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-primary/60 transition-all duration-1000" style={{ height: `${height}%` }}></div>
                      <div className="h-32"></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity bg-primary/40">{count}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-600">{cmc === 7 ? '7+' : cmc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PILLAR STATUS */}
          <div className="p-10 rounded-sm border border-border bg-surface artifact-glow space-y-10">
            <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">// Pillar_Compliance_Report</h4>
            {Object.entries(analysisData.pillars).map(([label, count]: [string, any]) => {
              const targets: any = { LANDS: deck.format === 'COMMANDER' ? 36 : 24, RAMP: deck.format === 'COMMANDER' ? 10 : 4, DRAW: deck.format === 'COMMANDER' ? 10 : 6, INTERACTION: deck.format === 'COMMANDER' ? 10 : 8 };
              const target = targets[label];
              const percent = Math.min((count / target) * 100, 100);
              return (
                <div key={label} className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                    <span className={`text-xs font-black ${count >= target ? 'text-success' : 'text-primary'}`}>{count} <span className="text-slate-700 font-medium">/ {target}</span></span>
                  </div>
                  <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${count >= target ? 'bg-success shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CARD LISTING */}
      <div className="space-y-8">
        <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] border-l-2 border-primary pl-4">Manifest_Registry</h4>
        <div className="grid grid-cols-1 gap-px bg-border border border-border">
          {(deck.cards || []).sort((a: any, b: any) => a.category.localeCompare(b.category)).map((card: any) => (
            <div key={card.id} className="flex items-center gap-8 p-5 bg-surface hover:bg-black transition-all group relative">
              <div className="w-16 h-16 bg-black rounded-sm overflow-hidden cursor-zoom-in border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500">
                <img 
                  src={`https://cards.scryfall.io/normal/front/${card.card_id.charAt(0)}/${card.card_id.charAt(1)}/${card.card_id}.jpg`} 
                  alt={card.name} 
                  className="w-full h-full object-cover scale-125 group-hover:scale-150 transition-transform duration-700" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-primary">{card.quantity}x</span>
                  <h5 className="text-lg font-black text-slate-100 truncate uppercase tracking-tight">{card.name}</h5>
                </div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">{card.category.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-primary mb-1 uppercase tracking-tighter">Est_Value</p>
                <p className="text-xl font-black text-success tabular-nums tracking-tighter">R$ {card.price_brl?.replace('.', ',') || '--'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeckDetail;
