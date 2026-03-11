import { useState, useEffect, useRef, useMemo } from 'react';
import { themes } from './themes';
import Sidebar from './components/layout/Sidebar';
import MatrixRain from './components/shared/MatrixRain';
import ColorIdentityDots from './components/shared/ColorIdentityDots';
import InventoryGrid from './components/inventory/InventoryGrid';
import DeckDetail from './components/inventory/DeckDetail';
import SearchBar from './components/market/SearchBar';
import MarketResult from './components/market/MarketResult';
import WizardContainer from './components/wizard/WizardContainer';
import LoginScreen from './components/layout/LoginScreen';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { 
  List, CardSuggestion, CardVersion, CardPriceResult, 
  OffersResult, WizardDeckItem, DeckProfile, API_BASE_URL 
} from './types';

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(!((import.meta as any).env?.MODE === 'test'));
  const [activeTab, setActiveTab] = useState<'lists' | 'search' | 'wizard'>('lists');
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [newListName, setNewListName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<CardPriceResult | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(null);
  const [offersData, setOffersData] = useState<OffersResult | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [deckProfile, setDeckProfile] = useState<DeckProfile>({
    format: null, objective: null, archetype: null, targetBudget: 0, commander: null
  });
  const [wizardDeck, setWizardDeck] = useState<WizardDeckItem[]>([]);
  const [wizardQuantity, setWizardQuantity] = useState(1);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [deckLocalFilter, setDeckLocalFilter] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeEditionSelector, setActiveEditionSelector] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewingDeck, setViewingDeck] = useState<any | null>(null);
  const [confirmingDeleteDeckId, setConfirmingDeleteDeckId] = useState<string | null>(null);
  const [confirmingRemoveCardUid, setConfirmingRemoveCardUid] = useState<string | null>(null);

  const showError = (msg: string, duration = 5000) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(prev => prev === msg ? null : prev), duration);
  };

  useEffect(() => {
    const logs = ['INIT: BOOT_CORE', 'SYSTEM: KERNEL_1.1', 'LOCAL: SQLITE_OK', 'NET: SCRY_HANDSHAKE', 'READY: MOUNT_UI'];
    let i = 0;
    const isTest = (import.meta as any).env?.MODE === 'test';
    const intervalTime = isTest ? 0 : 200;
    const interval = setInterval(() => {
      if (i < logs.length) { setBootSequence(prev => [...prev, logs[i]]); i++; } 
      else { 
        clearInterval(interval); 
        if (user) {
          loadLists().finally(() => setLoading(false)); 
        } else {
          setLoading(false);
        }
      }
    }, intervalTime);
    return () => clearInterval(interval);
  }, [user]);

  const loadLists = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists`);
      const data = await response.json();
      setLists(data);
    } catch (e) { console.error('DB_FAIL'); }
  };

  const handleViewDeck = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/decks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setViewingDeck(data);
      }
    } catch (e) {
      showError('LOAD_FAIL: GRIMOIRE_NOT_ACCESSIBLE');
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.toUpperCase() }),
      });
      if (response.ok) { setNewListName(''); loadLists(); }
    } catch (e) { console.error('CREATE_FAIL'); showError('CREATE_FAIL: RECORD_ALREADY_EXISTS_OR_LOCKED'); }
  };

  const resetWizard = () => {
    setWizardStep(0); setWizardDeck([]);
    setDeckProfile({ format: null, objective: null, archetype: null, targetBudget: 0, commander: null });
    setSearchResult(null); setSearchName(''); setSuggestions([]); setWizardQuantity(1);
    setImportText(''); setImporting(false); setDeckLocalFilter('');
  };

  const handleSearchCards = async () => {
    if (!searchName.trim()) return;
    setSearching(true);
    // setSuggestions([]); // Removido limpeza imediata para estabilidade de UI e testes
    setSearchResult(null);
    setOffersData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchName)}`);
      if (response.ok) {
        const data = await response.json();
        // Garantir que o estado mude de forma que o Testing Library capture
        setSuggestions([...data]);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCard = async (name: string) => {
    setSearching(true); setSuggestions([]); setOffersData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/prices?name=${encodeURIComponent(name)}`);
      if (response.ok) {
        const data: CardPriceResult = await response.json();
        setSearchResult(data);
        const initialVersion = data.versions[0];
        setSelectedVersion(initialVersion);
        if (initialVersion) fetchOffers(data.name, initialVersion.id);
      }
    } finally { setSearching(false); }
  };

  const fetchOffers = async (name: string, id: string, force = false, directUrl?: string) => {
    setLoadingOffers(true);
    try {
      let url = `${API_BASE_URL}/offers?name=${encodeURIComponent(name)}&id=${id}${force ? '&force=true' : ''}`;
      if (directUrl) url += `&url=${encodeURIComponent(directUrl)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data: OffersResult = await response.json();
        setOffersData(data);
      }
    } catch (error) { console.error('SCAN_FAIL'); } 
    finally { setLoadingOffers(false); }
  };

  const handleVersionChange = (v: CardVersion) => {
    setSelectedVersion(v); setOffersData(null);
    if (searchResult) fetchOffers(searchResult.name, v.id);
  };

  const handleAddCardToWizard = (cardResult: CardPriceResult, selected: CardVersion) => {
    const isBasicLand = selected.setName.toLowerCase().includes('basic land') || ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Ilha', 'Pântano', 'Montanha', 'Floresta', 'Planície'].includes(selected.name);
    const existing = wizardDeck.find(item => item.selectedVersion.name === selected.name);
    if (deckProfile.format === 'COMMANDER' && existing && !isBasicLand) {
      showError('ACTION_DENIED: SINGLETON_CONSTRAINT', 3000);
      return;
    }
    const uid = Math.random().toString(36).substring(2, 11);
    setWizardDeck(prev => [...prev, { uid, allVersions: cardResult.versions, selectedVersion: selected, quantity: wizardQuantity }]);
    setSearchResult(null); setSearchName(''); setWizardQuantity(1);
  };

  const handleRemoveCardFromWizard = (uid: string) => {
    setWizardDeck(prev => prev.filter(item => item.uid !== uid));
    setConfirmingRemoveCardUid(null);
  };

  const validateCardLegality = (card: CardVersion) => {
    if (!deckProfile.format) return { isLegal: true };
    const isBasicLand = card.setName.toLowerCase().includes('basic land') || ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Ilha', 'Pântano', 'Montanha', 'Floresta', 'Planície'].includes(card.name);
    if (isBasicLand) {
      if (deckProfile.format === 'COMMANDER' && deckProfile.commander) {
        const invalidColors = card.colorIdentity.filter(c => !deckProfile.commander?.colorIdentity.includes(c));
        if (invalidColors.length > 0) return { isLegal: false, reason: `COLOR_VIOLATION: [${invalidColors.join(',')}]` };
      }
      return { isLegal: true };
    }
    const formatKey = deckProfile.format.toLowerCase();
    if (card.legalities[formatKey] === 'not_legal' || card.legalities[formatKey] === 'banned') return { isLegal: false, reason: `RESTRICTED: ${card.legalities[formatKey].toUpperCase()}` };
    if (deckProfile.format === 'COMMANDER' && deckProfile.commander) {
      const invalidColors = card.colorIdentity.filter(c => !deckProfile.commander?.colorIdentity.includes(c));
      if (invalidColors.length > 0) return { isLegal: false, reason: `COLOR_VIOLATION: [${invalidColors.join(',')}]` };
    }
    const copies = wizardDeck.filter(item => item.selectedVersion.name === card.name).reduce((a, b) => a + b.quantity, 0);
    if (deckProfile.format === 'COMMANDER' && copies > 1) return { isLegal: false, reason: 'RULE: SINGLETON' };
    if (deckProfile.format !== 'COMMANDER' && copies > 4) return { isLegal: false, reason: 'RULE: MAX_4' };
    if (deckProfile.format === 'PAUPER' && card.legalities.pauper !== 'legal') return { isLegal: false, reason: 'RULE: PAUPER_RARITY' };
    return { isLegal: true };
  };

  const handlePurgeViolations = () => {
    setWizardDeck(prev => prev.filter(item => validateCardLegality(item.selectedVersion).isLegal));
  };

  const optimizeBudget = (mode: 'LOW' | 'HIGH') => {
    setWizardDeck(prev => prev.map(item => {
      const sorted = [...item.allVersions].filter(v => v.priceBRL).sort((a, b) => {
        const pA = parseFloat(a.priceBRL || '0');
        const pB = parseFloat(b.priceBRL || '0');
        return mode === 'LOW' ? pA - pB : pB - pA;
      });
      return { ...item, selectedVersion: sorted[0] || item.selectedVersion };
    }));
  };

  const handleImportDeck = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/decks/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: importText }),
      });
      if (response.ok) {
        const imported: {data: CardPriceResult, quantity: number}[] = await response.json();
        setWizardDeck(imported.map(i => ({
          uid: Math.random().toString(36).substring(2, 11),
          allVersions: i.data.versions,
          selectedVersion: i.data.versions[0],
          quantity: i.quantity
        })));
        setWizardStep(deckProfile.format === 'COMMANDER' ? 3 : 4);
      }
    } catch (e) {
      showError('IMPORT_FAIL', 3000);
    } finally { setImporting(false); }
  };

  const generateDeckName = () => {
    if (wizardDeck.length === 0) return "NEW_GRIMOIRE_RECORD";
    const mainCategory = wizardDeck.reduce((acc, item) => {
      const cat = item.selectedVersion.category;
      acc[cat] = (acc[cat] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const topCat = Object.entries(mainCategory).sort((a,b) => b[1] - a[1])[0][0];
    const topCard = wizardDeck.sort((a,b) => b.quantity - a.quantity)[0].selectedVersion.name;
    const format = deckProfile.format || 'DECK';
    
    return `${topCard.split(',')[0]} ${topCat} ${format}`.toUpperCase();
  };

  const handleDeleteDeck = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmingDeleteDeckId !== id) {
      setConfirmingDeleteDeckId(id);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/decks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setConfirmingDeleteDeckId(null);
        loadLists();
      } else {
        const contentType = response.headers.get("content-type");
        let errorMsg = "UNKNOWN_ERROR";
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errJson = await response.json();
          errorMsg = errJson.error;
        } else {
          errorMsg = await response.text();
        }
        console.error('DELETE_ERROR:', errorMsg);
        showError(`DELETE_FAIL: ${errorMsg}`);
        setConfirmingDeleteDeckId(null);
      }
    } catch (err: any) {
      console.error('DELETE_FETCH_ERROR:', err);
      showError(`DELETE_FAIL: ${err.message || 'NETWORK_ERROR'}`);
      setConfirmingDeleteDeckId(null);
    }
  };

  const handleUpdateAnalysis = async (deckId: string, analysis: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/decks/${deckId}/analysis`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });
      if (response.ok) {
        setViewingDeck((prev: any) => ({ ...prev, analysis_json: JSON.stringify(analysis) }));
      }
    } catch (e) {
      showError('SAVE_FAIL: ANALYSIS_NOT_PERSISTED');
    }
  };

  const handleSaveDeck = async (manualName?: string) => {
    const finalName = manualName || prompt("NAME_THIS_GRIMOIRE_RECORD:", generateDeckName());
    if (!finalName) return;

    // Cálculo da análise para salvar junto se estiver no Step 6
    let analysis = null;
    if (wizardStep === 6) {
      analysis = {
        manaCurve: [0, 1, 2, 3, 4, 5, 6, 7].map(c => wizardDeck.filter(i => i.selectedVersion.category !== 'LAND' && (i.selectedVersion.cmc === c)).reduce((a,b)=>a+b.quantity, 0)),
        pillars: {
          LANDS: wizardDeck.filter(i => i.selectedVersion.category === 'LAND').reduce((a,b)=>a+b.quantity, 0),
          RAMP: wizardDeck.filter(i => i.selectedVersion.category === 'RAMP').reduce((a,b)=>a+b.quantity, 0),
          DRAW: wizardDeck.filter(i => i.selectedVersion.category === 'CARD_ADVANTAGE').reduce((a,b)=>a+b.quantity, 0),
          INTERACTION: wizardDeck.filter(i => i.selectedVersion.category === 'INTERACTION').reduce((a,b)=>a+b.quantity, 0),
        }
      };
    }

    const payload = {
      name: finalName.toUpperCase(),
      format: deckProfile.format,
      archetype: deckProfile.archetype,
      targetBudget: deckProfile.targetBudget,
      analysis_json: analysis ? JSON.stringify(analysis) : null,
      cards: wizardDeck.map(item => ({
        card_id: item.selectedVersion.id,
        name: item.selectedVersion.name,
        quantity: item.quantity,
        price_brl: item.selectedVersion.priceBRL,
        category: item.selectedVersion.category,
        cmc: item.selectedVersion.cmc
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        resetWizard();
        setActiveTab('lists');
        loadLists();
      }
    } catch (e) {
      showError('SAVE_FAIL: DB_TRANSACTION_ERROR');
    }
  };

  const filteredDeck = useMemo(() => {
    if (!deckLocalFilter.trim()) return wizardDeck;
    return wizardDeck.filter(item => 
      item.selectedVersion.name.toLowerCase().includes(deckLocalFilter.toLowerCase()) || 
      item.selectedVersion.category.toLowerCase().includes(deckLocalFilter.toLowerCase())
    );
  }, [wizardDeck, deckLocalFilter]);

  const currentTotalCost = useMemo(() => wizardDeck.reduce((acc, item) => acc + (parseFloat(item.selectedVersion.priceBRL || '0') * item.quantity), 0), [wizardDeck]);
  const budgetStatus = useMemo(() => {
    if (deckProfile.targetBudget === 0) return { percent: 0, exceeded: false };
    return { percent: (currentTotalCost / deckProfile.targetBudget) * 100, exceeded: currentTotalCost > deckProfile.targetBudget };
  }, [currentTotalCost, deckProfile.targetBudget]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background p-12 font-mono flex items-center justify-center relative overflow-hidden">
        <MatrixRain />
        <div className="z-10 flex flex-col items-center gap-12 max-w-2xl w-full">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden pixel-border border-4 border-border bg-surface flex items-center justify-center animate-glitch">
              <img src="/logo.png" alt="Logo" className="w-40 h-40 object-contain brightness-75 group-hover:brightness-100 transition-all duration-75" />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-2 animate-scanline"></div>
          </div>
          <div className="w-full bg-surface/80 p-6 border border-border">
            <div className="space-y-2">
              {bootSequence.map((log, idx) => (
                <p key={idx} className="text-secondary text-[10px] leading-tight flex gap-2">
                  <span className="text-accent">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-zinc-500">{">>>"}</span> {log}
                </p>
              ))}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-accent">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-zinc-500">{">>>"}</span> 
                <span className="w-2 h-3 bg-primary animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-secondary font-mono selection:bg-primary selection:text-white" onClick={() => setActiveEditionSelector(null)}>
      
      {expandedCard && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-10 backdrop-blur-sm" onClick={() => setExpandedCard(null)}>
          <div className="relative animate-in zoom-in-95 duration-200">
            <img src={expandedCard} alt="Expanded" className="max-h-[85vh] rounded-xl shadow-[0_0_50px_rgba(158,140,106,0.3)] border-4 border-border" />
            <p className="text-center mt-4 text-[10px] font-black text-accent tracking-[0.5em] uppercase">CLICK_TO_CLOSE</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div 
          onClick={() => setErrorMessage(null)}
          className="fixed top-0 left-0 right-0 z-[110] p-4 bg-primary text-white text-center text-xs font-black border-b-2 border-black cursor-pointer animate-in slide-in-from-top duration-300 hover:bg-red-700 shadow-2xl group"
        >
          <div className="flex items-center justify-center gap-4">
            <span className="animate-pulse text-white/50">!!</span>
            <span className="tracking-widest uppercase">[ALERT_PROTOCOL]: {errorMessage}</span>
            <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-black/20 px-2 py-1 rounded">CLICK_TO_TERMINATE</span>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onResetWizard={resetWizard} 
        />

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          <div className="flex justify-end gap-4 mb-4">
            <button 
              onClick={() => setTheme(theme === 'midnight' ? 'planeswalker' : 'midnight')}
              className="text-[8px] font-black text-accent uppercase tracking-widest border border-border px-2 py-1 hover:bg-surface transition-all"
            >
              [THEME: {theme.toUpperCase()}]
            </button>
          </div>

          {activeTab === 'lists' && !viewingDeck && (
            <InventoryGrid 
              lists={lists}
              onViewDeck={handleViewDeck}
              onDeleteDeck={handleDeleteDeck}
              onInitiateNewBuild={() => { setActiveTab('wizard'); resetWizard(); }}
              confirmingDeleteDeckId={confirmingDeleteDeckId}
              setConfirmingDeleteDeckId={setConfirmingDeleteDeckId}
            />
          )}
          {activeTab === 'lists' && viewingDeck && (
            <DeckDetail 
              deck={viewingDeck}
              onBack={() => setViewingDeck(null)}
              onUpdateAnalysis={handleUpdateAnalysis}
              onInitiateBuy={() => showError('BUY_SEQUENCE_NOT_IMPLEMENTED')}
            />
          )}

          {activeTab === 'search' && (
            <section className="max-w-5xl mx-auto">
              <SearchBar 
                searchName={searchName}
                setSearchName={setSearchName}
                onSearch={handleSearchCards}
                searching={searching}
                suggestions={suggestions}
                onSelectSuggestion={handleSelectCard}
              />

              {searchResult && selectedVersion && (
                <MarketResult 
                  searchResult={searchResult}
                  selectedVersion={selectedVersion}
                  onVersionChange={handleVersionChange}
                  onFetchOffers={fetchOffers}
                  loadingOffers={loadingOffers}
                  offersData={offersData}
                  onImageDoubleClick={setExpandedCard}
                />
              )}
            </section>
          )}

          {activeTab === 'wizard' && (
            <WizardContainer 
              wizardStep={wizardStep}
              setWizardStep={setWizardStep}
              deckProfile={deckProfile}
              setDeckProfile={setDeckProfile}
              wizardDeck={wizardDeck}
              setWizardDeck={setWizardDeck}
              searchName={searchName}
              setSearchName={setSearchName}
              onSearchCards={handleSearchCards}
              suggestions={suggestions}
              onSelectCard={handleSelectCard}
              selectedVersion={selectedVersion}
              searchResult={searchResult}
              wizardQuantity={wizardQuantity}
              setWizardQuantity={setWizardQuantity}
              onAddCard={handleAddCardToWizard}
              importText={importText}
              setImportText={setImportText}
              onImportDeck={handleImportDeck}
              importing={importing}
              deckLocalFilter={deckLocalFilter}
              setDeckLocalFilter={setDeckLocalFilter}
              onPurgeViolations={handlePurgeViolations}
              onRemoveCard={handleRemoveCardFromWizard}
              setExpandedCard={setExpandedCard}
              validateCardLegality={validateCardLegality}
              currentTotalCost={currentTotalCost}
              budgetStatus={budgetStatus}
              onOptimizeBudget={optimizeBudget}
              onSaveDeck={handleSaveDeck}
              generateDeckName={generateDeckName}
              confirmingRemoveCardUid={confirmingRemoveCardUid}
              setConfirmingRemoveCardUid={setConfirmingRemoveCardUid}
              activeEditionSelector={activeEditionSelector}
              setActiveEditionSelector={setActiveEditionSelector}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
