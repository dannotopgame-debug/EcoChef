import React, { useState, useEffect } from 'react';
import { GeneratePlanParams } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { playSoftClick } from '../utils/sound';

interface InputSectionProps {
  onGenerate: (params: GeneratePlanParams) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const { t, language } = useLanguage();
  
  const [ingredients, setIngredients] = useState(() => {
    return localStorage.getItem('ecoChef_ingredients') || '';
  });
  
  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('ecoChef_days');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [dietary, setDietary] = useState(() => {
    return localStorage.getItem('ecoChef_dietary') || '';
  });

  useEffect(() => {
    localStorage.setItem('ecoChef_ingredients', ingredients);
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('ecoChef_days', days.toString());
  }, [days]);

  useEffect(() => {
    localStorage.setItem('ecoChef_dietary', dietary);
  }, [dietary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ ingredients, days, dietaryRestrictions: dietary, language });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-3xl mx-auto border border-stone-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-stone-800">{t('input_title')}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">
            {t('input_label')}
          </label>
          <textarea
            required
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={t('input_placeholder')}
            className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:ring-0 outline-none transition-all h-32 resize-none bg-stone-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">
              {t('days_label')}
            </label>
            <select 
              value={days}
              onChange={(e) => { playSoftClick(); setDays(Number(e.target.value)); }}
              className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 outline-none bg-stone-50"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">
              {t('dietary_label')}
            </label>
            <input
              type="text"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 outline-none bg-stone-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !ingredients.trim()}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg
            ${isLoading || !ingredients.trim() 
              ? 'bg-stone-300 cursor-not-allowed shadow-none' 
              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200'}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('btn_generating')}
            </span>
          ) : t('btn_generate')}
        </button>
      </form>
    </div>
  );
};