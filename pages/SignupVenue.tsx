
import React, { useState } from 'react';
import { AppView } from '../types';

interface SignupProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: () => void;
}

const SignupVenue: React.FC<SignupProps> = ({ navigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: { email?: string; password?: string; confirm?: string } = {};
    if (!email.trim()) e.email = "Business email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    
    if (confirm !== password) e.confirm = "Passwords do not match";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = () => {
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess();
      }, 1200);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 overflow-hidden text-white">
      <header className="pt-10 flex items-center justify-between">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Venue Account</span>
        <div className="size-11"></div>
      </header>

      <main className="flex-1 flex flex-col justify-center space-y-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter">Register Venue.</h1>
          <p className="text-slate-500 font-medium">Streamline your booking workflow.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Work Email</label>
            <input 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 font-bold outline-none transition-all ${errors.email ? 'border-red-500/50' : 'border-white/5 focus:border-primary'}`}
              placeholder="booking@venue.com"
            />
            {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: undefined}); }}
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 font-bold outline-none transition-all ${errors.password ? 'border-red-500/50' : 'border-white/5 focus:border-primary'}`}
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
              className={`w-full h-16 bg-surface-dark border-2 rounded-2xl px-6 font-bold outline-none transition-all ${errors.confirm ? 'border-red-500/50' : 'border-white/5 focus:border-primary'}`}
              placeholder="Repeat password"
            />
            {errors.confirm && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.confirm}</p>}
          </div>
        </div>

        <button 
          onClick={handleSignup}
          disabled={isSubmitting}
          className="w-full h-18 bg-primary text-white font-black text-xl rounded-[1.75rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {isSubmitting ? 'Creating...' : 'Create Account'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </main>

      <div className="pb-10 text-center">
        <button onClick={() => navigate(AppView.LOGIN)} className="text-slate-500 font-bold text-xs">Already registered? <span className="text-white">Log in</span></button>
      </div>
    </div>
  );
};

export default SignupVenue;
