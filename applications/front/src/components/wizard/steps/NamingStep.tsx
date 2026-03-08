import React from 'react';

interface NamingStepProps {
  suggestedName: string;
  onSave: (name?: string) => void;
  onBack: () => void;
}

const NamingStep: React.FC<NamingStepProps> = ({ 
  suggestedName, 
  onSave, 
  onBack 
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-12 py-20 text-center animate-in zoom-in-95" data-testid="wizard-naming-step">
      <div className="space-y-4">
        <h3 className="text-4xl font-black tracking-tighter uppercase">Naming_Protocol</h3>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Identify this record in the master database</p>
      </div>

      <div className="space-y-8">
        <div className="p-8 border border-zinc-800 bg-black/40 space-y-4">
          <p className="text-[10px] font-black text-[#9E8C6A] uppercase tracking-widest">Suggested_Identity</p>
          <p className="text-2xl font-black tracking-widest">{suggestedName}</p>
          <button 
            onClick={() => onSave(suggestedName)} 
            className="w-full bg-[#9E8C6A] text-black font-black p-4 uppercase tracking-widest hover:bg-white transition-all"
          >
            [ACCEPT_SUGGESTION]
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-900"></div>
          <span className="text-[8px] font-black text-zinc-700 uppercase">OR_MANUAL_OVERRIDE</span>
          <div className="h-px flex-1 bg-zinc-900"></div>
        </div>

        <div className="flex gap-2">
          <input 
            id="manual-name" 
            type="text" 
            placeholder="ENTER_UNIQUE_NAME..." 
            className="flex-1 bg-black border border-zinc-800 p-4 focus:border-[#8A3A34] outline-none uppercase text-xs" 
          />
          <button 
            onClick={() => {
              const input = document.getElementById('manual-name') as HTMLInputElement;
              onSave(input.value);
            }} 
            className="bg-zinc-900 px-8 border border-zinc-800 text-[10px] font-black uppercase hover:bg-white hover:text-black"
          >
            [COMMIT]
          </button>
        </div>
      </div>

      <button 
        onClick={onBack} 
        className="text-[10px] font-black text-zinc-700 hover:text-white uppercase tracking-widest mt-12 underline underline-offset-8"
      >
        [CANCEL]
      </button>
    </div>
  );
};

export default NamingStep;
