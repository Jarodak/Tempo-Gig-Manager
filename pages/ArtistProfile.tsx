
import React from 'react';
import { AppView } from '../types';

interface ArtistProfileProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

const ArtistProfile: React.FC<ArtistProfileProps> = ({ navigate, logout }) => {
  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden pb-safe text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <button onClick={() => navigate(AppView.ARTIST_FEED)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Artist Profile</p>
        </div>
        <button onClick={logout} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-red-500 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="p-6 text-center space-y-6">
          <div className="relative inline-block">
            <div 
              className="size-32 bg-center bg-cover rounded-[3rem] mx-auto border-4 border-accent-cyan/20 shadow-2xl shadow-accent-cyan/10" 
              style={{ backgroundImage: 'url("https://picsum.photos/seed/artist_profile/400/400")' }}
            ></div>
            <div className="absolute -bottom-2 -right-2 bg-accent-cyan text-black size-10 rounded-2xl flex items-center justify-center shadow-lg border-4 border-background-dark">
              <span className="material-symbols-outlined text-xl fill-1">verified</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">The Midnight Echoes</h1>
            <p className="text-accent-cyan text-sm font-black uppercase tracking-[0.2em]">Indie Rock • 4 Piece Band</p>
          </div>
        </div>

        <div className="px-6 grid grid-cols-3 gap-3">
          <div className="bg-surface-dark p-4 rounded-3xl border border-white/5 text-center space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Rating</p>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <span className="material-symbols-outlined text-sm fill-1">star</span>
              <p className="text-lg font-black text-white">4.9</p>
            </div>
          </div>
          <div className="bg-surface-dark p-4 rounded-3xl border border-white/5 text-center space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Avg Draw</p>
            <p className="text-lg font-black text-white">250+</p>
          </div>
          <div className="bg-surface-dark p-4 rounded-3xl border border-white/5 text-center space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Shows</p>
            <p className="text-lg font-black text-white">42</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-1">About the Artist</h3>
          <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-6">
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Based in Brooklyn, The Midnight Echoes deliver a high-energy blend of modern indie hooks and classic garage rock grit.
            </p>
          </div>
        </div>

        <div className="h-20"></div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-10 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => navigate(AppView.ARTIST_FEED)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">explore</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Feed</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_ROSTER)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Roster</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">confirmation_number</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Gigs</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">person</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ArtistProfile;
