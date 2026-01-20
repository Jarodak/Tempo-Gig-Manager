
import React, { useEffect, useMemo, useState } from 'react';
import { AppView, Gig } from '../types';
import { getGigs } from '../apiClient';

interface GigFinderProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

const GigFinder: React.FC<GigFinderProps> = ({ navigate, logout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);

  useEffect(() => {
    let cancelled = false;
    getGigs()
      .then((data) => {
        if (!cancelled) setGigs(data);
      })
      .catch(() => {
        if (!cancelled) setGigs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGigs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return gigs;
    return gigs.filter((g) =>
      [g.title, g.venue, g.location, g.genre].some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [gigs, searchQuery]);

  return (
    <div className="flex-1 pb-safe overflow-y-auto hide-scrollbar text-white">
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-2xl border-b border-white/5 pt-10 px-5 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent-cyan rounded-[14px] size-11 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl fill-1">graphic_eq</span>
            </div>
            <div>
              <h2 className="text-white text-2xl font-black tracking-tighter leading-none">Marketplace</h2>
              <p className="text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gigs for you</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center justify-center rounded-2xl size-11 bg-surface-dark text-slate-500 active:scale-90">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
        
        <div className="relative flex items-center rounded-2xl bg-surface-dark px-5 h-14 border border-white/5 shadow-inner transition-all focus-within:border-primary/50 group">
          <span className="material-symbols-outlined text-slate-500 text-[22px] mr-3 group-focus-within:text-primary transition-colors">search</span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-white focus:ring-0 w-full text-base font-bold placeholder:text-slate-600 pr-4" 
            placeholder="Search city, venue or genre..." 
          />
        </div>
      </header>

      <main className="py-6 space-y-8">
        <div className="px-5 space-y-4">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-cyan">Your Invites</h3>
           <div className="bg-accent-cyan/10 border-2 border-accent-cyan/20 rounded-[2rem] p-6 flex items-center gap-5 cursor-pointer" onClick={() => navigate(AppView.AGREEMENT)}>
              <div className="size-14 bg-accent-cyan text-black rounded-2xl flex items-center justify-center shadow-xl shadow-accent-cyan/20">
                 <span className="material-symbols-outlined text-3xl">mail</span>
              </div>
              <div className="flex-1 text-white">
                 <h4 className="font-black text-lg leading-tight">Moxy Chelsea NYC</h4>
                 <p className="text-accent-cyan text-xs font-bold uppercase mt-1">Invited: Jazz Night</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
           </div>
        </div>

        <div className="px-5 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Public Listings</h3>
          {filteredGigs.map((gig) => (
            <div key={gig.id} className="rounded-[2.5rem] overflow-hidden bg-surface-dark border border-white/5 active:scale-[0.98] transition-all">
              <div className="relative aspect-[4/3] bg-center bg-cover" style={{ backgroundImage: `url(${gig.image || 'https://picsum.photos/seed/gig_fallback/800/600'})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-3xl font-black tracking-tighter">{gig.title}</h3>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {gig.location}
                    </p>
                </div>
              </div>
              <div className="p-6">
                <button 
                  className="w-full bg-primary text-white text-lg font-black h-16 rounded-[1.5rem] shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                  onClick={() => navigate(AppView.AGREEMENT)}
                >
                  Quick Apply <span className="material-symbols-outlined">bolt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-10 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">explore</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Feed</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_ROSTER)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Roster</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">confirmation_number</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Gigs</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_PROFILE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">person</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default GigFinder;
