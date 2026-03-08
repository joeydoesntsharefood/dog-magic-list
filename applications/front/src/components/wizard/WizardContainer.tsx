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
    <section className="max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12 flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">DECK_WIZARD_PROMPT</h2>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Status: Step_0{wizardStep + 1} / {deckProfile.format || 'INITIALIZING'}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className={`text-[10px] font-black ${budgetStatus.exceeded ? 'text-[#8A3A34] animate-pulse' : 'text-green-600'}`}>
            BUDGET_REMAINING: R$ {(deckProfile.targetBudget - currentTotalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {wizardStep >= 4 && (
            <div className="flex gap-2">
              <button onClick={() => onOptimizeBudget('LOW')} className="bg-zinc-900 text-[8px] font-bold px-2 py-1 hover:bg-white hover:text-black transition-all">[LOW_COST_TUNING]</button>
              <button onClick={() => onOptimizeBudget('HIGH')} className="bg-zinc-900 text-[8px] font-bold px-2 py-1 hover:bg-white hover:text-black transition-all">[PREMIUM_TUNING]</button>
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
