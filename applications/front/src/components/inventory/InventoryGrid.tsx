import React from 'react';
import { List } from '../../types';

interface InventoryGridProps {
  lists: List[];
  onViewDeck: (id: string) => void;
  onDeleteDeck: (e: React.MouseEvent, id: string) => void;
  onInitiateNewBuild: () => void;
  confirmingDeleteDeckId: string | null;
  setConfirmingDeleteDeckId: (id: string | null) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ 
  lists, 
  onViewDeck, 
  onDeleteDeck, 
  onInitiateNewBuild,
  confirmingDeleteDeckId,
  setConfirmingDeleteDeckId
}) => {
  const isTest = (import.meta as any).env?.MODE === 'test';

  return (
    <section className={`max-w-5xl mx-auto ${!isTest ? 'animate-in fade-in' : ''}`} data-testid="inventory-grid">
      <div className="flex justify-between items-end mb-10 border-b border-zinc-900 pb-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">// INVENTORY_REGISTRY</h2>
        <button 
          onClick={onInitiateNewBuild} 
          className="bg-[#8A3A34] text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          [+ INITIATE_NEW_BUILD]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
        {Array.isArray(lists) && lists.map(list => (
          <div 
            key={list.id} 
            onClick={() => onViewDeck(list.id)} 
            className="group p-8 bg-black hover:bg-zinc-950 transition-all cursor-pointer border-b md:border-b-0 border-zinc-900 border-l-2 border-l-transparent hover:border-l-[#8A3A34] relative"
            data-testid={`deck-card-${list.id}`}
          >
            <button 
              onClick={(e) => onDeleteDeck(e, list.id)} 
              onMouseLeave={() => setConfirmingDeleteDeckId(null)}
              className={`absolute top-4 right-4 text-[8px] font-black transition-all uppercase tracking-widest ${confirmingDeleteDeckId === list.id ? 'opacity-100 text-white bg-[#8A3A34] px-2 py-1' : 'opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-[#8A3A34]'}`}
            >
              {confirmingDeleteDeckId === list.id ? '[CONFIRM_ERASE?]' : '[ERASE_RECORD]'}
            </button>
            <h3 className="font-black text-sm group-hover:text-[#8A3A34] tracking-widest uppercase mb-2">{list.name}</h3>
            <div className="flex justify-between items-center text-[8px] font-bold text-zinc-700">
              <span>REC_ID: {list.id.slice(0, 8)}</span>
              <span className="uppercase text-[#9E8C6A]">{list.format}</span>
            </div>
          </div>
        ))}
        {(!lists || lists.length === 0) && (
          <div className="col-span-3 p-20 text-center bg-black">
            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">No_Records_Found_In_Master_Grimoire</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InventoryGrid;
