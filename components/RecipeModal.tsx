import React from 'react';
import { Recipe } from '../types';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  isBonus?: boolean;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, isBonus }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex justify-between items-center ${isBonus ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div>
            {isBonus && <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 block">Bonus Track</span>}
            <h3 className={`text-2xl font-bold ${isBonus ? 'text-amber-900' : 'text-emerald-900'}`}>
              {recipe.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Chef's Secret Highlight */}
          <div className={`p-4 rounded-xl border flex gap-4 items-start ${isBonus ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
            <span className="text-2xl">👨‍🍳</span>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide mb-1 opacity-80">El Secreto del Sabor</h4>
              <p className="italic text-lg font-medium">"{recipe.chefTips}"</p>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-6 border-b border-stone-100 pb-2">
              Instrucciones paso a paso
            </h4>
            <div className="space-y-8">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-5 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm
                    ${isBonus ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {idx + 1}
                  </div>
                  <p className="text-stone-700 text-lg leading-relaxed pt-1 group-hover:text-stone-900 transition-colors">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-8 mt-4 border-t border-stone-100 flex justify-center">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              ¡Entendido, a cocinar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};