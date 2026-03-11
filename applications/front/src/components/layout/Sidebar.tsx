import React from 'react';

interface SidebarProps {
  activeTab: 'lists' | 'search' | 'wizard';
  setActiveTab: (tab: 'lists' | 'search' | 'wizard') => void;
  onResetWizard: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onResetWizard }) => {
  return (
    <aside className="w-64 border-r border-border p-8 flex flex-col gap-12 bg-surface shrink-0 relative">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight leading-none">Dog Magic</h1>
        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-70 px-0.5">Grand Archive Tools</p>
      </div>

      <nav className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Navigation</p>
          <button 
            onClick={() => setActiveTab('lists')} 
            className={`w-full flex items-center gap-4 px-4 py-3 text-xs font-bold transition-all border-l-2 ${activeTab === 'lists' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-secondary hover:text-primary hover:bg-black/5'}`}
          >
            Inventory Registry
          </button>
          <button 
            onClick={() => setActiveTab('search')} 
            className={`w-full flex items-center gap-4 px-4 py-3 text-xs font-bold transition-all border-l-2 ${activeTab === 'search' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-secondary hover:text-primary hover:bg-black/5'}`}
          >
            Market Intelligence
          </button>
        </div>

        <div className="mt-6 space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Operations</p>
          <button 
            onClick={() => { setActiveTab('wizard'); onResetWizard(); }} 
            className={`w-full flex items-center gap-4 px-4 py-3 text-xs font-black transition-all rounded-sm border ${activeTab === 'wizard' ? 'border-accent/50 bg-accent text-white shadow-md shadow-accent/20' : 'border-border bg-black/5 text-secondary hover:border-primary/30 hover:text-primary hover:bg-white'}`}
          >
            Deck Wizard
          </button>
        </div>
      </nav>

      <div className="mt-auto pt-8 border-t border-border">
        <div className="flex items-center gap-3 px-4 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-xs italic shadow-sm group-hover:scale-110 transition-transform">M</div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Connected</span>
            <span className="text-[8px] font-bold text-secondary uppercase">Local Session Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
