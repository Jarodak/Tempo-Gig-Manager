
import React from 'react';
import { AppView } from '../types';

interface LandingProps {
  navigate: (view: AppView) => void;
  onInvitedClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ navigate, onInvitedClick }) => {
  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 overflow-hidden text-white">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 text-center py-20">
        <div className="space-y-4 animate-in fade-in zoom-in duration-700">
          <div className="text-primary flex size-24 mx-auto items-center justify-center bg-primary/10 rounded-[2.5rem] mb-6 shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined text-6xl fill-1">music_note</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-tight">Tempo <br/>Gig Manager</h1>
          <p className="text-slate-400 text-lg font-medium max-w-[280px] mx-auto leading-relaxed">
            The professional network for venues and local artists.
          </p>
        </div>

        <div className="w-full space-y-4 max-w-xs mx-auto pt-10">
          <button 
            onClick={() => navigate(AppView.SIGNUP_VENUE)}
            className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            I'm a Venue
            <span className="material-symbols-outlined">meeting_room</span>
          </button>
          
          <button 
            onClick={() => navigate(AppView.SIGNUP_ARTIST)}
            className="w-full h-16 bg-accent-cyan text-black font-black text-lg rounded-2xl shadow-xl shadow-accent-cyan/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            I'm an Artist
            <span className="material-symbols-outlined">mic_external_on</span>
          </button>

          <div className="pt-6">
            <button 
              onClick={() => navigate(AppView.LOGIN)}
              className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
            >
              Already have an account? <span className="text-primary">Log In</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="pb-10 text-center">
        {/* Attribution removed as requested */}
      </div>
    </div>
  );
};

export default Landing;
