import React, { useState } from 'react';
import { AppView } from '../types';

interface CalendarAvailabilityProps {
  navigate: (view: AppView) => void;
}

type AvailabilityStatus = 'available' | 'unavailable' | 'tentative' | 'booked';

interface DayAvailability {
  date: string;
  status: AvailabilityStatus;
  note?: string;
}

const CalendarAvailability: React.FC<CalendarAvailabilityProps> = ({ navigate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    '2025-01-15': { date: '2025-01-15', status: 'booked', note: 'Jazz Night @ Moxy' },
    '2025-01-18': { date: '2025-01-18', status: 'available' },
    '2025-01-20': { date: '2025-01-20', status: 'tentative', note: 'Pending confirmation' },
    '2025-01-22': { date: '2025-01-22', status: 'unavailable', note: 'Personal' },
    '2025-01-25': { date: '2025-01-25', status: 'booked', note: 'Rock Show @ Blue Note' },
  });
  const [noteText, setNoteText] = useState('');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDateKey = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'unavailable': return 'bg-red-500';
      case 'tentative': return 'bg-yellow-500';
      case 'booked': return 'bg-primary';
      default: return 'bg-transparent';
    }
  };

  const getStatusBgColor = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 border-green-500/30';
      case 'unavailable': return 'bg-red-500/20 border-red-500/30';
      case 'tentative': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'booked': return 'bg-primary/20 border-primary/30';
      default: return 'bg-surface-dark border-white/5';
    }
  };

  const handleDayClick = (day: number) => {
    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    setNoteText(availability[dateKey]?.note || '');
    setShowStatusPicker(true);
  };

  const setDayStatus = (status: AvailabilityStatus) => {
    if (!selectedDate) return;
    setAvailability(prev => ({
      ...prev,
      [selectedDate]: { date: selectedDate, status, note: noteText || undefined }
    }));
    setShowStatusPicker(false);
    setSelectedDate(null);
    setNoteText('');
  };

  const clearDayStatus = () => {
    if (!selectedDate) return;
    setAvailability(prev => {
      const newAvail = { ...prev };
      delete newAvail[selectedDate];
      return newAvail;
    });
    setShowStatusPicker(false);
    setSelectedDate(null);
    setNoteText('');
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const availableDays = Object.values(availability).filter((a: DayAvailability) => a.status === 'available').length;
  const bookedDays = Object.values(availability).filter((a: DayAvailability) => a.status === 'booked').length;

  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden pb-safe text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <button onClick={() => navigate(AppView.ARTIST_PROFILE)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Availability</p>
        </div>
        <div className="size-11"></div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
            <p className="text-green-500 text-2xl font-black">{availableDays}</p>
            <p className="text-green-500/70 text-[10px] font-bold uppercase tracking-widest">Available</p>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center">
            <p className="text-primary text-2xl font-black">{bookedDays}</p>
            <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest">Booked</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-surface-dark rounded-3xl border border-white/5 p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="text-lg font-black text-white">{monthName}</h3>
            <button onClick={nextMonth} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-slate-600 py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) {
                return <div key={i} className="aspect-square"></div>;
              }
              const dateKey = formatDateKey(day);
              const dayAvail = availability[dateKey];
              const isToday = new Date().toISOString().split('T')[0] === dateKey;
              
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                    dayAvail ? getStatusBgColor(dayAvail.status) : 'hover:bg-white/5'
                  } ${isToday ? 'ring-2 ring-accent-cyan' : ''}`}
                >
                  <span className={`text-sm font-bold ${dayAvail ? 'text-white' : 'text-slate-400'}`}>{day}</span>
                  {dayAvail && (
                    <div className={`size-1.5 rounded-full ${getStatusColor(dayAvail.status)} mt-0.5`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-500 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary"></div>
            <span className="text-xs text-slate-500 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-slate-500 font-medium">Tentative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-500 font-medium">Unavailable</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Upcoming</h3>
          {(Object.values(availability) as DayAvailability[])
            .filter((a) => a.status === 'booked')
            .slice(0, 3)
            .map((a) => (
              <div key={a.date} className="bg-surface-dark border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">event</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{a.note || 'Booked'}</p>
                  <p className="text-slate-500 text-xs">{new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="h-20"></div>
      </main>

      {/* Status Picker Modal */}
      {showStatusPicker && selectedDate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-end justify-center">
          <div className="bg-surface-dark w-full max-w-md rounded-t-[2rem] p-6 space-y-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <button onClick={() => { setShowStatusPicker(false); setSelectedDate(null); }} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Note (optional)</label>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full rounded-xl border-none bg-background-dark h-12 px-4 focus:ring-2 focus:ring-primary/50 text-sm font-medium text-white placeholder:text-slate-600"
                placeholder="Add a note..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDayStatus('available')}
                className="h-14 rounded-xl bg-green-500/20 border border-green-500/30 text-green-500 font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Available
              </button>
              <button
                onClick={() => setDayStatus('unavailable')}
                className="h-14 rounded-xl bg-red-500/20 border border-red-500/30 text-red-500 font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
                Unavailable
              </button>
              <button
                onClick={() => setDayStatus('tentative')}
                className="h-14 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">help</span>
                Tentative
              </button>
              <button
                onClick={() => setDayStatus('booked')}
                className="h-14 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">event_available</span>
                Booked
              </button>
            </div>

            {availability[selectedDate] && (
              <button
                onClick={clearDayStatus}
                className="w-full h-12 rounded-xl bg-white/5 text-slate-400 font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Clear Status
              </button>
            )}
          </div>
        </div>
      )}

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
            <span className="material-symbols-outlined fill-1 text-[28px]">calendar_month</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Calendar</span>
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

export default CalendarAvailability;
