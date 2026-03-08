import React from 'react';
import { CardVersion, CardPriceResult, OffersResult } from '../../types';

interface MarketResultProps {
  searchResult: CardPriceResult;
  selectedVersion: CardVersion;
  onVersionChange: (v: CardVersion) => void;
  onFetchOffers: (name: string, id: string, force?: boolean) => void;
  loadingOffers: boolean;
  offersData: OffersResult | null;
  onImageDoubleClick: (url: string) => void;
}

const MarketResult: React.FC<MarketResultProps> = ({ 
  searchResult, 
  selectedVersion, 
  onVersionChange, 
  onFetchOffers, 
  loadingOffers, 
  offersData,
  onImageDoubleClick
}) => {
  return (
    <div className="flex flex-col xl:flex-row gap-12 items-start animate-in fade-in duration-700" data-testid="market-result">
      <div className="w-full xl:w-[300px] shrink-0 xl:sticky xl:top-0">
        <div 
          className="pixel-border border-2 border-zinc-800 p-1 bg-zinc-900 cursor-zoom-in" 
          onDoubleClick={() => onImageDoubleClick(selectedVersion.imageUrl)}
        >
          <img 
            src={selectedVersion.imageUrl} 
            alt={searchResult.name} 
            className="w-full grayscale hover:grayscale-0 transition-all duration-700" 
          />
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
                <button 
                  onClick={() => onFetchOffers(searchResult.name, selectedVersion.id, true)} 
                  className="px-4 py-2 border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase hover:bg-zinc-800 hover:text-white transition-all"
                >
                  [RE_SCAN]
                </button>
              )}
            </div>
          </div>

          <div className="border border-zinc-900 bg-black overflow-hidden">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-zinc-900/50 text-zinc-500 font-black uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="p-4">EDITION_SET</th>
                  <th className="p-4">RARITY</th>
                  <th className="p-4 text-right">NORMAL_BRL</th>
                  <th className="p-4 text-right">FOIL_BRL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {searchResult.versions.map(v => (
                  <tr 
                    key={v.id} 
                    onClick={() => onVersionChange(v)} 
                    className={`hover:bg-zinc-900 cursor-pointer ${selectedVersion.id === v.id ? 'bg-zinc-900/40' : ''}`}
                    data-testid={`version-${v.id}`}
                  >
                    <td className="p-4 font-bold opacity-70">{v.setName}</td>
                    <td className="p-4 font-bold opacity-40 uppercase">{v.rarity}</td>
                    <td className="p-4 text-right font-black text-zinc-300">
                      {v.priceBRL ? `R$ ${v.priceBRL.replace('.', ',')}` : '--'}
                    </td>
                    <td className="p-4 text-right font-black text-[#8A3A34]">
                      {v.priceFoilBRL ? `R$ ${v.priceFoilBRL.replace('.', ',')}` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResult;
