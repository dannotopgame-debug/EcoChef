import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { PlanDisplay } from './components/PlanDisplay';
import { ShoppingHistory } from './components/ShoppingHistory';
import { SavedRecipesView } from './components/SavedRecipesView';
import { generateEcoChefPlan } from './services/geminiService';
import { EcoChefResponse, GeneratePlanParams, Recipe, SavedRecipe, ShoppingHistoryItem, ShoppingCategory } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { useLanguage } from './contexts/LanguageContext';
import { Language } from './services/translations';
import { playSoftClick } from './utils/sound';

type ViewState = 'generator' | 'shopping' | 'recipes';

// Internal App Content Component to use Auth Hook
const EcoChefApp: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('generator');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const [plan, setPlan] = useState<EcoChefResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<GeneratePlanParams | null>(null);
  
  // Persistence State
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [shoppingHistory, setShoppingHistory] = useState<ShoppingHistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecoChefSavedRecipes');
      if (saved) setSavedRecipes(JSON.parse(saved));

      const history = localStorage.getItem('ecoChefShoppingHistory');
      if (history) setShoppingHistory(JSON.parse(history));
    } catch (e) {
      console.error("Error loading local storage", e);
    }
  }, []);

  const changeView = (view: ViewState) => {
    playSoftClick();
    setCurrentView(view);
  };

  const handleToggleSaveRecipe = (recipe: Recipe) => {
    playSoftClick();
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    setSavedRecipes(prev => {
      const exists = prev.some(r => r.title === recipe.title);
      let newRecipes;
      if (exists) {
        newRecipes = prev.filter(r => r.title !== recipe.title);
      } else {
        const newSavedRecipe: SavedRecipe = { ...recipe, savedAt: new Date().toISOString() };
        newRecipes = [...prev, newSavedRecipe];
      }
      localStorage.setItem('ecoChefSavedRecipes', JSON.stringify(newRecipes));
      return newRecipes;
    });
  };

  const handleSaveToHistory = (selectedCategories: ShoppingCategory[]) => {
    playSoftClick();
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    if (selectedCategories.length === 0) return;
    
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const weekLabel = `Semana del ${monday.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long' })}`;

    const newItem: ShoppingHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      list: selectedCategories,
      checkedItems: [],
      weekLabel: weekLabel
    };

    setShoppingHistory(prev => {
      const newHistory = [newItem, ...prev];
      localStorage.setItem('ecoChefShoppingHistory', JSON.stringify(newHistory));
      return newHistory;
    });
    
    setCurrentView('shopping');
  };

  const handleUpdateHistoryItem = (updatedItem: ShoppingHistoryItem) => {
    setShoppingHistory(prev => {
      const newHistory = prev.map(item => item.id === updatedItem.id ? updatedItem : item);
      localStorage.setItem('ecoChefShoppingHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    playSoftClick();
    setShoppingHistory(prev => {
        const newHistory = prev.filter(item => item.id !== id);
        localStorage.setItem('ecoChefShoppingHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const handleGenerate = async (params: GeneratePlanParams) => {
    playSoftClick();
    setLoading(true);
    setError(null);
    try {
      // Inject current language into params
      const paramsWithLang = { ...params, language: language };
      setLastParams(paramsWithLang);
      const result = await generateEcoChefPlan(paramsWithLang);
      setPlan(result);
    } catch (err) {
      setError("Error connecting to EcoChef. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    playSoftClick();
    setPlan(null);
    setError(null);
    setLastParams(null);
    setCurrentView('generator');
  };

  const handleLanguageChange = (lang: Language) => {
    playSoftClick();
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const languages: {code: Language, label: string, flag: string}[] = [
      { code: 'es', label: 'Español', flag: '🇪🇸' },
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'zh', label: '中文', flag: '🇨🇳' },
      { code: 'pt', label: 'Português', flag: '🇧🇷' }
  ];

  const currentFlag = languages.find(l => l.code === language)?.flag;

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-inter pt-safe">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Navbar */}
      <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50 pt-safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer z-50" onClick={handleReset}>
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-xl tracking-tight">EcoChef</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NavButton active={currentView === 'generator'} onClick={() => changeView('generator')}>{t('nav_planner')}</NavButton>
              <NavButton active={currentView === 'shopping'} onClick={() => {
                  if(!user) { setIsAuthModalOpen(true); return; }
                  changeView('shopping');
              }}>{t('nav_history')}</NavButton>
              <NavButton active={currentView === 'recipes'} onClick={() => {
                   if(!user) { setIsAuthModalOpen(true); return; }
                   changeView('recipes');
              }}>{t('nav_recipes')}</NavButton>
              
              {/* Language Selector */}
              <div className="relative ml-2">
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-full text-sm transition-colors">
                    <span>{currentFlag}</span>
                </button>
                {isLangMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl py-1 text-stone-800 animate-in fade-in slide-in-from-top-2">
                        {languages.map(lang => (
                            <button 
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-100 flex items-center gap-2 ${language === lang.code ? 'font-bold text-emerald-600' : ''}`}
                            >
                                <span>{lang.flag}</span> {lang.label}
                            </button>
                        ))}
                    </div>
                )}
              </div>

              <div className="ml-4 pl-4 border-l border-emerald-500">
                {user ? (
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold border-2 border-emerald-400">
                        {user.photoURL ? <img src={user.photoURL} alt="user" className="w-full h-full rounded-full" /> : user.email?.charAt(0).toUpperCase()}
                      </div>
                      <button onClick={() => { playSoftClick(); logout(); }} className="text-sm text-emerald-100 hover:text-white">{t('nav_logout')}</button>
                   </div>
                ) : (
                    <button onClick={() => { playSoftClick(); setIsAuthModalOpen(true); }} className="bg-white text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-emerald-50 transition-colors">
                        {t('nav_login')}
                    </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-50 gap-3">
              {/* Mobile Language Toggle */}
              <button onClick={() => {
                  const idx = languages.findIndex(l => l.code === language);
                  const nextIdx = (idx + 1) % languages.length;
                  handleLanguageChange(languages[nextIdx].code);
              }} className="text-xl">
                  {currentFlag}
              </button>

              <button 
                onClick={() => { playSoftClick(); setIsMenuOpen(!isMenuOpen); }}
                className="text-emerald-100 hover:text-white focus:outline-none p-2 rounded-md active:bg-emerald-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden absolute w-full bg-emerald-700 shadow-xl transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
           <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
              {user && (
                  <div className="px-4 py-3 border-b border-emerald-600 mb-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold border border-emerald-400 text-white">
                         {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-xs text-emerald-200 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => { playSoftClick(); logout(); }} className="text-xs text-white underline">{t('nav_logout')}</button>
                  </div>
              )}
              <MobileNavButton active={currentView === 'generator'} onClick={() => { changeView('generator'); setIsMenuOpen(false); }}>{t('nav_planner')}</MobileNavButton>
              <MobileNavButton active={currentView === 'shopping'} onClick={() => { 
                  if(!user) { setIsAuthModalOpen(true); setIsMenuOpen(false); return; }
                  changeView('shopping'); setIsMenuOpen(false); 
              }}>{t('nav_history')}</MobileNavButton>
              <MobileNavButton active={currentView === 'recipes'} onClick={() => { 
                   if(!user) { setIsAuthModalOpen(true); setIsMenuOpen(false); return; }
                   changeView('recipes'); setIsMenuOpen(false); 
              }}>{t('nav_recipes')}</MobileNavButton>
              
              {!user && (
                  <button onClick={() => { playSoftClick(); setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-emerald-100 hover:text-white">
                      {t('nav_login')}
                  </button>
              )}
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {currentView === 'generator' && (
            <>
                {!plan ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-widest mb-2">
                            Zero Waste System
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 tracking-tight">
                            {t('hero_title_1')} <br/>
                            <span className="text-emerald-600">{t('hero_title_2')}</span>
                        </h1>
                        <p className="text-lg text-stone-600">
                            {t('hero_desc')}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                        <button 
                            onClick={() => {
                                if(!user) { playSoftClick(); setIsAuthModalOpen(true); return; }
                                changeView('shopping');
                            }}
                            className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex items-center gap-3 group active:scale-95"
                        >
                            <span className="bg-amber-100 text-amber-700 p-2 rounded-lg group-hover:scale-110 transition-transform">🛒</span>
                            <div>
                                <span className="font-bold text-stone-800 block text-sm">{t('nav_history')}</span>
                            </div>
                        </button>
                        <button 
                             onClick={() => {
                                if(!user) { playSoftClick(); setIsAuthModalOpen(true); return; }
                                changeView('recipes');
                            }}
                             className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex items-center gap-3 group active:scale-95"
                        >
                            <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg group-hover:scale-110 transition-transform">📖</span>
                            <div>
                                <span className="font-bold text-stone-800 block text-sm">{t('nav_recipes')}</span>
                            </div>
                        </button>
                    </div>
                    
                    <InputSection onGenerate={handleGenerate} isLoading={loading} />

                </div>
                ) : (
                <PlanDisplay 
                    data={plan} 
                    lastParams={lastParams}
                    onRecalculate={handleGenerate}
                    onReset={handleReset} 
                    savedRecipes={savedRecipes}
                    onToggleSave={handleToggleSaveRecipe}
                    onSaveToHistory={handleSaveToHistory}
                    isGuest={!user}
                    onRegister={() => { playSoftClick(); setIsAuthModalOpen(true); }}
                />
                )}
            </>
        )}

        {currentView === 'shopping' && (
            <ShoppingHistory 
                history={shoppingHistory} 
                onDelete={handleDeleteHistoryItem}
                onUpdate={handleUpdateHistoryItem}
            />
        )}

        {currentView === 'recipes' && (
            <SavedRecipesView 
                recipes={savedRecipes} 
                onDelete={handleToggleSaveRecipe} 
            />
        )}

        {error && (
          <div className="fixed bottom-6 right-6 bg-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg max-w-md animate-bounce z-[60]">
            <strong className="block font-bold mb-1">¡Ups!</strong>
            {error}
          </div>
        )}
      </main>
      
      <style>{`
        .pt-safe-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </div>
  );
};

// Root Component wrapped in AuthProvider
const App: React.FC = () => {
    return (
        <AuthProvider>
            <EcoChefApp />
        </AuthProvider>
    );
}

// Helper Components for Nav
const NavButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({active, onClick, children}) => (
    <button 
        onClick={onClick}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-emerald-700 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-500 hover:text-white'}`}
    >
        {children}
    </button>
);

const MobileNavButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({active, onClick, children}) => (
    <button 
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${active ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-600 hover:text-white'}`}
    >
        {children}
    </button>
);

export default App;