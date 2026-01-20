
import React, { useState } from 'react';
import { AppView, UserRole } from '../types';

interface LoginProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (role: UserRole) => void;
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

  const handleLogin = (role: UserRole) => {
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess(role);
      }, 1000);
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
      </main>

      <div className="pb-10 text-center">
        <button onClick={() => navigate(AppView.SIGNUP_VENUE)} className="text-slate-500 font-bold text-xs hover:text-white transition-colors">Don't have an account? <span className="text-primary font-black">Sign up</span></button>
      </div>
    </div>
  );
};

export default Login;
