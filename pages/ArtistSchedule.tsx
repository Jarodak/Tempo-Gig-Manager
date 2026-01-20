
import React, { useEffect, useMemo, useState } from 'react';
import { AppView, Gig } from '../types';
import { getGigs } from '../apiClient';

interface ArtistScheduleProps {
  navigate: (view: AppView) => void;
}

const ArtistSchedule: React.FC<ArtistScheduleProps> = ({ navigate }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDay, setSelectedDay] = useState<number>(14);
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

  // Map of days to their gig status for dot rendering
  const gigMap = useMemo(() => {
    const map: Record<number, 'confirmed' | 'applied'> = {};
    gigs.forEach(gig => {
      const day = parseInt(String(gig.date ?? '').split(' ')[1]);
      if (!isNaN(day)) {
        if (gig.status === 'confirmed' || map[day] === undefined) {
          map[day] = gig.status === 'confirmed' ? 'confirmed' : 'applied';
        }
      }
    });
    return map;
  }, [gigs]);

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
              ? 'bg-accent-cyan text-black shadow-lg shadow-accent-cyan/30 z-10' 
              : isToday 
                ? 'border-2 border-primary bg-primary/5 text-primary' 
                : 'bg-surface-dark border border-white/5 text-slate-400'
          }`}
        >
          <span className="text-xs font-black">{dayNum}</span>
          {gigStatus && !isSelected && (
            <div className={`size-1 rounded-full absolute bottom-2 ${gigStatus === 'confirmed' ? 'bg-accent-cyan' : 'bg-slate-500'}`}></div>
          )}
        </button>
      );
    }
    return cells;
  };

  const selectedGigs = gigs.filter(g => parseInt(String(g.date ?? '').split(' ')[1]) === selectedDay);

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden pb-safe text-white">
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-4 px-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-2xl font-black tracking-tighter">Your Gigs</h2>
           <button 
             onClick={() => navigate(AppView.ARTIST_FEED)}
             className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-slate-400 active:scale-90 shadow-lg"
           >
             <span className="material-symbols-outlined">explore</span>
           </button>
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

      <main className="flex-1 overflow-y-auto px-5 py-6 hide-scrollbar">
        {viewMode === 'list' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {['This Month', 'Upcoming'].map(group => (
              <div key={group} className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">{group}</h3>
                {gigs.map(gig => (
                  <div key={gig.id} className="bg-surface-dark border border-white/5 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all">
                    <div className={`size-14 rounded-2xl flex flex-col items-center justify-center border ${
                      gig.status === 'confirmed' ? 'border-green-500/30 bg-green-500/5 text-green-500' :
                      gig.status === 'applied' ? 'border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan' :
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
                       <p className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                          gig.status === 'confirmed' ? 'text-green-500 bg-green-500/10' :
                          'text-accent-cyan bg-accent-cyan/10'
                       }`}>
                         {gig.status}
                       </p>
                       <p className="text-[9px] font-black text-slate-600 uppercase mt-1">{gig.price}</p>
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
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['S','M','T','W','T','F','S'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase py-2">{d}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Events on Oct {selectedDay}</h3>
              {selectedGigs.length > 0 ? (
                selectedGigs.map(gig => (
                  <div key={gig.id} className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-3xl p-5 flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-black text-base">{gig.title}</h4>
                      <p className="text-slate-400 text-xs font-bold mt-1">{gig.time} • {gig.venue}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-accent-cyan font-black">{gig.price}</p>
                       <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${gig.status === 'confirmed' ? 'text-green-500' : 'text-accent-cyan'}`}>{gig.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-dark border border-white/5 border-dashed rounded-[2rem] p-8 text-center">
                  <span className="material-symbols-outlined text-slate-700 text-4xl mb-3">event_busy</span>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Free Day</p>
                </div>
              )}
            </div>
          </div>
        )}
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
          <button className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">confirmation_number</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Gigs</span>
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

export default ArtistSchedule;
