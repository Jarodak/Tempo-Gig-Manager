
import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { logIn } from '../services/auth';
import { analyticsApi } from '../utils/api';

interface LoginProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (role: UserRole, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ navigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (role: UserRole) => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      const result = await logIn(email);
      
      if (result.error) {
        setErrors({ email: result.error });
        setIsSubmitting(false);
        return;
      }
      
      await analyticsApi.track('login', { method: 'email', role: result.user.role });
      onAuthSuccess(result.user.role, email);
    } catch (err) {
      setErrors({ email: 'Login failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 overflow-hidden text-white">
      <header className="pt-10 flex items-center">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform shadow-lg border border-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center space-y-12">
        <div className="space-y-3 text-center">
          <h1 className="text-5xl font-extrabold tracking-tighter animate-in fade-in slide-in-from-top-4 duration-500">Welcome back.</h1>
          <p className="text-slate-500 font-medium text-lg animate-in fade-in slide-in-from-top-2 duration-700 delay-150">Log in to manage your gigs.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 text-lg font-bold outline-none transition-all ${errors.email ? 'border-red-500/50 ring-4 ring-red-500/5' : 'border-white/5 focus:border-primary'}`}
              placeholder="name@email.com"
            />
            {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 text-lg font-bold outline-none transition-all ${errors.password ? 'border-red-500/50 ring-4 ring-red-500/5' : 'border-white/5 focus:border-primary'}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.password}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleLogin(UserRole.VENUE)}
            disabled={isSubmitting}
            className="h-16 bg-primary/10 border border-primary/30 text-primary font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg hover:bg-primary/20"
          >
            Venue Login
          </button>
          <button 
            onClick={() => handleLogin(UserRole.ARTIST)}
            disabled={isSubmitting}
            className="h-16 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg hover:bg-accent-cyan/20"
          >
            Artist Login
          </button>
        </div>

        {/* Social Login */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-slate-500 text-xs font-bold uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {/* Google */}
            <button
              onClick={() => window.location.href = '/.netlify/functions/auth-google?role=artist'}
              className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            {/* Apple */}
            <button
              onClick={() => window.location.href = '/.netlify/functions/auth-apple?role=artist'}
              className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
            {/* Facebook */}
            <button
              onClick={() => window.location.href = '/.netlify/functions/auth-facebook?role=artist'}
              className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            {/* X (Twitter) */}
            <button
              onClick={() => window.location.href = '/.netlify/functions/auth-twitter?role=artist'}
              className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
        </div>
      </main>

      <div className="pb-10 text-center">
        <button onClick={() => navigate(AppView.SIGNUP_VENUE)} className="text-slate-500 font-bold text-xs hover:text-white transition-colors">Don't have an account? <span className="text-primary font-black">Sign up</span></button>
      </div>
    </div>
  );
};

export default Login;
