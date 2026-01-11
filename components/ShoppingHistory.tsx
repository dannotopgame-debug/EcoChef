import React, { useState } from 'react';
import { ShoppingHistoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { playSoftClick } from '../utils/sound';

interface ShoppingHistoryProps {
  history: ShoppingHistoryItem[];
  onDelete: (id: string) => void;
  onUpdate: (item: ShoppingHistoryItem) => void;
}

export const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({ history, onDelete, onUpdate }) => {
  const { t } = useLanguage();
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const groupedHistory = history.reduce((acc, item) => {
    if (!acc[item.weekLabel]) {
      acc[item.weekLabel] = [];
    }
    acc[item.weekLabel].push(item);
    return acc;
  }, {} as Record<string, ShoppingHistoryItem[]>);

  const sortedWeeks = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  const toggleCheck = (historyItem: ShoppingHistoryItem, itemName: string) => {
    playSoftClick();
    const isChecked = historyItem.checkedItems?.includes(itemName);
    let newCheckedItems = historyItem.checkedItems || [];

    if (isChecked) {
        newCheckedItems = newCheckedItems.filter(i => i !== itemName);
    } else {
        newCheckedItems = [...newCheckedItems, itemName];
    }

    onUpdate({
        ...historyItem,
        checkedItems: newCheckedItems
    });
  };

  const handleAddItem = (historyItem: ShoppingHistoryItem) => {
      const val = newItems[historyItem.id]?.trim();
      if (!val) return;
      playSoftClick();

      const newList = [...historyItem.list];
      let extrasCat = newList.find(cat => cat.category === 'Agregados');
      
      if (extrasCat) {
          extrasCat.items = [...extrasCat.items, val];
      } else {
          newList.push({ category: 'Agregados', items: [val] });
      }

      onUpdate({
          ...historyItem,
          list: newList
      });

      setNewItems(prev => ({ ...prev, [historyItem.id]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <h2 className="text-3xl font-bold text-stone-800 mb-8 flex items-center gap-3">
        <span>📅</span> {t('history_title')}
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
          <p className="text-stone-500 text-lg">Empty...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedWeeks.map((week) => (
            <div key={week}>
              <h3 className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-4 border-b border-stone-200 pb-2">
                {week}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedHistory[week].map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 relative hover:shadow-md transition-shadow flex flex-col">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      X
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
                            🛒
                        </div>
                        <div>
                            <p className="font-bold text-stone-800 text-sm">
                                {new Date(item.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                        {item.list.map((cat, idx) => (
                            <div key={idx}>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">{cat.category}</p>
                                <ul className="space-y-1">
                                    {cat.items.map((iName, iIdx) => {
                                        const isChecked = item.checkedItems?.includes(iName);
                                        return (
                                            <li 
                                                key={iIdx} 
                                                className={`flex items-start gap-2 cursor-pointer group p-1 rounded hover:bg-stone-50`}
                                                onClick={() => toggleCheck(item, iName)}
                                            >
                                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-stone-400 border-stone-400' : 'bg-white border-stone-300'}`}>
                                                    {isChecked && <span className="text-[8px]">✓</span>}
                                                </div>
                                                <span className={`text-xs ${isChecked ? 'line-through text-stone-400' : 'text-stone-700'}`}>{iName}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newItems[item.id] || ''}
                                onChange={(e) => setNewItems({...newItems, [item.id]: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(item)}
                                className="flex-1 text-xs p-2 border border-stone-200 rounded-lg outline-none focus:border-amber-400"
                            />
                            <button 
                                onClick={() => handleAddItem(item)}
                                className="bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-900"
                            >
                                +
                            </button>
                        </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};