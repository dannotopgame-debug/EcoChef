import React, { useState } from 'react';
import { SavedRecipe } from '../types';
import { RecipeModal } from './RecipeModal';
import { useLanguage } from '../contexts/LanguageContext';
import { playSoftClick } from '../utils/sound';

interface SavedRecipesViewProps {
  recipes: SavedRecipe[];
  onDelete: (recipe: SavedRecipe) => void;
}

export const SavedRecipesView: React.FC<SavedRecipesViewProps> = ({ recipes, onDelete }) => {
  const { t } = useLanguage();
  const [viewingRecipe, setViewingRecipe] = useState<SavedRecipe | null>(null);

  const groupedRecipes = recipes.reduce((acc, recipe) => {
    const date = new Date(recipe.savedAt);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekLabel = `${monday.toLocaleDateString()}`;
    
    if (!acc[weekLabel]) {
      acc[weekLabel] = [];
    }
    acc[weekLabel].push(recipe);
    return acc;
  }, {} as Record<string, SavedRecipe[]>);

  const sortedWeeks = Object.keys(groupedRecipes).sort((a, b) => {
     const dateA = new Date(groupedRecipes[a][0].savedAt).getTime();
     const dateB = new Date(groupedRecipes[b][0].savedAt).getTime();
     return dateB - dateA;
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in">
       {viewingRecipe && (
        <RecipeModal 
          recipe={viewingRecipe} 
          onClose={() => setViewingRecipe(null)} 
        />
      )}

      <h2 className="text-3xl font-bold text-stone-800 mb-8 flex items-center gap-3">
        <span>📖</span> {t('saved_recipes_title')}
      </h2>

      {recipes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
          <p className="text-stone-500 text-lg">...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedWeeks.map((week) => (
            <div key={week}>
               <h3 className="text-emerald-700 font-bold text-lg mb-6 border-l-4 border-emerald-500 pl-4 bg-emerald-50 py-2 rounded-r-lg">
                Week: {week}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedRecipes[week].map((recipe, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { playSoftClick(); setViewingRecipe(recipe); }}
                    className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative flex flex-col"
                  >
                    <div 
                      className="absolute top-3 right-3 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                       <button
                          onClick={() => onDelete(recipe)}
                          className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                          X
                      </button>
                    </div>

                    <div className="p-6 flex-grow">
                      <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors pr-8">
                          {recipe.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-4 text-xs text-stone-400">
                        <span>📅 {new Date(recipe.savedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="rounded-lg p-3 bg-stone-50 border border-stone-100">
                        <p className="text-stone-700 text-sm italic line-clamp-3">
                            "{recipe.chefTips}"
                        </p>
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