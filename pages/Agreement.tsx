
import React, { useState } from 'react';
import { AppView } from '../types';
import { getCurrentUser } from '../services/auth';

interface AgreementProps {
  navigate: (view: AppView) => void;
}

const Agreement: React.FC<AgreementProps> = ({ navigate }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const user = getCurrentUser();

  const handleApply = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => navigate(AppView.ARTIST_FEED), 2500);
    }, 1800);
  };

  if (showSuccess) {
    return (
      <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="size-24 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-green-500/30 mb-8 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-4">Application Sent!</h2>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">
          The venue has been notified. You'll hear back within 24-48 hours.
        </p>
        <div className="mt-12 w-12 h-1 bg-primary/20 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-xl border-b border-white/5 p-4 pt-10 flex items-center justify-between">
        <button onClick={() => navigate(AppView.ARTIST_FEED)} className="p-2 active:opacity-50"><span className="material-symbols-outlined">close</span></button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Tempo Performance Agreement</h1>
        <button className="p-2 active:opacity-50"><span className="material-symbols-outlined">download</span></button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10 hide-scrollbar pb-40">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="size-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined text-white text-4xl fill-1">history_edu</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Standard Booking</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Version 2.4 — Oct 2023</p>
          </div>
        </div>

        <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
          <section className="space-y-3">
            <h3 className="text-primary font-black text-[10px] uppercase tracking-widest">1. Performance & Payment</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Performer agrees to provide a musical performance on the date and time specified in the listing. Venue agrees to pay the agreed Base Pay via Tempo Secure Pay within 24h of show completion.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-primary font-black text-[10px] uppercase tracking-widest">2. Cancellation Policy</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Cancellations within 48h of performance require a documented emergency. Venues may incur a 15% booking fee for last-minute cancellations.
            </p>
          </section>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Digital Signature</label>
              <button onClick={() => setIsSigned(false)} className="text-primary text-[10px] font-black uppercase tracking-widest">Clear</button>
            </div>
            
            <div 
              onClick={() => setIsSigned(true)}
              className={`h-48 w-full bg-background-dark/50 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center relative transition-all cursor-pointer ${isSigned ? 'border-primary/50 bg-primary/5' : 'border-white/10'}`}
            >
              {isSigned ? (
                <div className="text-primary text-center animate-in zoom-in duration-300">
                   <p className="font-display text-4xl italic opacity-50 tracking-tighter">{user?.email?.split('@')[0] || 'Your Signature'}</p>
                   <p className="text-[8px] font-black uppercase tracking-widest mt-2">Verified Digital ID: temp_88x2k1</p>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-700 text-6xl">draw</span>
                  <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest">Tap to sign agreement</p>
                </>
              )}
            </div>
            
            <div className="flex items-start gap-4">
              <input 
                type="checkbox" 
                className="mt-1 rounded-md border-white/10 bg-surface-dark text-primary focus:ring-primary size-5" 
                id="agree" 
              />
              <label htmlFor="agree" className="text-[10px] text-slate-500 leading-relaxed font-bold">
                I acknowledge that I have read the Tempo Standard Agreement and agree to be bound by its terms for this specific engagement.
              </label>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-background-dark/90 backdrop-blur-xl border-t border-white/5">
        <button 
          disabled={!isSigned || isSubmitting}
          className={`w-full h-18 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${
            isSigned && !isSubmitting
              ? 'bg-primary text-white shadow-2xl shadow-primary/40 active:scale-[0.97]' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          onClick={handleApply}
        >
          {isSubmitting ? 'Submitting...' : 'Agree & Apply'}
          {!isSubmitting && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
        </button>
      </footer>
    </div>
  );
};

export default Agreement;
