import React from 'react';
import { DeckProfile } from '../../../types';

interface BudgetStepProps {
  profile: DeckProfile;
  setProfile: (profile: DeckProfile) => void;
  onNext: () => void;
}

const BudgetStep: React.FC<BudgetStepProps> = ({ profile, setProfile, onNext }) => {
  return (
    <div className="space-y-8 max-w-md mx-auto text-center animate-in fade-in" data-testid="wizard-budget-step">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">// SET_LIMIT_BRL</h3>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">R$</span>
        <input 
          type="number" 
          placeholder="SET_LIMIT_BRL..." 
          onChange={(e) => setProfile({...profile, targetBudget: parseFloat(e.target.value) || 0})} 
          className="w-full bg-black border border-zinc-800 p-4 pl-12 focus:outline-none focus:border-[#8A3A34] text-xl font-black text-center" 
        />
      </div>
      <button 
        onClick={onNext} 
        className="w-full bg-[#8A3A34] text-white p-4 font-black uppercase hover:bg-black border border-[#8A3A34] transition-all"
      >
        {profile.format === 'COMMANDER' ? '[PROCEED_TO_COMMANDER]' : '[INITIALIZE_CONSTRUCTION]'}
      </button>
    </div>
  );
};

export default BudgetStep;
