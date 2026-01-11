import React, { useState, useMemo } from 'react';
import { EcoChefResponse, Recipe, GeneratePlanParams, SavedRecipe, ShoppingCategory } from '../types';
import { RecipeModal } from './RecipeModal';
import { useLanguage } from '../contexts/LanguageContext';
import { playSoftClick } from '../utils/sound';

interface PlanDisplayProps {
  data: EcoChefResponse;
  lastParams: GeneratePlanParams | null;
  onRecalculate: (params: GeneratePlanParams) => void;
  onReset: () => void;
  savedRecipes: SavedRecipe[];
  onToggleSave: (recipe: Recipe) => void;
  onSaveToHistory: (categories: ShoppingCategory[]) => void;
  isGuest?: boolean;
  onRegister?: () => void;
}

const GuestOverlay: React.FC<{ onRegister?: () => void, text?: string }> = ({ onRegister, text }) => {
    const { t } = useLanguage();
    return (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100 max-w-sm">
                <span className="text-4xl mb-3 block">🔒</span>
                <h3 className="font-bold text-stone-800 text-lg mb-2">{text || t('locked_title')}</h3>
                <p className="text-stone-500 text-sm mb-4">{t('locked_desc')}</p>
                <button 
                    onClick={onRegister}
                    className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95"
                >
                    {t('locked_btn')}
                </button>
            </div>
        </div>
    );
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ 
  data, 
  lastParams, 
  onRecalculate, 
  onReset,
  savedRecipes,
  onToggleSave,
  onSaveToHistory,
  isGuest = false,
  onRegister
}) => {
  const { t } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const toggleItem = (item: string) => {
    if (isGuest) return;
    playSoftClick();
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const checkedCount = useMemo(() => Object.values(checkedItems).filter(Boolean).length, [checkedItems]);

  const handleRecalculateClick = () => {
    playSoftClick();
    if (isGuest) { onRegister?.(); return; }
    if (!lastParams) return;
    
    setIsRecalculating(true);
    
    const newIngredientsToAdd: string[] = [];
    data.shoppingList.forEach((cat, catIdx) => {
        cat.items.forEach((item, itemIdx) => {
            const id = `${catIdx}-${itemIdx}--${item}`;
            if (checkedItems[id]) {
                newIngredientsToAdd.push(item);
            }
        });
    });

    const updatedIngredients = `${lastParams.ingredients}, ${newIngredientsToAdd.join(', ')}`;

    onRecalculate({
      ...lastParams,
      ingredients: updatedIngredients
    });
  };

  const handleSaveListClick = () => {
    playSoftClick();
    if (isGuest) { onRegister?.(); return; }

    const filteredCategories: ShoppingCategory[] = [];
    data.shoppingList.forEach((cat, catIdx) => {
        const checkedInThisCat: string[] = [];
        cat.items.forEach((item, itemIdx) => {
            const id = `${catIdx}-${itemIdx}--${item}`;
            if (checkedItems[id]) {
                checkedInThisCat.push(item);
            }
        });

        if (checkedInThisCat.length > 0) {
            filteredCategories.push({
                category: cat.category,
                items: checkedInThisCat
            });
        }
    });

    onSaveToHistory(filteredCategories);
  };

  const renderRecipeCard = (recipe: Recipe, idx: number) => {
    const isSaved = savedRecipes.some(r => r.title === recipe.title);

    return (
      <div 
          key={idx} 
          className="rounded-xl shadow-sm border border-stone-200 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col"
      >
        <div 
          className="absolute top-4 right-4 z-10 flex gap-2"
          onClick={(e) => {
             e.stopPropagation();
             if (isGuest) onRegister?.();
             else onToggleSave(recipe);
          }}
        >
            <button
                className={`p-2 rounded-full shadow-md transition-all transform hover:scale-110 active:scale-95 ${isSaved ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-500'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        <div 
            className="p-6 flex-grow cursor-pointer"
            onClick={() => {
                playSoftClick();
                if(isGuest) onRegister?.();
                else setSelectedRecipe(recipe);
            }}
        >
          <div className="flex justify-between items-start mb-4 pr-10">
              <h4 className="text-lg font-bold text-emerald-900 group-hover:underline decoration-2 underline-offset-4 decoration-emerald-500">
                  {recipe.title}
              </h4>
          </div>
          
          <div className="space-y-3 mb-4 filter">
            {recipe.steps.slice(0, 2).map((step, sIdx) => (
              <div key={sIdx} className="flex gap-3 items-start opacity-80">
                <span className="flex-shrink-0 w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center mt-0.5 bg-emerald-100 text-emerald-800">
                  {sIdx + 1}
                </span>
                <p className={`text-stone-600 text-xs line-clamp-2 ${isGuest ? 'blur-[3px]' : ''}`}>
                  {isGuest ? 'Lorem ipsum ...' : step}
                </p>
              </div>
            ))}
          </div>
          
          <div className="rounded-lg p-3 flex gap-3 items-start border bg-emerald-50 border-emerald-100">
            <span className="text-lg">👨‍🍳</span>
            <div>
              <p className={`text-emerald-900 text-xs italic line-clamp-2 ${isGuest ? 'blur-sm select-none' : ''}`}>
                  "{recipe.chefTips}"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {selectedRecipe && (
        <RecipeModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-stone-200 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-stone-800">{t('plan_title')}</h2>
        </div>
        <button onClick={onReset} className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 font-medium shadow-sm transition-all text-sm flex items-center gap-2">
          <span>🗑️</span> {t('plan_new')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analysis Card */}
        <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
             <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
                <span>🔍</span> {t('diagnosis_title')}
            </h3>
            <p className="text-stone-600 mb-4 leading-relaxed text-lg">"{data.analysis.summary}"</p>
            <div className="flex flex-wrap gap-2">
                {data.analysis.usedIngredients.map((ing, i) => (
                <span key={i} className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-stone-600 text-sm font-medium">
                    {ing}
                </span>
                ))}
            </div>
        </div>

        {/* Nutrition Card */}
        <div className="bg-stone-900 text-stone-50 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-2">{t('nutrition_title')}</h3>
            <div className="mb-6 flex items-baseline">
                <span className="text-5xl font-bold tracking-tighter">{data.nutritionalStats.averageDailyCalories}</span>
                <span className="text-stone-400 text-sm ml-2 font-medium">kcal</span>
            </div>
            
            <div className="flex gap-1 mb-4 h-2 rounded-full overflow-hidden bg-stone-800">
                <div style={{width: data.nutritionalStats.macroSplit.protein}} className="bg-emerald-500"></div>
                <div style={{width: data.nutritionalStats.macroSplit.carbs}} className="bg-amber-400"></div>
                <div style={{width: data.nutritionalStats.macroSplit.fats}} className="bg-blue-400"></div>
            </div>

            <div className="flex justify-between text-xs text-stone-300">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Prot {data.nutritionalStats.macroSplit.protein}</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Carb {data.nutritionalStats.macroSplit.carbs}</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Fat {data.nutritionalStats.macroSplit.fats}</div>
            </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <section className="relative">
        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <span>📅</span> {t('menu_title')}
        </h3>
        <div className="overflow-hidden rounded-xl border border-stone-200 shadow-sm bg-white relative">
          <table className="w-full text-left">
            <tbody className="divide-y divide-stone-100 text-sm">
              {data.plan.map((row, idx) => {
                const isNewDay = idx === 0 || data.plan[idx - 1].day !== row.day;
                const isHidden = isGuest && idx > 2;
                
                return (
                  <tr key={idx} className={`hover:bg-stone-50 transition-colors ${isNewDay ? 'bg-stone-50/40' : ''} ${isHidden ? 'filter blur-sm select-none opacity-50' : ''}`}>
                    <td className={`p-4 font-bold text-stone-900 whitespace-nowrap ${!isNewDay ? 'opacity-0' : ''}`}>
                        {row.day}
                    </td>
                    <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                            ${row.mealType.includes('Desayuno') || row.mealType.includes('Breakfast') ? 'text-orange-600 bg-orange-50' : 
                              row.mealType.includes('Cena') || row.mealType.includes('Dinner') ? 'text-indigo-600 bg-indigo-50' : 'text-emerald-600 bg-emerald-50'}`}>
                            {row.mealType}
                        </span>
                    </td>
                    <td className="p-4 text-stone-700 font-medium text-base">{row.meal}</td>
                    <td className="p-4 text-stone-500 hidden sm:table-cell">
                      {row.prepTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
           {isGuest && (
             <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8">
                 <button onClick={onRegister} className="px-6 py-3 bg-stone-800 text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                    🔒 {t('locked_btn')}
                 </button>
             </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Shopping List */}
        <section className="lg:col-span-4 relative">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden sticky top-24 transition-all h-[500px]">
             {isGuest && <GuestOverlay onRegister={onRegister} text={t('shopping_title')} />}
            
            <div className="bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                    <span>🛒</span> {t('shopping_title')}
                </h3>
              </div>
            </div>
            
            <div className={`p-4 space-y-6 max-h-[60vh] overflow-y-auto ${isGuest ? 'filter blur-sm select-none' : ''}`}>
              {data.shoppingList.length === 0 ? (
                <div className="text-center py-8 px-4">
                    <p className="text-stone-500 font-medium">{t('shopping_empty')}</p>
                </div>
              ) : (
                data.shoppingList.map((cat, idx) => (
                  <div key={idx}>
                    <h4 className="font-bold text-stone-400 text-[10px] uppercase tracking-widest mb-2">
                      {cat.category}
                    </h4>
                    <ul className="space-y-1">
                      {cat.items.map((item, i) => {
                         const id = `${idx}-${i}--${item}`;
                         return (
                          <li key={i} className={`flex items-start gap-3 group cursor-pointer p-2 rounded-lg transition-all ${checkedItems[id] ? 'bg-emerald-50' : 'hover:bg-stone-50'}`} onClick={() => toggleItem(id)}>
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0
                              ${checkedItems[id] ? 'bg-emerald-500 border-emerald-500 scale-110' : 'bg-white border-stone-300'}`}>
                              {checkedItems[id] && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm leading-tight transition-all font-medium ${checkedItems[id] ? 'text-emerald-800 font-bold' : 'text-stone-700'}`}>
                              {item}
                            </span>
                          </li>
                         );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Smart Action Buttons */}
            {!isGuest && checkedCount > 0 && (
                <div className="p-4 bg-stone-50 border-t border-stone-100 animate-slide-in-up space-y-2">
                    <button 
                        onClick={handleSaveListClick}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <span>💾</span> {t('save_list')}
                    </button>

                    <button 
                        onClick={handleRecalculateClick}
                        disabled={isRecalculating}
                        className="w-full py-2 bg-stone-800 text-white rounded-lg font-bold shadow-lg hover:bg-stone-900 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        {isRecalculating ? (
                            <span className="animate-spin">⌛</span>
                        ) : (
                            <>
                                <span>🍳</span> {t('recalc_plan')}
                            </>
                        )}
                    </button>
                </div>
            )}
          </div>
        </section>

        {/* Recipes Section */}
        <section className="lg:col-span-8 space-y-8 relative">
           {isGuest && (
             <div className="absolute inset-0 bg-white/20 z-20 flex items-center justify-center pointer-events-none"></div>
           )}

          <div>
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🔥</span>
                <h3 className="text-xl font-bold text-stone-800">{t('recipes_title')}</h3>
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded ml-auto">{t('recipes_subtitle')}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.recipes.map((recipe, idx) => renderRecipeCard(recipe, idx))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};