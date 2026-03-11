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
    <section className={`max-w-6xl mx-auto ${!isTest ? 'animate-in fade-in' : ''}`} data-testid="inventory-grid">
      <div className="flex justify-between items-center mb-16 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Master Registry</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Verified Assets Distribution</p>
        </div>
        <button 
          onClick={onInitiateNewBuild} 
          className="bg-primary text-white px-8 py-4 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-md hover:shadow-xl"
        >
          + Initiate New Build
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(lists) && lists.map(list => (
          <div 
            key={list.id} 
            onClick={() => onViewDeck(list.id)} 
            className="group p-8 bg-surface border border-border rounded-sm transition-all cursor-pointer relative overflow-hidden document-shadow hover:shadow-2xl hover:-translate-y-1"
            data-testid={`deck-card-${list.id}`}
          >
            <div className="absolute top-0 left-0 w-[3px] h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
            
            <button 
              onClick={(e) => onDeleteDeck(e, list.id)} 
              onMouseLeave={() => setConfirmingDeleteDeckId(null)}
              className={`absolute top-4 right-4 text-[8px] font-black transition-all px-2 py-1 uppercase tracking-widest ${confirmingDeleteDeckId === list.id ? 'bg-accent text-white opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-accent'}`}
            >
              {confirmingDeleteDeckId === list.id ? 'Confirm Erase?' : 'Delete'}
            </button>

            <h3 className="font-bold text-xl text-slate-800 mb-6 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight pr-8">{list.name}</h3>
            
            <div className="flex justify-between items-end border-t border-slate-50 pt-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Index Code</span>
                <span className="text-[10px] font-mono text-slate-500">{list.id.slice(0, 12)}</span>
              </div>
              <div className="px-2 py-1 bg-slate-50 border border-border rounded-sm">
                <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{list.format}</span>
              </div>
            </div>
          </div>
        ))}
        {(!lists || lists.length === 0) && (
          <div className="col-span-full py-32 text-center bg-surface/50 rounded-sm border border-dashed border-border">
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs italic">The archive vault is currently empty.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InventoryGrid;
