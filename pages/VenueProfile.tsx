
import React from 'react';
import { AppView } from '../types';

interface VenueProfileProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

const VenueProfile: React.FC<VenueProfileProps> = ({ navigate, logout }) => {
  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden pb-safe text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <button onClick={() => navigate(AppView.VENUE_DASHBOARD)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Venue Profile</p>
        </div>
        <button onClick={logout} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-red-500 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="h-48 w-full bg-slate-900 relative">
          <img src="https://picsum.photos/seed/venue_profile/800/400" className="w-full h-full object-cover opacity-60" alt="Venue" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
          <div className="absolute -bottom-6 left-6">
            <div className="size-24 bg-surface-dark border-4 border-background-dark rounded-[2rem] flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined text-primary text-4xl">nightlife</span>
            </div>
          </div>
        </div>

        <div className="px-6 pt-10 space-y-2">
          <h1 className="text-3xl font-black tracking-tighter">Blue Note NYC</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">location_on</span>
            131 W 3rd St, New York, NY 10012
          </p>
        </div>

        <div className="px-6 py-8 grid grid-cols-2 gap-4">
          <div className="bg-surface-dark border border-white/5 rounded-3xl p-5 flex items-center gap-4">
             <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
               <span className="material-symbols-outlined text-xl">groups</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacity</p>
                <p className="text-base font-black">250 Cap</p>
             </div>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-3xl p-5 flex items-center gap-4">
             <div className="size-10 bg-accent-cyan/10 text-accent-cyan rounded-xl flex items-center justify-center">
               <span className="material-symbols-outlined text-xl">confirmation_number</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gigs Hosted</p>
                <p className="text-base font-black">1,402</p>
             </div>
          </div>
        </div>

        <div className="px-6 space-y-8">
          <section className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-1">About the Space</h3>
             <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-6">
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  The Blue Note is New York's premier jazz club, offering nightly performances by world-class artists. Known for its intimate atmosphere and superior acoustics.
                </p>
             </div>
          </section>
        </div>

        <div className="h-24"></div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-8 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => navigate(AppView.VENUE_DASHBOARD)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">calendar_month</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Schedule</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_ROSTER)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Roster</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-primary active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">account_circle</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default VenueProfile;
