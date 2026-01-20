
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Gig } from '../types';

interface VenueScheduleProps {
  navigate: (view: AppView) => void;
  initialDay?: number;
}

const SCHEDULE: Gig[] = [
  { id: 's1', title: 'Neon Nights', venue: 'Main Stage', location: 'NYC', date: 'Oct 14', time: '9PM', price: '$800', genre: 'Electronic', isVerified: true, image: '', status: 'confirmed' },
  { id: 's2', title: 'Acoustic Sunday', venue: 'Lounge', location: 'NYC', date: 'Oct 15', time: '6PM', price: '$200', genre: 'Acoustic', isVerified: true, image: '', status: 'pending' },
  { id: 's3', title: 'Heavy Metal Monday', venue: 'Main Stage', location: 'NYC', date: 'Oct 16', time: '8PM', price: '$400', genre: 'Metal', isVerified: true, image: '', status: 'draft' },
  { id: 's4', title: 'Jazz Jam', venue: 'Bar', location: 'NYC', date: 'Oct 21', time: '7PM', price: 'Tips Only', isTipsOnly: true, genre: 'Jazz', isVerified: true, image: '', status: 'confirmed' },
];

const VenueSchedule: React.FC<VenueScheduleProps> = ({ navigate, initialDay }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDay, setSelectedDay] = useState<number>(initialDay || 13);

  useEffect(() => {
    if (initialDay && initialDay !== 13) {
      setSelectedDay(initialDay);
      setViewMode('calendar');
    }
  }, [initialDay]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  // Map of days to their gig status for dot rendering
  const gigMap = useMemo(() => {
    const map: Record<number, 'confirmed' | 'pending'> = {};
    SCHEDULE.forEach(gig => {
      const day = parseInt(gig.date.split(' ')[1]);
      if (!isNaN(day)) {
        // Confirmed takes priority for the color
        if (gig.status === 'confirmed' || map[day] === undefined) {
          map[day] = gig.status === 'confirmed' ? 'confirmed' : 'pending';
        }
      }
    });
    return map;
  }, []);

  const daysInMonth = 31;

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < daysInMonth; i++) {
      const dayNum = i + 1;
      const gigStatus = gigMap[dayNum];
      const isSelected = selectedDay === dayNum;
      const isToday = dayNum === 13;

      cells.push(
        <button
          key={i}
          onClick={() => setSelectedDay(dayNum)}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
            isSelected 
              ? 'bg-primary text-white shadow-lg shadow-primary/30 z-10' 
              : isToday 
                ? 'border-2 border-accent-cyan bg-accent-cyan/5 text-accent-cyan' 
                : 'bg-surface-dark border border-white/5 text-slate-400'
          }`}
        >
          <span className="text-xs font-black">{dayNum}</span>
          {gigStatus && !isSelected && (
            <div className={`size-1 rounded-full absolute bottom-2 ${gigStatus === 'confirmed' ? 'bg-primary' : 'bg-slate-500'}`}></div>
          )}
        </button>
      );
    }
    return cells;
  };

  const selectedGigs = SCHEDULE.filter(g => parseInt(g.date.split(' ')[1]) === selectedDay);

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden pb-safe">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Synced to Google Calendar
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-4 px-5 border-b border-white/5 text-white">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-2xl font-black tracking-tighter">Your Schedule</h2>
           <div className="flex gap-2">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={`size-11 rounded-2xl flex items-center justify-center transition-all ${isSyncing ? 'bg-slate-800 animate-pulse' : 'bg-surface-dark border border-white/5 text-[#4285F4] shadow-lg active:scale-90'}`}
              >
                <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
              </button>
              <button 
                onClick={() => navigate(AppView.CREATE_GIG)}
                className="size-11 rounded-2xl bg-primary flex items-center justify-center text-white active:scale-90 shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
           </div>
        </div>

        <div className="flex p-1.5 bg-surface-dark/50 rounded-2xl border border-white/5">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-background-dark text-white shadow-xl' : 'text-slate-500'}`}
          >
            <span className="material-symbols-outlined text-lg">format_list_bulleted</span> List
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-background-dark text-white shadow-xl' : 'text-slate-500'}`}
          >
            <span className="material-symbols-outlined text-lg">calendar_view_month</span> Calendar
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 hide-scrollbar text-white">
        {viewMode === 'list' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {['This Week', 'Next Week'].map(group => (
              <div key={group} className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">{group}</h3>
                {SCHEDULE.map(gig => (
                  <div key={gig.id} className="bg-surface-dark border border-white/5 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all">
                    <div className={`size-14 rounded-2xl flex flex-col items-center justify-center border ${
                      gig.status === 'confirmed' ? 'border-green-500/30 bg-green-500/5 text-green-500' :
                      gig.status === 'pending' ? 'border-primary/30 bg-primary/5 text-primary' :
                      'border-slate-500/30 bg-slate-500/5 text-slate-500'
                    }`}>
                      <span className="text-[10px] font-black leading-none">{gig.date.split(' ')[0]}</span>
                      <span className="text-lg font-black">{gig.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-black text-base leading-tight truncate">{gig.title}</h4>
                      <p className="text-slate-500 text-xs font-bold mt-1">{gig.time} • {gig.venue}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                       <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md inline-block ${
                          gig.isTipsOnly ? 'text-accent-cyan bg-accent-cyan/10' :
                          gig.status === 'confirmed' ? 'text-green-500 bg-green-500/10' :
                          gig.status === 'pending' ? 'text-primary bg-primary/10' :
                          'text-slate-500 bg-slate-500/10'
                       }`}>
                         {gig.isTipsOnly ? 'Tips Only' : gig.status}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-black text-white">October 2023</h3>
                <div className="flex gap-2">
                  <button className="size-8 rounded-full bg-surface-dark flex items-center justify-center text-slate-500"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                  <button className="size-8 rounded-full bg-surface-dark flex items-center justify-center text-slate-500"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['S','M','T','W','T','F','S'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase py-2">{d}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Selected Day: Oct {selectedDay}</h3>
              {selectedGigs.length > 0 ? (
                selectedGigs.map(gig => (
                  <div key={gig.id} className="bg-primary/5 border border-primary/20 rounded-3xl p-5 flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-black text-base">{gig.title}</h4>
                      <p className="text-slate-400 text-xs font-bold mt-1">{gig.time} • {gig.venue}</p>
                    </div>
                    <div className="text-right">
                       <p className={`${gig.isTipsOnly ? 'text-accent-cyan' : 'text-primary'} font-black`}>{gig.isTipsOnly ? 'For Tips' : gig.price}</p>
                       <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${gig.status === 'confirmed' ? 'text-green-500' : 'text-primary'}`}>{gig.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-dark border border-white/5 border-dashed rounded-[2rem] p-8 text-center">
                  <span className="material-symbols-outlined text-slate-700 text-4xl mb-3">event_busy</span>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No gigs scheduled</p>
                  <button 
                    onClick={() => navigate(AppView.CREATE_GIG)}
                    className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 mx-auto"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Create Gig
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-8 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center text-white">
          <button 
            onClick={() => navigate(AppView.VENUE_DASHBOARD)}
            className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-primary active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">calendar_month</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Schedule</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_ROSTER)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Roster</span>
          </button>
          <button 
            onClick={() => navigate(AppView.VENUE_PROFILE)}
            className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">account_circle</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default VenueSchedule;
