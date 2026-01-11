import React, { useState } from 'react';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../services/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { playSoftClick } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    playSoftClick();
    if (!auth || !googleProvider) {
        setError("Firebase config missing");
        return;
    }

    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Error with Google Login.");
    }
  };

  const handleAppleLogin = async () => {
    playSoftClick();
    if (!auth || !appleProvider) return;

    try {
      setError(null);
      await signInWithPopup(auth, appleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Error with Apple Login.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    playSoftClick();
    if (!auth) return;

    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Auth Error: " + err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🥑</span>
            <h2 className="text-2xl font-bold text-stone-800">
              {isLogin ? t('auth_welcome') : t('auth_join')}
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 py-2.5 rounded-xl transition-all font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t('btn_google')}
            </button>
            <button 
              onClick={handleAppleLogin}
              className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-stone-800 py-2.5 rounded-xl transition-all font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 126.7 89.8 126.7 19.6 0 39.7-16.3 65.1-16.3 25.5 0 46.2 16.3 66.6 16.3 25.3 0 58.6-86.3 75.4-126.8 1.2-2.5.2-1.6 2.6-6.3-54.4-16.1-89.4-52.7-89.2-109.5zm-55.5-176c15.6-21.7 43.8-38.9 70.3-41.2-2.6-32.5-35.3-51.2-56-51.4-23.7 0-56.9 18-72.2 42.6-14 22.1-9.5 58.1 12.7 75.8 4.2 3.3 15.3 1.7 17.5 1.5 8.9-10.7 19.3-17.7 27.7-27.3z"/></svg>
              {t('btn_apple')}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-500">{t('btn_email')}</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-0 outline-none text-stone-800 bg-stone-50"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-0 outline-none text-stone-800 bg-stone-50"
                required
                minLength={6}
              />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? '...' : (isLogin ? t('nav_login') : 'Register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { playSoftClick(); setIsLogin(!isLogin); setError(null); }}
              className="text-sm text-stone-500 hover:text-emerald-600 font-medium"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};