import { useState, useEffect, useRef, useMemo } from 'react';
import { themes } from './themes';
import Sidebar from './components/layout/Sidebar';
import MatrixRain from './components/shared/MatrixRain';
import ColorIdentityDots from './components/shared/ColorIdentityDots';
import InventoryGrid from './components/inventory/InventoryGrid';
import DeckDetail from './components/inventory/DeckDetail';
import SearchBar from './components/market/SearchBar';
import MarketResult from './components/market/MarketResult';
import { 
  List, CardSuggestion, CardVersion, CardPriceResult, 
  OffersResult, WizardDeckItem, DeckProfile, API_BASE_URL 
} from './types';

function App() {
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
      else { clearInterval(interval); setTimeout(() => { loadLists().finally(() => setLoading(false)); }, isTest ? 0 : 500); }
    }, intervalTime);
    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-12 font-mono flex items-center justify-center relative overflow-hidden">
        <MatrixRain />
        <div className="z-10 flex flex-col items-center gap-12 max-w-2xl w-full">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden pixel-border border-4 border-zinc-800 bg-black flex items-center justify-center animate-glitch">
              <img src="/logo.png" alt="Logo" className="w-40 h-40 object-contain brightness-75 group-hover:brightness-100 transition-all duration-75" />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-2 animate-scanline"></div>
          </div>
          <div className="w-full bg-black/80 p-6 border border-zinc-800">
            <div className="space-y-2">
              {bootSequence.map((log, idx) => (
                <p key={idx} className="text-[#E8DCCA] text-[10px] leading-tight flex gap-2">
                  <span className="text-[#9E8C6A]">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-zinc-500">{">>>"}</span> {log}
                </p>
              ))}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#9E8C6A]">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-zinc-500">{">>>"}</span> 
                <span className="w-2 h-3 bg-[#8A3A34] animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8DCCA] font-mono selection:bg-[#8A3A34] selection:text-white" onClick={() => setActiveEditionSelector(null)}>
      
      {expandedCard && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-10 backdrop-blur-sm" onClick={() => setExpandedCard(null)}>
          <div className="relative animate-in zoom-in-95 duration-200">
            <img src={expandedCard} alt="Expanded" className="max-h-[85vh] rounded-xl shadow-[0_0_50px_rgba(158,140,106,0.3)] border-4 border-zinc-800" />
            <p className="text-center mt-4 text-[10px] font-black text-[#9E8C6A] tracking-[0.5em] uppercase">CLICK_TO_CLOSE</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div 
          onClick={() => setErrorMessage(null)}
          className="fixed top-0 left-0 right-0 z-[110] p-4 bg-[#8A3A34] text-white text-center text-xs font-black border-b-2 border-black cursor-pointer animate-in slide-in-from-top duration-300 hover:bg-[#A54A42] shadow-2xl group"
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
            <section className={`max-w-5xl mx-auto ${(import.meta as any).env?.MODE !== 'test' ? 'animate-in fade-in slide-in-from-bottom-4 duration-700' : ''} pb-24`}>
              <div className="mb-12 flex justify-between items-center border-b border-zinc-800 pb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">DECK_WIZARD_PROMPT</h2>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Status: Step_0{wizardStep + 1} / {deckProfile.format || 'INITIALIZING'}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className={`text-[10px] font-black ${budgetStatus.exceeded ? 'text-[#8A3A34] animate-pulse' : 'text-green-600'}`}>
                    BUDGET_REMAINING: R$ {(deckProfile.targetBudget - currentTotalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {wizardStep >= 4 && (
                    <div className="flex gap-2">
                      <button onClick={() => optimizeBudget('LOW')} className="bg-zinc-900 text-[8px] font-bold px-2 py-1 hover:bg-white hover:text-black transition-all">[LOW_COST_TUNING]</button>
                      <button onClick={() => optimizeBudget('HIGH')} className="bg-zinc-900 text-[8px] font-bold px-2 py-1 hover:bg-white hover:text-black transition-all">[PREMIUM_TUNING]</button>
                    </div>
                  )}
                </div>
              </div>

              {/* WIZARD STEPS 0-6 */}
              {wizardStep === 0 && (
                <div className="space-y-8">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">// SELECT_DECK_FORMAT</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['STANDARD', 'COMMANDER', 'PAUPER'].map(f => (
                      <div key={f} onClick={() => { setDeckProfile({...deckProfile, format: f as any}); setWizardStep(1); }} className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-[#8A3A34] cursor-pointer transition-all text-center group">
                        <span className="font-black text-sm tracking-widest group-hover:text-[#8A3A34]">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-12">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">// INITIAL_CONFIGURATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500">[01] SELECT_PROFILE</h4>
                      <div className="flex gap-4">
                        {['COMPETITIVE', 'FUN'].map(obj => (
                          <button key={obj} onClick={() => setDeckProfile({...deckProfile, objective: obj as any})} className={`flex-1 p-4 border ${deckProfile.objective === obj ? 'bg-zinc-800 border-zinc-600' : 'border-zinc-800 hover:border-zinc-700'}`}>
                            <span className="font-black text-[10px] tracking-widest">{obj}</span>
                          </button>
                        ))}
                      </div>
                      {deckProfile.objective && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                          {['AGGRO', 'MIDRANGE', 'CONTROL', 'COMBO'].map(arc => (
                            <div key={arc} onClick={() => { setDeckProfile({...deckProfile, archetype: arc as any}); setWizardStep(2); }} className="p-6 border border-zinc-800 bg-black hover:border-[#8A3A34] cursor-pointer text-center group">
                              <span className="font-black text-[10px] tracking-widest group-hover:text-[#8A3A34]">{arc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-6 border-l border-zinc-900 pl-12">
                      <h4 className="text-[10px] font-black uppercase text-[#9E8C6A]">[02] BULK_IMPORT_TXT</h4>
                      <textarea className="w-full h-48 bg-black border border-zinc-800 p-4 text-[10px] focus:border-[#9E8C6A] outline-none" placeholder="1 Sol Ring..." value={importText} onChange={(e) => setImportText(e.target.value)} />
                      <button onClick={handleImportDeck} disabled={importing || !importText.trim()} className="w-full bg-zinc-900 text-[#9E8C6A] p-4 font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all">{importing ? '[PROCESSING...]' : '[EXECUTE_BULK_IMPORT]'}</button>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-8 max-w-md mx-auto text-center">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">// SET_LIMIT_BRL</h3>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">R$</span>
                    <input type="number" placeholder="SET_LIMIT_BRL..." onChange={(e) => setDeckProfile({...deckProfile, targetBudget: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-zinc-800 p-4 pl-12 focus:outline-none focus:border-[#8A3A34] text-xl font-black text-center" />
                  </div>
                  <button onClick={() => setWizardStep(deckProfile.format === 'COMMANDER' ? 3 : 4)} className="w-full bg-[#8A3A34] text-white p-4 font-black uppercase hover:bg-black border border-[#8A3A34] transition-all">
                    {deckProfile.format === 'COMMANDER' ? '[PROCEED_TO_COMMANDER]' : '[INITIALIZE_CONSTRUCTION]'}
                  </button>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <h3 className="text-xs font-black text-[#9E8C6A] uppercase tracking-widest text-center">// DESIGNATE_COMMANDER</h3>
                  <div className="relative flex gap-2">
                    <input type="text" placeholder="QUERY_LEGENDARY..." onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchCards()} className="flex-1 bg-black border border-zinc-800 p-4 focus:border-[#9E8C6A] outline-none text-xs uppercase" />
                    <button onClick={handleSearchCards} className="bg-zinc-900 px-6 border border-zinc-800 text-[10px] font-black uppercase">Search</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-zinc-900 bg-black">
                    {suggestions.map(card => (
                      <div key={card.id} onClick={() => handleSelectCard(card.name)} className="p-4 border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer text-xs font-bold flex justify-between uppercase">
                        <span>{card.name}</span> <ColorIdentityDots colors={card.colors} />
                      </div>
                    ))}
                  </div>
                  {selectedVersion && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-95">
                      <div className="pixel-border border-2 border-zinc-800 p-1 bg-zinc-900 cursor-zoom-in" onDoubleClick={() => setExpandedCard(selectedVersion.imageUrl)}>
                        <img src={selectedVersion.imageUrl} className="w-64 grayscale hover:grayscale-0 transition-all duration-700" />
                      </div>
                      <button onClick={() => { setDeckProfile({ ...deckProfile, commander: selectedVersion }); setWizardStep(4); setSearchResult(null); setSearchName(''); }} className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-[#8A3A34] hover:text-white transition-all">
                        [DESIGNATE_COMMANDER]
                      </button>
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 4 && (
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                  <div className="w-full lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-0">
                    {deckProfile.commander && (
                      <div className="border border-[#9E8C6A]/20 bg-[#9E8C6A]/5 p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 grayscale border border-zinc-800 overflow-hidden cursor-zoom-in" onDoubleClick={() => setExpandedCard(deckProfile.commander?.imageUrl || null)}>
                          <img src={deckProfile.commander.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black text-[#9E8C6A] uppercase">Commander</p>
                          <p className="text-[10px] font-bold uppercase truncate">{deckProfile.commander.name}</p>
                          <ColorIdentityDots colors={deckProfile.commander.colorIdentity} />
                        </div>
                      </div>
                    )}
                    <input type="text" placeholder="ADD_CARD..." value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchCards()} className="w-full bg-[#0F0F0F] border border-[#1C1C1C] p-3 text-[10px] focus:border-zinc-600 outline-none uppercase" />
                    <div className="max-h-60 overflow-y-auto border border-zinc-900 bg-black">
                      {suggestions.map(card => (
                        <div key={card.id} onClick={() => handleSelectCard(card.name)} className="p-3 border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer text-[10px] font-bold flex justify-between uppercase">
                          <span>{card.name}</span> <ColorIdentityDots colors={card.colors} />
                        </div>
                      ))}
                    </div>
                    {selectedVersion && searchResult && (
                      <div className="border border-zinc-800 p-4 bg-zinc-950 animate-in zoom-in-95">
                        <div className="cursor-zoom-in mb-4" onDoubleClick={() => setExpandedCard(selectedVersion.imageUrl)}>
                          <img src={selectedVersion.imageUrl} className="w-full grayscale hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <div className="flex items-center justify-between mb-4 border border-zinc-800 p-2">
                          <span className="text-[9px] font-black text-zinc-500 uppercase">Quantity</span>
                          <div className="flex items-center gap-4">
                            <button onClick={() => setWizardQuantity(Math.max(1, wizardQuantity-1))} className="text-zinc-500 hover:text-white px-2">[-]</button>
                            <span className="text-xs font-black">{wizardQuantity}</span>
                            <button onClick={() => {
                              const isBasicLand = selectedVersion?.setName?.toLowerCase().includes('basic land') || ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Ilha', 'Pântano', 'Montanha', 'Floresta', 'Planície'].includes(selectedVersion.name);
                              if (deckProfile.format !== 'COMMANDER' || isBasicLand) setWizardQuantity(wizardQuantity+1);
                            }} disabled={deckProfile.format === 'COMMANDER' && !selectedVersion?.setName?.toLowerCase().includes('basic land') && !['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Ilha', 'Pântano', 'Montanha', 'Floresta', 'Planície'].includes(selectedVersion.name)} className="text-zinc-500 hover:text-white px-2 disabled:opacity-20">[+]</button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-[10px]">
                          <ColorIdentityDots colors={selectedVersion.colorIdentity} /><span className="text-green-500 font-black">R$ {selectedVersion.priceBRL}</span>
                        </div>
                        <button onClick={() => handleAddCardToWizard(searchResult, selectedVersion)} className="w-full bg-zinc-800 text-[10px] font-black p-2 hover:bg-white hover:text-black uppercase">[COMMIT_TO_DECK]</button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-8">
                    <div className="flex flex-col gap-4 border-b border-zinc-900 pb-4">
                      <div className="flex justify-between items-center font-black text-[10px] text-zinc-500 tracking-widest uppercase">
                        <span>// DECK_REGISTRY</span> <span>{wizardDeck.reduce((a,b)=>a+b.quantity, 0)} CARDS</span>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="FILTER..." value={deckLocalFilter} onChange={(e) => setDeckLocalFilter(e.target.value)} className="flex-1 bg-black border border-zinc-800 p-2 text-[10px] focus:border-zinc-600 outline-none uppercase" />
                        <button onClick={handlePurgeViolations} className="bg-zinc-900 border border-[#8A3A34] text-[#8A3A34] px-4 text-[8px] font-black uppercase hover:bg-[#8A3A34] hover:text-white transition-all">[PURGE]</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
                      {filteredDeck.map((item, i) => {
                        const legality = validateCardLegality(item.selectedVersion);
                        const validVersions = item.allVersions.filter(v => v.priceBRL && parseFloat(v.priceBRL) > 0);
                        const avgPrice = validVersions.length > 0 ? validVersions.reduce((a,b)=>a + parseFloat(b.priceBRL || '0'), 0) / validVersions.length : 0;
                        return (
                          <div key={i} className={`p-4 bg-black flex justify-between items-center hover:bg-zinc-950 group border-l-4 ${legality.isLegal ? 'border-transparent' : 'border-[#8A3A34] animate-pulse'}`}>
                            <div className="flex items-center gap-4">
                              <span className="text-[8px] text-zinc-700 font-bold">{item.quantity}x</span>
                              <div className="flex flex-col"><span className="text-xs font-bold uppercase cursor-zoom-in" onDoubleClick={() => setExpandedCard(item.selectedVersion.imageUrl)}>{item.selectedVersion.name}</span>
                                {!legality.isLegal && <span className="text-[8px] text-[#8A3A34] font-black uppercase tracking-tighter">{legality.reason}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 relative">
                              <div className="group relative">
                                <div className="flex flex-col items-end cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveEditionSelector(activeEditionSelector === i ? null : i); }}>
                                  <span className="text-[8px] font-bold text-zinc-600 uppercase">Avg: {avgPrice > 0 ? `R$ ${avgPrice.toFixed(2).replace('.',',')}` : '--'}</span>
                                  <span className="text-xs font-black text-zinc-300">R$ {item.selectedVersion.priceBRL?.replace('.', ',') || '--'}</span>
                                </div>
                                <div className="absolute right-0 top-full mt-2 w-64 bg-black border border-zinc-800 z-50 hidden group-hover:block p-2 shadow-2xl">
                                  <p className="text-[8px] font-black text-zinc-500 mb-2 border-b border-zinc-900 pb-1">AVAILABLE_EDITIONS</p>
                                  {item.allVersions.slice(0, 5).map(v => (
                                    <div key={v.id} className="flex justify-between text-[9px] mb-1">
                                      <span className="truncate max-w-[150px]">{v.setName}</span>
                                      <span className="font-bold text-zinc-400">R$ {v.priceBRL?.replace('.',',') || '--'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {activeEditionSelector === i && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0A0A0A] border border-[#9E8C6A] z-[60] p-4 shadow-2xl animate-in slide-in-from-top-2" onClick={(e)=>e.stopPropagation()}>
                                  <h4 className="text-[9px] font-black text-[#9E8C6A] mb-4 uppercase border-b border-zinc-900 pb-2">Select_Edition_Tuning</h4>
                                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                    {item.allVersions.map(v => (
                                      <div key={v.id} onClick={() => { 
                                        setWizardDeck(prev => prev.map(wi => wi.uid === item.uid ? { ...wi, selectedVersion: v } : wi));
                                        setActiveEditionSelector(null); 
                                      }} className={`p-2 flex justify-between items-center hover:bg-zinc-900 cursor-pointer border ${item.selectedVersion.id === v.id ? 'border-[#9E8C6A]/40 bg-zinc-900' : 'border-transparent'}`}>
                                        <div className="flex flex-col"><span className="text-[9px] font-bold uppercase truncate max-w-[180px]">{v.setName}</span><span className="text-[7px] text-zinc-600 uppercase">{v.rarity}</span></div>
                                        <span className="text-[10px] font-black text-green-600">R$ {v.priceBRL?.replace('.',',') || '--'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  if (confirmingRemoveCardUid === item.uid) {
                                    handleRemoveCardFromWizard(item.uid);
                                  } else {
                                    setConfirmingRemoveCardUid(item.uid);
                                  }
                                }} 
                                onMouseLeave={() => setConfirmingRemoveCardUid(null)}
                                className={`ml-4 text-[10px] font-black transition-all ${confirmingRemoveCardUid === item.uid ? 'text-[#8A3A34] animate-pulse underline' : 'text-zinc-700 hover:text-[#8A3A34]'}`}
                              >
                                {confirmingRemoveCardUid === item.uid ? '[CONFIRM_REMOVE?]' : '[X]'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => setWizardStep(5)} disabled={wizardDeck.length === 0} className="w-full bg-white text-black p-4 font-black uppercase tracking-widest hover:bg-[#8A3A34] hover:text-white transition-all disabled:opacity-20">[FINAL_DECISION_PROMPT]</button>
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="max-w-2xl mx-auto space-y-12 py-20 text-center animate-in zoom-in-95 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black tracking-tighter uppercase">Registry_Ready</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Select final procedure for this grimoire</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => setWizardStep(6)} className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-[#9E8C6A] group transition-all">
                      <h4 className="font-black text-sm tracking-widest mb-2 group-hover:text-[#9E8C6A]">[01] RUN_DIAGNOSTICS</h4>
                      <p className="text-[8px] text-zinc-600 uppercase font-bold">Structural & Statistical Analysis</p>
                    </button>
                    <button onClick={() => setWizardStep(7)} className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-green-700 group transition-all">
                      <h4 className="font-black text-sm tracking-widest mb-2 group-hover:text-green-600">[02] COMMIT_TO_GRIMOIRE</h4>
                      <p className="text-[8px] text-zinc-600 uppercase font-bold">Permanent SQLite Persistence</p>
                    </button>
                  </div>
                  <button onClick={() => setWizardStep(4)} className="text-[10px] font-black text-zinc-700 hover:text-white uppercase tracking-widest mt-12 underline underline-offset-8">[BACK_TO_CONSTRUCTION]</button>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-12 animate-in fade-in duration-700">
                  <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">// STRUCTURAL_DIAGNOSIS</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setWizardStep(5)} className="px-4 py-2 border border-zinc-800 text-[10px] font-black uppercase hover:bg-zinc-800">[BACK]</button>
                      <button onClick={() => setWizardStep(7)} className="px-6 py-2 bg-green-700 text-white font-black text-[10px] uppercase hover:bg-green-800">[SAVE_AFTER_ANALYSIS]</button>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Deck_Value</p><p className="text-3xl font-black text-green-500">R$ {currentTotalCost.toFixed(2).replace('.',',')}</p></div>
                    <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Card_Count</p><p className="text-3xl font-black text-[#9E8C6A]">{wizardDeck.reduce((a,b)=>a+b.quantity, 0)}</p></div>
                    <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Budget_Usage</p><p className={`text-3xl font-black ${budgetStatus.exceeded ? 'text-[#8A3A34]' : 'text-green-500'}`}>{budgetStatus.percent.toFixed(1)}%</p></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* MANA CURVE */}
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

                    {/* PILLAR STATUS */}
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
                    )}

                    {wizardStep === 7 && (
                    <div className="max-w-2xl mx-auto space-y-12 py-20 text-center animate-in zoom-in-95">
                    <div className="space-y-4">
                    <h3 className="text-4xl font-black tracking-tighter uppercase">Naming_Protocol</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Identify this record in the master database</p>
                    </div>

                    <div className="space-y-8">
                    <div className="p-8 border border-zinc-800 bg-black/40 space-y-4">
                      <p className="text-[10px] font-black text-[#9E8C6A] uppercase tracking-widest">Suggested_Identity</p>
                      <p className="text-2xl font-black tracking-widest">{generateDeckName()}</p>
                      <button onClick={() => handleSaveDeck(generateDeckName())} className="w-full bg-[#9E8C6A] text-black font-black p-4 uppercase tracking-widest hover:bg-white transition-all">[ACCEPT_SUGGESTION]</button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-zinc-900"></div>
                      <span className="text-[8px] font-black text-zinc-700 uppercase">OR_MANUAL_OVERRIDE</span>
                      <div className="h-px flex-1 bg-zinc-900"></div>
                    </div>

                    <div className="flex gap-2">
                      <input id="manual-name" type="text" placeholder="ENTER_UNIQUE_NAME..." className="flex-1 bg-black border border-zinc-800 p-4 focus:border-[#8A3A34] outline-none uppercase text-xs" />
                      <button onClick={() => {
                        const input = document.getElementById('manual-name') as HTMLInputElement;
                        handleSaveDeck(input.value);
                      }} className="bg-zinc-900 px-8 border border-zinc-800 text-[10px] font-black uppercase hover:bg-white hover:text-black">[COMMIT]</button>
                    </div>
                    </div>

                    <button onClick={() => setWizardStep(5)} className="text-[10px] font-black text-zinc-700 hover:text-white uppercase tracking-widest mt-12 underline underline-offset-8">[CANCEL]</button>
                    </div>
                    )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
