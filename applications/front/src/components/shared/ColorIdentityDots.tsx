import React from 'react';

interface ColorIdentityDotsProps {
  colors?: string[];
}

const ColorIdentityDots: React.FC<ColorIdentityDotsProps> = ({ colors = [] }) => {
  const colorMap: Record<string, string> = {
    'W': 'mtg-white', 
    'U': 'mtg-blue', 
    'B': 'mtg-black', 
    'R': 'mtg-red', 
    'G': 'mtg-green'
  };

  return (
    <div className="flex gap-1" data-testid="color-identity">
      {(colors || []).length === 0 ? (
        <div className="w-2 h-2 rounded-full mtg-colorless" title="Colorless"></div>
      ) : (
        colors.map(c => (
          <div 
            key={c} 
            className={`w-2 h-2 rounded-full ${colorMap[c] || 'bg-zinc-500'}`} 
            title={c}
          ></div>
        ))
      )}
    </div>
  );
};

export default ColorIdentityDots;
