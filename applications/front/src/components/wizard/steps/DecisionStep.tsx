import React from 'react';

interface DecisionStepProps {
  onShowDiagnosis: () => void;
  onCommitToGrimoire: () => void;
  onBackToConstruction: () => void;
}

const DecisionStep: React.FC<DecisionStepProps> = ({ 
  onShowDiagnosis, 
  onCommitToGrimoire, 
  onBackToConstruction 
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-12 py-20 text-center animate-in zoom-in-95 duration-500" data-testid="wizard-decision-step">
      <div className="space-y-4">
        <h3 className="text-4xl font-black tracking-tighter uppercase">Registry_Ready</h3>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Select final procedure for this grimoire</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onShowDiagnosis} 
          className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-[#9E8C6A] group transition-all"
        >
          <h4 className="font-black text-sm tracking-widest mb-2 group-hover:text-[#9E8C6A]">[01] RUN_DIAGNOSTICS</h4>
          <p className="text-[8px] text-zinc-600 uppercase font-bold">Structural & Statistical Analysis</p>
        </button>
        <button 
          onClick={onCommitToGrimoire} 
          className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-green-700 group transition-all"
        >
          <h4 className="font-black text-sm tracking-widest mb-2 group-hover:text-green-600">[02] COMMIT_TO_GRIMOIRE</h4>
          <p className="text-[8px] text-zinc-600 uppercase font-bold">Permanent SQLite Persistence</p>
        </button>
      </div>
      <button 
        onClick={onBackToConstruction} 
        className="text-[10px] font-black text-zinc-700 hover:text-white uppercase tracking-widest mt-12 underline underline-offset-8"
      >
        [BACK_TO_CONSTRUCTION]
      </button>
    </div>
  );
};

export default DecisionStep;
