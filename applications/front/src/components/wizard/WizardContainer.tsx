import React from 'react';
import FormatStep from './steps/FormatStep';
import ProfileStep from './steps/ProfileStep';
import BudgetStep from './steps/BudgetStep';
import CommanderStep from './steps/CommanderStep';
import ConstructionStep from './steps/ConstructionStep';
import DecisionStep from './steps/DecisionStep';
import DiagnosisStep from './steps/DiagnosisStep';
import NamingStep from './steps/NamingStep';
import { CardVersion, CardPriceResult, WizardDeckItem, DeckProfile } from '../../types';

interface WizardContainerProps {
  wizardStep: number;
  setWizardStep: (step: number) => void;
  deckProfile: DeckProfile;
  setDeckProfile: (profile: DeckProfile) => void;
  wizardDeck: WizardDeckItem[];
  setWizardDeck: (deck: WizardDeckItem[] | ((prev: WizardDeckItem[]) => WizardDeckItem[])) => void;
  searchName: string;
  setSearchName: (name: string) => void;
  onSearchCards: () => void;
  suggestions: any[];
  onSelectCard: (name: string) => void;
  selectedVersion: CardVersion | null;
  searchResult: CardPriceResult | null;
  wizardQuantity: number;
  setWizardQuantity: (q: number) => void;
  onAddCard: (cardResult: CardPriceResult, selected: CardVersion) => void;
  importText: string;
  setImportText: (text: string) => void;
  onImportDeck: () => void;
  importing: boolean;
  deckLocalFilter: string;
  setDeckLocalFilter: (f: string) => void;
  onPurgeViolations: () => void;
  onRemoveCard: (uid: string) => void;
  setExpandedCard: (url: string | null) => void;
  validateCardLegality: (card: CardVersion) => { isLegal: boolean; reason?: string };
  currentTotalCost: number;
  budgetStatus: { percent: number; exceeded: boolean };
  onOptimizeBudget: (mode: 'LOW' | 'HIGH') => void;
  onSaveDeck: (manualName?: string) => void;
  generateDeckName: () => string;
  confirmingRemoveCardUid: string | null;
  setConfirmingRemoveCardUid: (uid: string | null) => void;
  activeEditionSelector: number | null;
  setActiveEditionSelector: (idx: number | null) => void;
}

const WizardContainer: React.FC<WizardContainerProps> = (props) => {
  const { 
    wizardStep, setWizardStep, deckProfile, setDeckProfile, 
    onOptimizeBudget, budgetStatus, currentTotalCost,
    onSaveDeck, generateDeckName
  } = props;

  return (
    <section className="max-w-6xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12 flex justify-between items-center bg-surface/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Deck Builder</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded">
              Step {wizardStep + 1} of 8
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {deckProfile.format || 'Initializing'}
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Budget Status</span>
            <p className={`text-xl font-black ${budgetStatus.exceeded ? 'text-error animate-pulse' : 'text-success'}`}>
              R$ {(deckProfile.targetBudget - currentTotalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} remaining
            </p>
          </div>
          {wizardStep >= 4 && (
            <div className="flex gap-2">
              <button onClick={() => onOptimizeBudget('LOW')} className="bg-slate-900 text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all text-slate-400 border border-white/5 shadow-lg">Low Cost Tune</button>
              <button onClick={() => onOptimizeBudget('HIGH')} className="bg-slate-900 text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all text-slate-400 border border-white/5 shadow-lg">Premium Tune</button>
            </div>
          )}
        </div>
      </div>

      {wizardStep === 0 && (
        <FormatStep onSelectFormat={(f) => { setDeckProfile({...deckProfile, format: f}); setWizardStep(1); }} />
      )}

      {wizardStep === 1 && (
        <ProfileStep 
          profile={deckProfile} 
          setProfile={setDeckProfile} 
          onNext={() => setWizardStep(2)} 
          importText={props.importText}
          setImportText={props.setImportText}
          onImport={props.onImportDeck}
          importing={props.importing}
        />
      )}

      {wizardStep === 2 && (
        <BudgetStep 
          profile={deckProfile} 
          setProfile={setDeckProfile} 
          onNext={() => setWizardStep(deckProfile.format === 'COMMANDER' ? 3 : 4)} 
        />
      )}

      {wizardStep === 3 && (
        <CommanderStep 
          searchName={props.searchName}
          setSearchName={props.setSearchName}
          onSearch={props.onSearchCards}
          suggestions={props.suggestions}
          onSelectCard={props.onSelectCard}
          selectedVersion={props.selectedVersion}
          onDesignateCommander={(v) => { setDeckProfile({...deckProfile, commander: v}); setWizardStep(4); }}
          setExpandedCard={props.setExpandedCard}
        />
      )}

      {wizardStep === 4 && (
        <ConstructionStep 
          {...props} 
          onNext={() => setWizardStep(5)} 
          onUpdateCardVersion={(uid, v) => props.setWizardDeck(prev => prev.map(wi => wi.uid === uid ? { ...wi, selectedVersion: v } : wi))}
        />
      )}

      {wizardStep === 5 && (
        <DecisionStep 
          onShowDiagnosis={() => setWizardStep(6)}
          onCommitToGrimoire={() => setWizardStep(7)}
          onBackToConstruction={() => setWizardStep(4)}
        />
      )}

      {wizardStep === 6 && (
        <DiagnosisStep 
          wizardDeck={props.wizardDeck}
          deckProfile={deckProfile}
          currentTotalCost={currentTotalCost}
          budgetStatus={budgetStatus}
          onBack={() => setWizardStep(5)}
          onSave={() => setWizardStep(7)}
        />
      )}

      {wizardStep === 7 && (
        <NamingStep 
          suggestedName={generateDeckName()}
          onSave={onSaveDeck}
          onBack={() => setWizardStep(5)}
        />
      )}
    </section>
  );
};

export default WizardContainer;
