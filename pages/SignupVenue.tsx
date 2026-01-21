import React, { useState } from 'react';
import { AppView } from '../types';
import { signUp } from '../services/auth';
import { analyticsApi } from '../utils/api';

interface SignupVenueProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (email: string, name: string) => void;
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const INSTRUMENT_OPTIONS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano', 'Saxophone', 
  'Trumpet', 'Violin', 'Cello', 'Flute', 'DJ Equipment'
];

const SignupVenue: React.FC<SignupVenueProps> = ({ navigate, onAuthSuccess }) => {
  const [venueName, setVenueName] = useState('');
  const [name, setName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [errors, setErrors] = useState<{ venueName?: string; name?: string; genres?: string; instruments?: string; emailOrPhone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'google' | 'apple' | 'facebook' | 'x' | null>(null);

  const validate = () => {
    const e: any = {};
    if (!venueName.trim()) e.venueName = "Venue name is required";
    if (!name.trim()) e.name = "Your name is required";
    if (genres.length === 0) e.genres = "At least one genre is required";
    if (instruments.length === 0) e.instruments = "At least one instrument is required";
    if (!emailOrPhone.trim()) e.emailOrPhone = "Email or phone is required";
    else if (emailOrPhone.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)) {
      e.emailOrPhone = "Invalid email format";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSocialSignup = (provider: 'google' | 'apple' | 'facebook' | 'x') => {
    setSocialProvider(provider);
    
    // Map provider to OAuth endpoint
    const providerMap: Record<string, string> = {
      google: '/.netlify/functions/auth-google',
      facebook: '/.netlify/functions/auth-facebook',
      apple: '/.netlify/functions/auth-apple',
      x: '/.netlify/functions/auth-twitter',
    };
    
    // Redirect to OAuth provider with role
    const authUrl = `${providerMap[provider]}?role=venue`;
    window.location.href = authUrl;
  };

  const handleEmailSignup = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      await analyticsApi.track('signup_started', { method: 'email', role: 'venue' });
      
      const isEmail = emailOrPhone.includes('@');
      const result = await signUp({
        email: isEmail ? emailOrPhone : undefined,
        phone: !isEmail ? emailOrPhone : undefined,
        role: 'venue',
      });
      
      if (result.error) {
        setErrors({ emailOrPhone: result.error });
        setIsSubmitting(false);
        return;
      }
      
      await analyticsApi.track('signup_completed', { method: 'email', role: 'venue' });
      onAuthSuccess(emailOrPhone, name);
    } catch (err) {
      setErrors({ emailOrPhone: 'Signup failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleInstrument = (instrument: string) => {
    setInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 overflow-hidden text-white">
      <header className="pt-10 flex items-center justify-between">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-white text-lg font-black flex-1 text-center tracking-tight">Venue Sign Up</h1>
        <div className="w-11"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-8 space-y-8 hide-scrollbar">
        {/* Social Login */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quick Sign Up</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              onClick={() => handleSocialSignup('google')}
              disabled={isSubmitting}
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
            {/* Apple */}
            <button
              onClick={() => handleSocialSignup('apple')}
              disabled={isSubmitting}
              className="h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-sm font-medium">Apple</span>
            </button>
            {/* Facebook */}
            <button
              onClick={() => handleSocialSignup('facebook')}
              disabled={isSubmitting}
              className="h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
            {/* X (Twitter) */}
            <button
              onClick={() => handleSocialSignup('x')}
              disabled={isSubmitting}
              className="h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-medium">X</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Email/Phone Signup */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Venue Name</label>
              <input 
                value={venueName}
                onChange={(e) => {
                  setVenueName(e.target.value);
                  if (errors.venueName) setErrors({ ...errors, venueName: undefined });
                }}
                className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white placeholder:text-slate-600" 
                placeholder="The Blue Note" 
              />
              {errors.venueName && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.venueName}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Your Name</label>
              <input 
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white placeholder:text-slate-600" 
                placeholder="John Doe" 
              />
              {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Genre (Multi-select)</label>
              <div className="relative">
                <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
                  {GENRE_OPTIONS.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        genres.includes(genre)
                          ? 'bg-primary text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              {errors.genres && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.genres}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Instruments Needed (Multi-select)</label>
              <div className="relative">
                <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
                  {INSTRUMENT_OPTIONS.map(instrument => (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() => toggleInstrument(instrument)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        instruments.includes(instrument)
                          ? 'bg-accent-cyan text-black'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
              </div>
              {errors.instruments && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.instruments}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email or Phone</label>
              <input 
                value={emailOrPhone}
                onChange={(e) => {
                  setEmailOrPhone(e.target.value);
                  if (errors.emailOrPhone) setErrors({ ...errors, emailOrPhone: undefined });
                }}
                className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white placeholder:text-slate-600" 
                placeholder="venue@example.com or (555) 123-4567" 
              />
              {errors.emailOrPhone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.emailOrPhone}</p>}
            </div>
          </div>

          <button 
            onClick={handleEmailSignup}
            disabled={isSubmitting}
            className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
              isSubmitting ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Continue with Email'}
            {!isSubmitting && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
          </button>
        </div>
      </main>

      <div className="pb-10 text-center">
        <button onClick={() => navigate(AppView.LOGIN)} className="text-slate-500 font-bold text-xs">Already have an account? <span className="text-white">Log in</span></button>
      </div>
    </div>
  );
};

export default SignupVenue;
