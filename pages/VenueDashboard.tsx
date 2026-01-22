
import React, { useState, useMemo, useEffect } from 'react';
import { AppView, Gig } from '../types';
import { gigsApi } from '../utils/api';

interface VenueDashboardProps {
  navigate: (view: AppView) => void;
  logout: () => void;
  onSelectDay: (day: number) => void;
}

interface DashboardDay {
  dayName: string;
  dayNumber: number;
  isToday?: boolean;
  hasEvent?: boolean;
}

const getDynamicDays = (): DashboardDay[] => {
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days: DashboardDay[] = [];
  
  for (let i = -1; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      isToday: i === 0,
    });
  }
  return days;
};

const VenueDashboard: React.FC<VenueDashboardProps> = ({ navigate, logout, onSelectDay }) => {
  const [isSynced, setIsSynced] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const days = useMemo(() => getDynamicDays(), []);

  useEffect(() => {
    const loadGigs = async () => {
      try {
        const res = await gigsApi.list();
        if (res.data?.gigs) {
          setGigs(res.data.gigs);
        }
      } catch (err) {
        console.error('Failed to load gigs:', err);
      }
    };
    loadGigs();
  }, []);

  const toggleSync = () => {
    if (!isSynced) {
      setIsConnecting(true);
      setTimeout(() => {
        setIsSynced(true);
        setIsConnecting(false);
      }, 1500);
    } else {
      setIsSynced(false);
    }
  };

  return (
    <div className="flex-1 pb-safe overflow-y-auto hide-scrollbar text-white">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-2 px-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary flex size-10 shrink-0 items-center justify-center bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined fill-1 text-2xl">music_note</span>
            </div>
            <div>
              <h2 className="text-white text-lg font-black leading-tight tracking-tight">Tempo Gig Manager</h2>
              <div className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full transition-all duration-500 ${isSynced ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`}></span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {isSynced ? 'Google Calendar Synced' : 'Calendar Disconnected'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button className="flex size-11 items-center justify-center rounded-2xl bg-surface-dark text-white active:scale-90 transition-transform shadow-sm">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button 
              onClick={logout}
              className="flex size-11 items-center justify-center rounded-2xl bg-surface-dark text-slate-400 active:scale-90 transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Actions Bar */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate(AppView.CREATE_GIG)}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
          <span className="text-xs font-black text-white uppercase tracking-wider">New Gig</span>
        </button>
        <button 
          onClick={() => navigate(AppView.INVITE_ARTIST)}
          className="bg-accent-cyan/10 border border-accent-cyan/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-accent-cyan text-3xl">mail</span>
          <span className="text-xs font-black text-white uppercase tracking-wider">Invite Band</span>
        </button>
      </div>

      {/* Booking Pipelines */}
      <div className="px-4 py-4 space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] opacity-50">Booking Pipelines</h3>
         </div>
         {gigs.length > 0 ? (
           gigs.slice(0, 1).map(gig => (
             <div 
               key={gig.id}
               onClick={() => navigate(AppView.RANKING)}
               className="bg-surface-dark border border-primary/20 rounded-[2rem] p-5 space-y-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
             >
               <div className="flex items-center justify-between">
                  <div>
                     <h4 className="text-white font-black text-base">{gig.title}</h4>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage applicants</p>
                  </div>
                  <div className="flex gap-1.5">
                     <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                     <span className="size-1.5 rounded-full bg-white/10"></span>
                  </div>
               </div>
               <div className="flex items-center gap-3 bg-background-dark/50 p-3 rounded-2xl">
                  <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary">
                     <span className="material-symbols-outlined">event</span>
                  </div>
                  <div className="flex-1">
                     <p className="text-xs font-black text-white">{gig.date} • {gig.time}</p>
                  </div>
               </div>
             </div>
           ))
         ) : (
           <div className="bg-surface-dark/50 border border-dashed border-white/10 rounded-[2rem] p-6 text-center">
             <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">event_busy</span>
             <p className="text-slate-500 text-sm font-bold">No active gigs</p>
             <p className="text-slate-600 text-xs mt-1">Create a gig to start booking artists</p>
           </div>
         )}
      </div>

      {/* Calendar Timeline */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] opacity-50">Timeline</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1 py-2">
          {days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(day.dayNumber)}
              className={`flex flex-col items-center min-w-[64px] py-4 rounded-[1.5rem] border transition-all snap-center active:scale-95 ${
                day.isToday 
                  ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                  : 'bg-surface-dark border-border-dark'
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-tighter ${day.isToday ? 'text-white/70' : 'text-slate-500'}`}>{day.dayName}</span>
              <span className="text-xl font-black mt-1">{day.dayNumber}</span>
              {day.hasEvent && !day.isToday && (
                <div className={`size-1.5 rounded-full mt-2 ${day.dayNumber === 14 ? 'bg-accent-cyan' : 'bg-primary'}`}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* New Applicants */}
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <h2 className="text-white text-2xl font-black tracking-tighter">New Applicants</h2>
      </div>
      
      <div className="px-4 pb-20">
        <div 
          className="flex flex-col gap-5 rounded-[2.5rem] border border-border-dark bg-surface-dark p-6 cursor-pointer active:scale-[0.98] transition-all shadow-lg overflow-hidden relative"
          onClick={() => navigate(AppView.RANKING)}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="bg-surface-dark rounded-2xl size-16 shrink-0 border-2 border-primary/20 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-slate-600 text-2xl">person</span>
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-white text-lg font-black leading-tight">View Applicants</h2>
              <p className="text-slate-500 text-xs">Manage gig applications</p>
            </div>
          </div>
          <button className="w-full rounded-2xl h-14 bg-primary text-white text-sm font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">Rank for Gig</button>
        </div>
      </div>

      {/* Venue Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-8 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button className="flex flex-col items-center gap-1.5 text-primary active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">dashboard</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Dashboard</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">calendar_month</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Schedule</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_ROSTER)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Roster</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_PROFILE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">account_circle</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default VenueDashboard;