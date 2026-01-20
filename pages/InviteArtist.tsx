
import React, { useState } from 'react';
import { AppView } from '../types';

interface InviteArtistProps {
  navigate: (view: AppView) => void;
}

const InviteArtist: React.FC<InviteArtistProps> = ({ navigate }) => {
  const [method, setMethod] = useState<'text' | 'email'>('text');
  
  // Form State
  const [artistName, setArtistName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState<{ artistName?: string; contactInfo?: string }>({});
  const [isSending, setIsSending] = useState(false);

  const validate = () => {
    const newErrors: { artistName?: string; contactInfo?: string } = {};
    
    if (!artistName.trim()) {
      newErrors.artistName = 'Artist name is required';
    }

    if (!contactInfo.trim()) {
      newErrors.contactInfo = `${method === 'text' ? 'Phone number' : 'Email'} is required`;
    } else {
      if (method === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactInfo)) {
          newErrors.contactInfo = 'Enter a valid email address';
        }
      } else {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(contactInfo)) {
          newErrors.contactInfo = 'Enter a valid phone number';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvite = () => {
    if (validate()) {
      setIsSending(true);
      // Simulate API call
      setTimeout(() => {
        setIsSending(false);
        navigate(AppView.VENUE_DASHBOARD);
      }, 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden">
      <header className="flex items-center p-4 pt-10 border-b border-white/5 bg-background-dark/90 backdrop-blur-xl shrink-0">
        <button className="w-16 text-slate-400 text-sm font-bold active:opacity-50" onClick={() => navigate(AppView.VENUE_DASHBOARD)}>Cancel</button>
        <h1 className="text-white text-lg font-black flex-1 text-center tracking-tight text-white">Direct Invite</h1>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10 hide-scrollbar">
        <div className="text-center space-y-3">
          <div className="size-20 bg-accent-cyan/10 rounded-3xl mx-auto flex items-center justify-center text-accent-cyan shadow-lg shadow-accent-cyan/10">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Scout an Artist</h2>
          <p className="text-slate-500 font-medium">Send a personal booking link to a band.</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Artist Name</label>
            <input 
              value={artistName}
              onChange={(e) => {
                setArtistName(e.target.value);
                if (errors.artistName) setErrors({ ...errors, artistName: undefined });
              }}
              className={`w-full h-18 bg-surface-dark border-2 rounded-[1.5rem] px-6 text-xl font-black text-white focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/10 transition-all outline-none ${errors.artistName ? 'border-red-500/50' : 'border-white/5'}`} 
              placeholder="e.g. The Black Keys" 
            />
            {errors.artistName && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">{errors.artistName}</p>}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Invite Via</label>
            <div className="flex p-1.5 bg-surface-dark rounded-2xl border border-white/5">
              <button 
                onClick={() => {
                  setMethod('text');
                  setContactInfo('');
                  setErrors({});
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-black transition-all ${method === 'text' ? 'bg-background-dark text-white shadow-xl' : 'text-slate-500'}`}
              >
                <span className="material-symbols-outlined text-lg">sms</span> TEXT
              </button>
              <button 
                onClick={() => {
                  setMethod('email');
                  setContactInfo('');
                  setErrors({});
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-black transition-all ${method === 'email' ? 'bg-background-dark text-white shadow-xl' : 'text-slate-500'}`}
              >
                <span className="material-symbols-outlined text-lg">mail</span> EMAIL
              </button>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              {method === 'text' ? 'Phone Number' : 'Email Address'}
            </label>
            <input 
              type={method === 'text' ? 'tel' : 'email'}
              value={contactInfo}
              onChange={(e) => {
                setContactInfo(e.target.value);
                if (errors.contactInfo) setErrors({ ...errors, contactInfo: undefined });
              }}
              className={`w-full h-18 bg-surface-dark border-2 rounded-[1.5rem] px-6 text-xl font-black text-white focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/10 transition-all outline-none ${errors.contactInfo ? 'border-red-500/50' : 'border-white/5'}`} 
              placeholder={method === 'text' ? '+1 (555) 000-0000' : 'artist@example.com'} 
            />
            {errors.contactInfo && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">{errors.contactInfo}</p>}
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Select Gig</label>
            <div className="relative">
              <select className="w-full h-18 bg-surface-dark border-2 border-white/5 rounded-[1.5rem] px-6 text-base font-black appearance-none focus:border-accent-cyan transition-all outline-none text-white">
                <option>DJ Zephyr: Neon Nights (Oct 14)</option>
                <option>Blue Note Jazz Jam (Oct 21)</option>
                <option>Halloween Basement Bash (Oct 31)</option>
              </select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        <div className="h-20"></div>
      </main>

      <footer className="shrink-0 p-6 pt-4 pb-12 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5">
        <button 
          className={`w-full h-18 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${isSending ? 'bg-slate-800 text-slate-600' : 'bg-accent-cyan text-black shadow-accent-cyan/30 active:scale-[0.97]'}`}
          onClick={handleSendInvite}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send Invite'}
          {!isSending && <span className="material-symbols-outlined">send</span>}
        </button>
      </footer>
    </div>
  );
};

export default InviteArtist;
