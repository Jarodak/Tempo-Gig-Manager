import React, { useState } from 'react';
import { AppView } from '../types';
import { signUp } from '../services/auth';
import { analyticsApi, artistsApi } from '../utils/api';

interface SignupProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (email: string, name: string) => void;
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const INSTRUMENT_OPTIONS = [
  'Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Saxophone', 
  'Trumpet', 'Violin', 'Cello', 'DJ Equipment', 'Percussion'
];

const SignupArtist: React.FC<SignupProps> = ({ navigate, onAuthSuccess }) => {
  // Account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Artist profile fields
  const [name, setName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [cityOfOrigin, setCityOfOrigin] = useState('');
  const [bio, setBio] = useState('');
  const [openToWork, setOpenToWork] = useState(true);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!name.trim()) e.name = "Stage name is required";
    if (genres.length === 0) e.genres = "Select at least one genre";
    if (instruments.length === 0) e.instruments = "Select at least one instrument";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSocialSignup = (provider: 'google' | 'x') => {
    const providerMap: Record<string, string> = {
      google: '/.netlify/functions/auth-google',
      x: '/.netlify/functions/auth-twitter',
    };
    window.location.href = `${providerMap[provider]}?role=artist`;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      await analyticsApi.track('signup_started', { method: 'email', role: 'artist' });
      
      // Create user account
      const result = await signUp({ email, role: 'artist' });
      
      if (result.error) {
        setErrors({ email: result.error });
        setIsSubmitting(false);
        return;
      }
      
      // Create artist profile with all collected data
      await artistsApi.create({
        name: name,
        genre: genres,
        instruments: instruments,
        city_of_origin: cityOfOrigin,
        bio: bio,
        open_to_work: openToWork,
        email_or_phone: email,
        user_id: result.user.id,
      });
      
      await analyticsApi.track('signup_completed', { method: 'email', role: 'artist' });
      onAuthSuccess(email, name);
    } catch (err) {
      setErrors({ email: 'Signup failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const toggleInstrument = (item: string) => {
    setInstruments(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark text-white">
      <header className="sticky top-0 z-10 bg-background-dark/90 backdrop-blur-xl px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-black">Create Your Profile</h1>
        <div className="w-11"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 hide-scrollbar">
        {/* Hero */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Start Touring.</h2>
          <p className="text-slate-500 text-sm">Your global EPK starts here.</p>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quick Sign Up</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSocialSignup('google')} className="h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button onClick={() => handleSocialSignup('x')} className="h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span className="text-sm font-medium">X</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-slate-500 text-xs font-medium">OR COMPLETE PROFILE</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Account Info */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Account</p>
          <div>
            <label className="text-xs text-slate-400 ml-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-accent-cyan" placeholder="artist@music.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-400 ml-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-accent-cyan" placeholder="Min. 8 characters" />
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>
        </div>

        {/* Artist Info */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Artist Details</p>
          
          <div>
            <label className="text-xs text-slate-400 ml-1">Stage Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-accent-cyan" placeholder="Your stage name" />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs text-slate-400 ml-1">City / Location</label>
            <input value={cityOfOrigin} onChange={(e) => setCityOfOrigin(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-accent-cyan" placeholder="Austin, TX" />
          </div>
        </div>

        {/* Genres */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Your Genres</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map(genre => (
              <button key={genre} type="button" onClick={() => toggleGenre(genre)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${genres.includes(genre) ? 'bg-accent-cyan text-black' : 'bg-surface-dark text-slate-400 border border-white/10'}`}>
                {genre}
              </button>
            ))}
          </div>
          {errors.genres && <p className="text-red-500 text-xs">{errors.genres}</p>}
        </div>

        {/* Instruments */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Instruments You Play</p>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENT_OPTIONS.map(item => (
              <button key={item} type="button" onClick={() => toggleInstrument(item)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${instruments.includes(item) ? 'bg-primary text-white' : 'bg-surface-dark text-slate-400 border border-white/10'}`}>
                {item}
              </button>
            ))}
          </div>
          {errors.instruments && <p className="text-red-500 text-xs">{errors.instruments}</p>}
        </div>

        {/* Open to Work */}
        <div className="flex items-center justify-between bg-surface-dark border border-white/10 rounded-xl p-4">
          <div>
            <p className="font-bold">Open to Work</p>
            <p className="text-xs text-slate-500">Show venues you're available for gigs</p>
          </div>
          <button onClick={() => setOpenToWork(!openToWork)} className={`w-14 h-8 rounded-full transition-all ${openToWork ? 'bg-accent-cyan' : 'bg-slate-700'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${openToWork ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs text-slate-400 ml-1">Bio (Optional)</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full h-24 bg-surface-dark border border-white/10 rounded-xl p-4 font-medium outline-none focus:border-accent-cyan resize-none" placeholder="Tell venues about yourself..." />
        </div>

        {/* Submit */}
        <button onClick={handleSignup} disabled={isSubmitting} className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl transition-all ${isSubmitting ? 'bg-slate-800 text-slate-600' : 'bg-accent-cyan text-black shadow-accent-cyan/30 active:scale-[0.98]'}`}>
          {isSubmitting ? 'Creating Your Profile...' : 'Join the Scene'}
          {!isSubmitting && <span className="material-symbols-outlined">bolt</span>}
        </button>

        <p className="text-center text-slate-500 text-sm">
          Already have an account? <button onClick={() => navigate(AppView.LOGIN)} className="text-accent-cyan font-bold">Log in</button>
        </p>
      </main>
    </div>
  );
};

export default SignupArtist;
