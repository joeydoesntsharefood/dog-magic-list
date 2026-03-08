import React from 'react';

interface SidebarProps {
  activeTab: 'lists' | 'search' | 'wizard';
  setActiveTab: (tab: 'lists' | 'search' | 'wizard') => void;
  onResetWizard: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onResetWizard }) => {
  return (
    <aside className="w-64 border-r border-[#1C1C1C] p-6 flex flex-col gap-8 bg-[#050505] shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-black tracking-tighter uppercase animate-glitch-color">DogMagic</h1>
        <span className="text-[9px] uppercase font-bold px-2 py-0.5 border border-[#1C1C1C] w-fit text-[#9E8C6A]">sys_build: 1.1.0</span>
      </div>
      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('lists')} 
          className={`text-left px-3 py-2 text-xs transition-all border ${activeTab === 'lists' ? 'bg-zinc-800 text-white border-zinc-700' : 'border-transparent hover:bg-zinc-900'}`}
        >
          [01] INVENTORY
        </button>
        <button 
          onClick={() => setActiveTab('search')} 
          className={`text-left px-3 py-2 text-xs transition-all border ${activeTab === 'search' ? 'bg-zinc-800 text-white border-zinc-700' : 'border-transparent hover:bg-zinc-900'}`}
        >
          [02] MARKET
        </button>
        <button 
          onClick={() => { setActiveTab('wizard'); onResetWizard(); }} 
          className={`text-left px-3 py-2 text-xs transition-all border ${activeTab === 'wizard' ? 'bg-[#8A3A34] text-white border-[#8A3A34]' : 'border-transparent hover:bg-zinc-900'}`}
        >
          [03] WIZARD
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
