import { useState, useEffect, useRef, useMemo } from 'react';
import { themes } from './themes';

// --- COMPONENTES AUXILIARES ---
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9E8C6A';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full opacity-20 pointer-events-none" />;
};

const ColorIdentityDots = ({ colors = [] }: { colors?: string[] }) => {
  const colorMap: Record<string, string> = {
    'W': 'mtg-white', 'U': 'mtg-blue', 'B': 'mtg-black', 'R': 'mtg-red', 'G': 'mtg-green'
  };
  return (
    <div className="flex gap-1">
      {(colors || []).length === 0 ? (
        <div className="w-2 h-2 rounded-full mtg-colorless" title="Colorless"></div>
      ) : (
        colors.map(c => <div key={c} className={`w-2 h-2 rounded-full ${colorMap[c] || 'bg-zinc-500'}`} title={c}></div>)
      )}
    </div>
  );
};

// --- TIPAGENS ---
interface List { id: string; name: string; format?: string; archetype?: string; target_budget?: number; }
interface CardSuggestion { id: string; name: string; mana_cost: string; colors: string[]; }
interface CardVersion {
  id: string; name: string; setName: string; setCode: string; rarity: string;
  priceUSD: string | null; priceFoilUSD: string | null;
  priceBRL: string | null; priceFoilBRL: string | null;
  imageUrl: string; scryfallUri: string; category: string;
  legalities: Record<string, string>; colorIdentity: string[];
}
interface CardPriceResult { name: string; versions: CardVersion[]; }
interface LigaMagicOffer { storeName: string; storeLogo: string; price: string; availability: string; link: string; }
interface LigaMagicOption { name: string; setName: string; link: string; }
interface OffersResult { avgPrice: string | null; offers: LigaMagicOffer[]; options?: LigaMagicOption[]; updatedAt: string | null; fromCache?: boolean; }

interface WizardDeckItem {
  allVersions: CardVersion[];
  selectedVersion: CardVersion;
  quantity: number;
}

interface DeckProfile {
  format: 'STANDARD' | 'COMMANDER' | 'PAUPER' | null;
  objective: 'COMPETITIVE' | 'FUN' | null;
  archetype: 'AGGRO' | 'MIDRANGE' | 'CONTROL' | 'COMBO' | null;
  targetBudget: number;
  commander?: CardVersion | null;
}

