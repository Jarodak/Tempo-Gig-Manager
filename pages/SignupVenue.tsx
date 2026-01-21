import React, { useState } from 'react';
import { AppView, VenueType, EsrbRating } from '../types';
import { signUp } from '../services/auth';
import { analyticsApi, venuesApi } from '../utils/api';

interface SignupVenueProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (email: string, name: string) => void;
}

const VENUE_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'dive', label: 'Dive Bar' },
  { value: 'church', label: 'Church' },
];

const ESRB_OPTIONS = [
  { value: 'family', label: 'Family Friendly' },
  { value: '21+', label: '21+' },
  { value: 'nsfw', label: 'NSFW' },
];

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const EQUIPMENT_OPTIONS = [
  'PA System', 'Microphones', 'Drum Kit', 'Piano', 'Lighting System',
  'Stage Monitors', 'DJ Booth', 'Backline', 'Cables', 'Power Distribution'
];

const SignupVenue: React.FC<SignupVenueProps> = ({ navigate, onAuthSuccess }) => {
  // Account fields
  const [email, setEmail] = useState('');
  
  // Venue profile fields
  const [venueName, setVenueName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [venueType, setVenueType] = useState('bar');
  const [esrbRating, setEsrbRating] = useState('family');
  const [genres, setGenres] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState('medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!venueName.trim()) e.venueName = "Venue name is required";
    if (!address.trim()) e.address = "Address is required";
    if (genres.length === 0) e.genres = "Select at least one genre";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSocialSignup = (provider: 'google' | 'x') => {
    const providerMap: Record<string, string> = {
      google: '/.netlify/functions/auth-google',
      x: '/.netlify/functions/auth-twitter',
    };
    window.location.href = `${providerMap[provider]}?role=venue`;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      await analyticsApi.track('signup_started', { method: 'email', role: 'venue' });
      
      // Create user account
      const result = await signUp({ email, role: 'venue' });
      
      if (result.error) {
        setErrors({ email: result.error });
        setIsSubmitting(false);
        return;
      }
      
      // Create venue profile with all collected data
      await venuesApi.create({
        name: venueName,
        email: email,
        phone: phone,
        address: address,
        type: venueType,
        esrb_rating: esrbRating,
        typical_genres: genres,
        stage_details: { size: stageSize, availableOutlets: 4, adaAccessible: true },
        equipment_onsite: equipment,
        special_instructions: specialInstructions,
        user_id: result.user.id,
      });
      
      await analyticsApi.track('signup_completed', { method: 'email', role: 'venue' });
      onAuthSuccess(email, venueName);
    } catch (err) {
      setErrors({ email: 'Signup failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const toggleEquipment = (item: string) => {
    setEquipment(prev => prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark text-white">
      <header className="sticky top-0 z-10 bg-background-dark/90 backdrop-blur-xl px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-black">Create Your Venue</h1>
        <div className="w-11"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 hide-scrollbar">
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
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-primary" placeholder="venue@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>
        </div>

        {/* Venue Info */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Venue Details</p>
          
          <div>
            <label className="text-xs text-slate-400 ml-1">Venue Name</label>
            <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-primary" placeholder="The Blue Note" />
            {errors.venueName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.venueName}</p>}
          </div>

          <div>
            <label className="text-xs text-slate-400 ml-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-primary" placeholder="(555) 123-4567" />
          </div>

          <div>
            <label className="text-xs text-slate-400 ml-1">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-primary" placeholder="123 Main St, City, State" />
            {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 ml-1">Venue Type</label>
              <select value={venueType} onChange={(e) => setVenueType(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-primary">
                {VENUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 ml-1">Age Rating</label>
              <select value={esrbRating} onChange={(e) => setEsrbRating(e.target.value)} className="w-full h-14 bg-surface-dark border border-white/10 rounded-xl px-4 font-medium outline-none focus:border-primary">
                {ESRB_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Typical Genres</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map(genre => (
              <button key={genre} type="button" onClick={() => toggleGenre(genre)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${genres.includes(genre) ? 'bg-primary text-white' : 'bg-surface-dark text-slate-400 border border-white/10'}`}>
                {genre}
              </button>
            ))}
          </div>
          {errors.genres && <p className="text-red-500 text-xs">{errors.genres}</p>}
        </div>

        {/* Equipment */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Equipment On-Site</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(item => (
              <button key={item} type="button" onClick={() => toggleEquipment(item)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${equipment.includes(item) ? 'bg-accent-cyan text-black' : 'bg-surface-dark text-slate-400 border border-white/10'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Stage Size</p>
          <div className="grid grid-cols-3 gap-2">
            {['small', 'medium', 'large'].map(size => (
              <button key={size} type="button" onClick={() => setStageSize(size)} className={`h-12 rounded-xl text-sm font-bold capitalize transition-all ${stageSize === size ? 'bg-primary text-white' : 'bg-surface-dark text-slate-400 border border-white/10'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="text-xs text-slate-400 ml-1">Special Instructions (Optional)</label>
          <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} className="w-full h-24 bg-surface-dark border border-white/10 rounded-xl p-4 font-medium outline-none focus:border-primary resize-none" placeholder="Load-in details, parking info, etc." />
        </div>

        {/* Submit */}
        <button onClick={handleSignup} disabled={isSubmitting} className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl transition-all ${isSubmitting ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white shadow-primary/30 active:scale-[0.98]'}`}>
          {isSubmitting ? 'Creating Your Venue...' : 'Create Venue & Sign Up'}
          {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>

        <p className="text-center text-slate-500 text-sm">
          Already have an account? <button onClick={() => navigate(AppView.LOGIN)} className="text-primary font-bold">Log in</button>
        </p>
      </main>
    </div>
  );
};

export default SignupVenue;
