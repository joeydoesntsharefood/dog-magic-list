import React from 'react';

interface FormatStepProps {
  onSelectFormat: (format: 'STANDARD' | 'COMMANDER' | 'PAUPER') => void;
}

const FormatStep: React.FC<FormatStepProps> = ({ onSelectFormat }) => {
  return (
    <div className="space-y-8 animate-in fade-in" data-testid="wizard-format-step">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">// SELECT_DECK_FORMAT</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['STANDARD', 'COMMANDER', 'PAUPER'].map(f => (
          <div 
            key={f} 
            onClick={() => onSelectFormat(f as any)} 
            className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-[#8A3A34] cursor-pointer transition-all text-center group"
          >
            <span className="font-black text-sm tracking-widest group-hover:text-[#8A3A34]">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormatStep;
