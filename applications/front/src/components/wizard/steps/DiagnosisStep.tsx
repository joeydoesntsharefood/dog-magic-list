import React from 'react';
import { WizardDeckItem, DeckProfile } from '../../../types';

interface DiagnosisStepProps {
  wizardDeck: WizardDeckItem[];
  deckProfile: DeckProfile;
  currentTotalCost: number;
  budgetStatus: { percent: number; exceeded: boolean };
  onBack: () => void;
  onSave: () => void;
}

const DiagnosisStep: React.FC<DiagnosisStepProps> = ({ 
  wizardDeck, 
  deckProfile, 
  currentTotalCost, 
  budgetStatus, 
  onBack, 
  onSave 
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700" data-testid="wizard-diagnosis-step">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <h3 className="text-2xl font-black uppercase tracking-tighter">// STRUCTURAL_DIAGNOSIS</h3>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 border border-zinc-800 text-[10px] font-black uppercase hover:bg-zinc-800">[BACK]</button>
          <button onClick={onSave} className="px-6 py-2 bg-green-700 text-white font-black text-[10px] uppercase hover:bg-green-800">[SAVE_AFTER_ANALYSIS]</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Deck_Value</p><p className="text-3xl font-black text-green-500">R$ {currentTotalCost.toFixed(2).replace('.',',')}</p></div>
        <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Card_Count</p><p className="text-3xl font-black text-[#9E8C6A]">{wizardDeck.reduce((a,b)=>a+b.quantity, 0)}</p></div>
        <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Budget_Usage</p><p className={`text-3xl font-black ${budgetStatus.exceeded ? 'text-[#8A3A34]' : 'text-green-500'}`}>{budgetStatus.percent.toFixed(1)}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="p-8 border border-zinc-900 bg-black/20">
          <h4 className="text-xs font-black mb-8 uppercase tracking-widest text-zinc-500">// MANA_CURVE_DISTRIBUTION</h4>
          <div className="flex items-end justify-between h-48 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, '7+'].map(cmc => {
              const count = wizardDeck
                .filter(item => item.selectedVersion.category !== 'LAND')
                .filter(item => cmc === '7+' ? (item.selectedVersion.cmc || 0) >= 7 : (item.selectedVersion.cmc || 0) === cmc)
                .reduce((acc, item) => acc + item.quantity, 0);
              const maxCount = Math.max(...[0, 1, 2, 3, 4, 5, 6, 7].map(c => wizardDeck.filter(i => i.selectedVersion.category !== 'LAND' && (i.selectedVersion.cmc === c)).reduce((a,b)=>a+b.quantity, 0)), 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={cmc} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-zinc-900 relative group">
                    <div className="absolute bottom-0 left-0 w-full bg-[#8A3A34] transition-all duration-1000 group-hover:bg-[#9E8C6A]" style={{ height: `${height}%` }}></div>
                    <div className="h-32"></div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">{count}x</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-700">{cmc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 border border-zinc-900 bg-black/20 space-y-6">
          <h4 className="text-xs font-black mb-8 uppercase tracking-widest text-zinc-500">// PILLAR_COMPLIANCE</h4>
          {[
            { label: 'LANDS', cat: 'LAND', target: deckProfile.format === 'COMMANDER' ? 36 : 24 },
            { label: 'RAMP', cat: 'RAMP', target: deckProfile.format === 'COMMANDER' ? 10 : 4 },
            { label: 'DRAW', cat: 'CARD_ADVANTAGE', target: deckProfile.format === 'COMMANDER' ? 10 : 6 },
            { label: 'INTERACTION', cat: 'INTERACTION', target: deckProfile.format === 'COMMANDER' ? 10 : 8 },
          ].map(pillar => {
            const count = wizardDeck.filter(i => i.selectedVersion.category === pillar.cat).reduce((a,b)=>a+b.quantity, 0);
            const percent = Math.min((count / pillar.target) * 100, 100);
            return (
              <div key={pillar.label} className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                  <span className="text-zinc-400">{pillar.label}</span>
                  <span className={count >= pillar.target ? 'text-green-500' : 'text-[#8A3A34]'}>{count} / {pillar.target}</span>
                </div>
                <div className="h-1 bg-zinc-900 overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${count >= pillar.target ? 'bg-green-600' : 'bg-[#8A3A34]'}`} style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisStep;
