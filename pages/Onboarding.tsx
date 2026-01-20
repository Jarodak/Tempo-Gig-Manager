
import React, { useState, useMemo } from 'react';
import { AppView } from '../types';

interface OnboardingProps {
  navigate: (view: AppView) => void;
  logout: () => void;
  isInvited?: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ navigate, logout, isInvited = false }) => {
  // Form State
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('Indie');
  const [bio, setBio] = useState('');
  const [type, setType] = useState('Band');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; bio?: string }>({});

  const validate = () => {
    const e: { name?: string; bio?: string } = {};
    if (!name.trim()) e.name = "Artist name is required";
    if (!bio.trim()) e.bio = "Booking bio is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const profileStrength = useMemo(() => {
    let score = 0;
    if (name) score += 25;
    if (bio) score += 25;
    if (equipment.length > 0) score += 25;
    if (genre) score += 25;
    return score;
  }, [name, bio, equipment, genre]);

  const toggleEquipment = (item: string) => {
    setEquipment(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleNext = () => {
    if (validate()) {
      navigate(isInvited ? AppView.AGREEMENT : AppView.ARTIST_FEED);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={logout} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Artist Registry</p>
        </div>
        <div className="size-11"></div>
      </header>

      <main className="px-6 py-8 flex-1 overflow-y-auto hide-scrollbar space-y-10 pb-40">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Strength</span>
            <span className="text-[10px] font-black text-primary">{profileStrength}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-700" style={{ width: `${profileStrength}%` }}></div>
          </div>
        </div>

        {isInvited && (
          <div className="bg-accent-cyan/10 border-2 border-accent-cyan/20 rounded-[2.5rem] p-6 space-y-4 animate-in zoom-in duration-500">
             <div className="flex items-center gap-4">
               <div className="size-14 bg-accent-cyan text-black rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl">local_activity</span>
               </div>
               <div>
                  <h3 className="text-white font-black text-lg">You're Invited!</h3>
                  <p className="text-accent-cyan text-[10px] font-black uppercase tracking-widest mt-0.5">Jazz Night @ The Blue Note</p>
               </div>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed font-medium">
               A venue has scouted you! Create your profile to review the performance contract and secure your spot.
             </p>
          </div>
        )}

        <div className="text-center space-y-4 pt-4">
          <div className="relative inline-block">
             <div className="size-28 bg-gradient-to-tr from-primary to-accent-cyan rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary/30">
                <span className="material-symbols-outlined text-white text-6xl fill-1">person</span>
             </div>
             <button className="absolute -bottom-1 -right-1 size-11 bg-white text-black rounded-full border-4 border-background-dark flex items-center justify-center active:scale-110 transition-transform shadow-xl">
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
             </button>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">Your Identity</h1>
            <p className="text-slate-500 font-medium">Setup your EPK in seconds.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Stage / Band Name</label>
            <input 
              value={name}
              onChange={(e) => { setName(e.target.value); if(errors.name) setErrors({...errors, name: undefined}); }}
              className={`w-full h-18 bg-surface-dark border-2 rounded-[1.5rem] px-6 text-xl font-black focus:border-primary transition-all outline-none ${errors.name ? 'border-red-500/50' : 'border-white/5'}`} 
              placeholder="The Midnight Echoes" 
            />
            {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.name}</p>}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Performance Type</label>
            <div className="flex p-1 bg-surface-dark rounded-2xl border border-white/5">
              {['Solo', 'Duo', 'Band'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === t ? 'bg-background-dark text-white shadow-lg' : 'text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Primary Genre</label>
            <div className="grid grid-cols-3 gap-2">
              {['Rock', 'Jazz', 'Indie', 'EDM', 'Soul', 'Hip Hop'].map((g) => (
                <button 
                  key={g} 
                  onClick={() => setGenre(g)}
                  className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all active:scale-90 uppercase tracking-widest ${genre === g ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-slate-500'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Booking Bio</label>
             <textarea 
               value={bio}
               onChange={(e) => { setBio(e.target.value); if(errors.bio) setErrors({...errors, bio: undefined}); }}
               className={`w-full bg-surface-dark border-2 rounded-[1.5rem] p-6 text-base font-bold focus:border-primary outline-none h-32 resize-none ${errors.bio ? 'border-red-500/50' : 'border-white/5'}`} 
               placeholder="Experience, recent venues..."
             ></textarea>
             {errors.bio && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.bio}</p>}
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Equipment Rider</label>
             <div className="grid grid-cols-2 gap-3">
                {['Full PA System', 'Floor Monitors', 'Drum Kit', 'Amps Provided', 'Sound Engineer'].map((item) => (
                  <button 
                    key={item}
                    onClick={() => toggleEquipment(item)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${equipment.includes(item) ? 'bg-accent-cyan/10 border-accent-cyan text-white' : 'bg-surface-dark border-white/5 text-slate-500'}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {equipment.includes(item) ? 'check_circle' : 'circle'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{item}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-background-dark/90 backdrop-blur-xl border-t border-white/5">
        <button 
          className="w-full bg-primary h-18 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-[0.97] transition-all"
          onClick={handleNext}
        >
          {isInvited ? 'Review Invite' : 'Create Profile'}
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default Onboarding;
