import React from 'react';
import { DeckProfile } from '../../../types';

interface ProfileStepProps {
  profile: DeckProfile;
  setProfile: (profile: DeckProfile) => void;
  onNext: () => void;
  importText: string;
  setImportText: (text: string) => void;
  onImport: () => void;
  importing: boolean;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ 
  profile, 
  setProfile, 
  onNext, 
  importText, 
  setImportText, 
  onImport, 
  importing 
}) => {
  return (
    <div className="space-y-12 animate-in fade-in" data-testid="wizard-profile-step">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">// INITIAL_CONFIGURATION</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase text-zinc-500">[01] SELECT_PROFILE</h4>
          <div className="flex gap-4">
            {['COMPETITIVE', 'FUN'].map(obj => (
              <button 
                key={obj} 
                onClick={() => setProfile({...profile, objective: obj as any})} 
                className={`flex-1 p-4 border ${profile.objective === obj ? 'bg-zinc-800 border-zinc-600' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <span className="font-black text-[10px] tracking-widest">{obj}</span>
              </button>
            ))}
          </div>
          {profile.objective && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4">
              {['AGGRO', 'MIDRANGE', 'CONTROL', 'COMBO'].map(arc => (
                <div 
                  key={arc} 
                  onClick={() => { setProfile({...profile, archetype: arc as any}); onNext(); }} 
                  className="p-6 border border-zinc-800 bg-black hover:border-[#8A3A34] cursor-pointer text-center group"
                >
                  <span className="font-black text-[10px] tracking-widest group-hover:text-[#8A3A34]">{arc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6 border-l border-zinc-900 pl-12">
          <h4 className="text-[10px] font-black uppercase text-[#9E8C6A]">[02] BULK_IMPORT_TXT</h4>
          <textarea 
            className="w-full h-48 bg-black border border-zinc-800 p-4 text-[10px] focus:border-[#9E8C6A] outline-none" 
            placeholder="1 Sol Ring..." 
            value={importText} 
            onChange={(e) => setImportText(e.target.value)} 
          />
          <button 
            onClick={onImport} 
            disabled={importing || !importText.trim()} 
            className="w-full bg-zinc-900 text-[#9E8C6A] p-4 font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all disabled:opacity-20"
          >
            {importing ? '[PROCESSING...]' : '[EXECUTE_BULK_IMPORT]'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
