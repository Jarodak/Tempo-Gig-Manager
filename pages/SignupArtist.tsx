
import React, { useState } from 'react';
import { AppView } from '../types';
import { signUp } from '../services/auth';
import { analyticsApi } from '../utils/api';

interface SignupProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (email: string, name: string) => void;
}

const SignupArtist: React.FC<SignupProps> = ({ navigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: { email?: string; password?: string; confirm?: string; name?: string } = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    
    if (confirm !== password) e.confirm = "Passwords do not match";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      await analyticsApi.track('signup_started', { method: 'email', role: 'artist' });
      
      const result = await signUp({ email, role: 'artist' });
      
      if (result.error) {
        setErrors({ email: result.error });
        setIsSubmitting(false);
        return;
      }
      
      await analyticsApi.track('signup_completed', { method: 'email', role: 'artist' });
      onAuthSuccess(email, name);
    } catch (err) {
      setErrors({ email: 'Signup failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 overflow-hidden text-white">
      <header className="pt-10 flex items-center justify-between">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Artist Account</span>
        <div className="size-11"></div>
      </header>

      <main className="flex-1 flex flex-col justify-center space-y-8 overflow-y-auto hide-scrollbar">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter">Start Touring.</h1>
          <p className="text-slate-500 font-medium">Your global EPK starts here.</p>
        </div>

        {/* Social Login */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quick Sign Up</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              onClick={() => window.location.href = '/.netlify/functions/auth-google?role=artist'}
              className="h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            {/* X (Twitter) */}
            <button
              onClick={() => window.location.href = '/.netlify/functions/auth-twitter?role=artist'}
              className="h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-medium">X</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
            <input 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 font-bold outline-none transition-all ${errors.email ? 'border-red-500/50' : 'border-white/5 focus:border-accent-cyan'}`}
              placeholder="artist@music.com"
            />
            {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 font-bold outline-none transition-all ${errors.password ? 'border-red-500/50' : 'border-white/5 focus:border-accent-cyan'}`}
              placeholder="Min. 8 characters"
            />
            {errors.password && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm Password</label>
            <input 
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); if(errors.confirm) setErrors({...errors, confirm: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 font-bold outline-none transition-all ${errors.confirm ? 'border-red-500/50' : 'border-white/5 focus:border-accent-cyan'}`}
              placeholder="Repeat password"
            />
            {errors.confirm && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.confirm}</p>}
          </div>
        </div>

        <button 
          onClick={handleSignup}
          disabled={isSubmitting}
          className="w-full h-18 bg-accent-cyan text-black font-black text-xl rounded-[1.75rem] shadow-2xl shadow-accent-cyan/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {isSubmitting ? 'Creating...' : 'Join the Scene'}
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </main>

      <div className="pb-10 text-center">
        <button onClick={() => navigate(AppView.LOGIN)} className="text-slate-500 font-bold text-xs">Already have an account? <span className="text-white">Log in</span></button>
      </div>
    </div>
  );
};

export default SignupArtist;