const API_BASE_URL = 'http://localhost:3001';
const currentTheme = themes.default.colors;

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

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.toUpperCase() }),
      });
      if (response.ok) { setNewListName(''); loadLists(); }
    } catch (e) { console.error('CREATE_FAIL'); }
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
      setErrorMessage('ACTION_DENIED: SINGLETON_CONSTRAINT');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setWizardDeck(prev => [...prev, { allVersions: cardResult.versions, selectedVersion: selected, quantity: wizardQuantity }]);
    setSearchResult(null); setSearchName(''); setWizardQuantity(1);
  };

  const handleRemoveCardFromWizard = (index: number) => {
    setWizardDeck(prev => prev.filter((_, i) => i !== index));
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
          allVersions: i.data.versions,
          selectedVersion: i.data.versions[0],
          quantity: i.quantity
        })));
        setWizardStep(deckProfile.format === 'COMMANDER' ? 3 : 4);
      }
    } catch (e) {
      setErrorMessage('IMPORT_FAIL');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally { setImporting(false); }
  };

  const handleSaveDeck = async () => {
    const deckName = prompt("NAME_THIS_GRIMOIRE_RECORD:");
    if (!deckName) return;
    const payload = {
      name: deckName.toUpperCase(),
      format: deckProfile.format,
      archetype: deckProfile.archetype,
      targetBudget: deckProfile.targetBudget,
      cards: wizardDeck.map(item => ({
        card_id: item.selectedVersion.id,
        name: item.selectedVersion.name,
        quantity: item.quantity,
        price_brl: item.selectedVersion.priceBRL,
        category: item.selectedVersion.category
      }))
    };
    try {
      const response = await fetch(`${API_BASE_URL}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) { resetWizard(); setActiveTab('lists'); loadLists(); }
    } catch (e) { setErrorMessage('SAVE_FAIL'); }
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
        <div className="fixed top-0 left-0 right-0 z-50 p-2 bg-[#8A3A34] text-white text-center text-xs font-bold border-b border-black">
          [ALERT] {errorMessage}
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 border-r border-[#1C1C1C] p-6 flex flex-col gap-8 bg-[#050505]">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-black tracking-tighter uppercase animate-glitch-color">DogMagic</h1>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 border border-[#1C1C1C] w-fit text-[#9E8C6A]">sys_build: 1.1.0</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('lists')} className={`text-left px-3 py-2 text-xs transition-all border ${activeTab === 'lists' ? 'bg-zinc-800 text-white border-zinc-700' : 'border-transparent hover:bg-zinc-900'}`}>[01] INVENTORY</button>
            <button onClick={() => setActiveTab('search')} className={`text-left px-3 py-2 text-xs transition-all border ${activeTab === 'search' ? 'bg-zinc-800 text-white border-zinc-700' : 'border-transparent hover:bg-zinc-900'}`}>[02] MARKET</button>
            <button onClick={() => { setActiveTab('wizard'); resetWizard(); }} className={`text-left px-3 py-2 text-xs transition-all border ${activeTab === 'wizard' ? 'bg-[#8A3A34] text-white border-[#8A3A34]' : 'border-transparent hover:bg-zinc-900'}`}>[03] WIZARD</button>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {activeTab === 'lists' && (
            <section className={`max-w-5xl mx-auto ${(import.meta as any).env?.MODE !== 'test' ? 'animate-in fade-in' : ''}`}>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-zinc-600">// INVENTORY_REGISTRY</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
                <div className="group p-8 bg-black border-b md:border-b-0 border-zinc-900 flex flex-col gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">// NEW_RECORD</h3>
                  <input type="text" placeholder="ENTER_NAME..." value={newListName} onChange={(e) => setNewListName(e.target.value)} className="w-full bg-[#0F0F0F] border border-zinc-800 p-2 text-[10px] focus:outline-none focus:border-[#8A3A34] uppercase font-mono" />
                  <button onClick={handleCreateList} className="w-full bg-zinc-900 text-[9px] font-black py-2 hover:bg-white hover:text-black transition-all uppercase">[EXECUTE_CREATE]</button>
                </div>
                {Array.isArray(lists) && lists.map(list => (
                  <div key={list.id} className="group p-8 bg-black hover:bg-zinc-950 transition-all cursor-pointer border-b md:border-b-0 border-zinc-900">
                    <h3 className="font-black text-sm group-hover:text-[#8A3A34] tracking-widest uppercase mb-2">{list.name}</h3>
                    <div className="flex justify-between items-center"><span className="text-[8px] text-zinc-700 font-bold">REC_ID: {list.id.slice(0, 8)}</span></div>
                  </div>
                ))}
                <div onClick={() => { setActiveTab('wizard'); resetWizard(); }} className="p-8 bg-black border-dashed border border-zinc-900 hover:bg-zinc-900 transition-all cursor-pointer flex items-center justify-center group">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-zinc-400">[+ NEW_GRIMOIRE]</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'search' && (
            <section className={`max-w-5xl mx-auto ${(import.meta as any).env?.MODE !== 'test' ? 'animate-in fade-in duration-500' : ''}`}>
              <div className="mb-12 flex gap-2">
                <div className="flex-1">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-zinc-500">// INPUT_PROMPT</h2>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">{`>>`}</span>
                    <input type="text" placeholder="INITIATE_SEARCH..." value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchCards()} className="w-full bg-[#0F0F0F] border border-[#1C1C1C] p-4 pl-12 focus:outline-none focus:border-zinc-600 transition-all uppercase text-xs tracking-widest" />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <button onClick={handleSearchCards} disabled={searching} className="h-[52px] px-8 bg-zinc-900 border border-zinc-800 text-[10px] font-black hover:bg-white hover:text-black transition-all disabled:opacity-30 uppercase tracking-widest">
                    {searching ? '[BUSY...]' : '[INITIATE_SCAN]'}
                  </button>
                </div>
              </div>
              {suggestions.length > 0 && (
                <div className="mb-12 border border-[#1C1C1C] bg-black">
                  <div className="p-2 px-4 border-b border-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-500">CANDIDATES_STREAM</div>
                  {suggestions.map(card => (
                    <div key={card.id} onClick={() => handleSelectCard(card.name)} className="p-4 border-b border-zinc-900 last:border-0 hover:bg-zinc-900 cursor-pointer flex justify-between items-center transition-colors">
                      <span className="text-xs font-bold uppercase">{card.name}</span>
                      <ColorIdentityDots colors={card.colors} />
                    </div>
                  ))}
                </div>
              )}

              {searchResult && selectedVersion && (
                <div className="flex flex-col xl:flex-row gap-12 items-start animate-in fade-in duration-700">
                  <div className="w-full xl:w-[300px] shrink-0 xl:sticky xl:top-0">
                    <div className="pixel-border border-2 border-zinc-800 p-1 bg-zinc-900 cursor-zoom-in" onDoubleClick={() => setExpandedCard(selectedVersion.imageUrl)}>
                      <img src={selectedVersion.imageUrl} alt={searchResult.name} className="w-full grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                    {offersData?.avgPrice && (
                      <div className="mt-6 border border-green-900 bg-green-900/10 p-4">
                        <p className="text-[9px] font-bold text-green-500 mb-1 tracking-widest uppercase">Avg_Local_Price</p>
                        <p className="text-xl font-black text-green-400">{offersData.avgPrice}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 w-full space-y-12">
                    <div>
                      <div className="flex items-end justify-between mb-8 border-b border-zinc-800 pb-4">
                        <h3 className="text-3xl font-black tracking-tight uppercase">{searchResult.name}</h3>
                        <div className="flex gap-2">
                          {loadingOffers ? (
                            <span className="text-[10px] font-bold text-zinc-500 animate-pulse uppercase tracking-widest">[SYNCHRONIZING_MARKET...]</span>
                          ) : (
                            <button onClick={() => fetchOffers(searchResult.name, selectedVersion.id, true)} className="px-4 py-2 border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase hover:bg-zinc-800 hover:text-white transition-all">
                              [RE_SCAN]
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="border border-zinc-900 bg-black overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-zinc-900/50 text-zinc-500 font-black uppercase tracking-widest sticky top-0">
                            <tr><th className="p-4">EDITION_SET</th><th className="p-4">RARITY</th><th className="p-4 text-right">NORMAL_BRL</th><th className="p-4 text-right">FOIL_BRL</th></tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {searchResult.versions.map(v => (
                              <tr key={v.id} onClick={() => handleVersionChange(v)} className={`hover:bg-zinc-900 cursor-pointer ${selectedVersion.id === v.id ? 'bg-zinc-900/40' : ''}`}>
                                <td className="p-4 font-bold opacity-70">{v.setName}</td>
                                <td className="p-4 font-bold opacity-40 uppercase">{v.rarity}</td>
                                <td className="p-4 text-right font-black text-zinc-300">{v.priceBRL ? `R$ ${v.priceBRL.replace('.', ',')}` : '--'}</td>
                                <td className="p-4 text-right font-black text-[#8A3A34]">{v.priceFoilBRL ? `R$ ${v.priceFoilBRL.replace('.', ',')}` : '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
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
                                      <div key={v.id} onClick={() => { const newDeck = [...wizardDeck]; newDeck[i].selectedVersion = v; setWizardDeck(newDeck); setActiveEditionSelector(null); }} className={`p-2 flex justify-between items-center hover:bg-zinc-900 cursor-pointer border ${item.selectedVersion.id === v.id ? 'border-[#9E8C6A]/40 bg-zinc-900' : 'border-transparent'}`}>
                                        <div className="flex flex-col"><span className="text-[9px] font-bold uppercase truncate max-w-[180px]">{v.setName}</span><span className="text-[7px] text-zinc-600 uppercase">{v.rarity}</span></div>
                                        <span className="text-[10px] font-black text-green-600">R$ {v.priceBRL?.replace('.',',') || '--'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <button onClick={() => handleRemoveCardFromWizard(i)} className="ml-4 text-[10px] text-zinc-700 hover:text-[#8A3A34] font-black">[X]</button>
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
                    <button onClick={handleSaveDeck} className="p-10 border border-zinc-800 bg-[#0A0A0A] hover:border-green-700 group transition-all">
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
                      <button onClick={handleSaveDeck} className="px-6 py-2 bg-green-700 text-white font-black text-[10px] uppercase hover:bg-green-800">[SAVE_AFTER_ANALYSIS]</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Deck_Value</p><p className="text-3xl font-black text-green-500">R$ {currentTotalCost.toFixed(2).replace('.',',')}</p></div>
                    <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Card_Count</p><p className="text-3xl font-black text-[#9E8C6A]">{wizardDeck.reduce((a,b)=>a+b.quantity, 0)}</p></div>
                    <div className="p-6 border border-zinc-900 bg-black/40"><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-widest">Budget_Usage</p><p className={`text-3xl font-black ${budgetStatus.exceeded ? 'text-[#8A3A34]' : 'text-green-500'}`}>{budgetStatus.percent.toFixed(1)}%</p></div>
                  </div>
                  <div className="p-10 border border-zinc-900 bg-black/20 text-center"><p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Detailed_Pillar_Analytics_Processing...</p></div>
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
