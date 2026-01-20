
import React, { useState, useRef } from 'react';
import { AppView } from '../types';
import { createGig } from '../apiClient';

interface CreateGigProps {
  navigate: (view: AppView) => void;
}

const CreateGig: React.FC<CreateGigProps> = ({ navigate }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [isTipsOnly, setIsTipsOnly] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>(['F']);
  const [genre, setGenre] = useState('Jazz');
  
  // Form State
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');
  const [errors, setErrors] = useState<{ title?: string; budget?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      setRequirements(editorRef.current.innerHTML);
    }
  };

  const validate = () => {
    const newErrors: { title?: string; budget?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Listing name is required';
    } else if (title.length < 3) {
      newErrors.title = 'Name must be at least 3 characters';
    }

    if (!isTipsOnly) {
      if (!budget) {
        newErrors.budget = 'Base pay is required';
      } else if (parseFloat(budget) <= 0) {
        newErrors.budget = 'Pay must be greater than $0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await createGig({
        title,
        venue: 'Main Stage',
        location: 'NYC',
        date: 'Oct 14',
        time: '9PM',
        price: isTipsOnly ? 'Tips Only' : `$${budget}`,
        genre,
        isVerified: true,
        image: '',
        isRecurring,
        frequency: isRecurring ? (frequency as any) : undefined,
        status: 'draft',
        isTipsOnly,
      });
      navigate(AppView.VENUE_DASHBOARD);
    } catch (_err) {
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden">
      {/* Mobile Modal Header */}
      <header className="flex items-center p-4 pt-10 border-b border-white/5 bg-background-dark/90 backdrop-blur-xl shrink-0">
        <button className="w-16 text-slate-400 text-sm font-bold active:opacity-50" onClick={() => navigate(AppView.VENUE_DASHBOARD)}>Cancel</button>
        <h1 className="text-white text-lg font-black flex-1 text-center tracking-tight">Post Gig</h1>
        <button className="w-16 text-primary text-sm font-black active:opacity-50" onClick={handlePublish}>Save</button>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-5 py-8 space-y-8 hide-scrollbar">
        {/* Title Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Listing Name</label>
          <input 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            className={`w-full rounded-[1.25rem] border bg-surface-dark h-16 px-5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-xl font-black placeholder:text-slate-700 transition-all ${errors.title ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border-dark border-none'}`} 
            placeholder="Jazz Night @ Blue Note" 
          />
          {errors.title && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">{errors.title}</p>}
        </div>

        {/* Date Selector */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Select Start Date</label>
          <div className="bg-surface-dark border border-border-dark rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <button className="size-10 rounded-full bg-background-dark/50 flex items-center justify-center text-slate-400 active:scale-90"><span className="material-symbols-outlined">chevron_left</span></button>
              <p className="font-black text-base text-white">October 2023</p>
              <button className="size-10 rounded-full bg-background-dark/50 flex items-center justify-center text-slate-400 active:scale-90"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-600 mb-4 uppercase tracking-tighter">
              {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="h-10 flex items-center justify-center">
                  <div className={`size-10 flex items-center justify-center rounded-[12px] text-sm font-black transition-all ${i === 11 ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110' : 'text-slate-400 hover:bg-white/5 active:bg-white/10'}`}>
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Performance window</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Load In</p>
              <div className="flex items-center bg-surface-dark border border-border-dark rounded-2xl px-5 h-16 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span className="material-symbols-outlined text-slate-500 text-xl mr-3">schedule</span>
                <input 
                  type="time" 
                  defaultValue="20:00" 
                  className="bg-transparent border-none focus:ring-0 w-full p-0 font-black text-base text-white [color-scheme:dark]" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Curfew</p>
              <div className="flex items-center bg-surface-dark border border-border-dark rounded-2xl px-5 h-16 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span className="material-symbols-outlined text-slate-500 text-xl mr-3">logout</span>
                <input 
                  type="time" 
                  defaultValue="23:00" 
                  className="bg-transparent border-none focus:ring-0 w-full p-0 font-black text-base text-white [color-scheme:dark]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Play For Tips Toggle */}
        <div className="space-y-4">
          <div className="bg-surface-dark rounded-[2rem] border border-border-dark overflow-hidden transition-all shadow-lg">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isTipsOnly ? 'bg-accent-cyan text-black shadow-lg shadow-accent-cyan/20' : 'bg-slate-800 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-base text-white">Play for Tips</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">No Base Pay Required</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsTipsOnly(!isTipsOnly);
                  setBudget('');
                  setErrors({ ...errors, budget: undefined });
                }}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 ${isTipsOnly ? 'bg-accent-cyan' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-sm ${isTipsOnly ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Recurrence Toggle */}
        <div className="space-y-4">
          <div className="bg-surface-dark rounded-[2rem] border border-border-dark overflow-hidden transition-all shadow-lg">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isRecurring ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-800 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-3xl">repeat</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-base text-white">Recurring Event</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automated Listings</span>
                </div>
              </div>
              <button 
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 ${isRecurring ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-sm ${isRecurring ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {isRecurring && (
              <div className="px-6 pb-8 pt-2 space-y-8 border-t border-white/5 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Frequency</label>
                  <div className="flex p-1.5 bg-background-dark rounded-2xl">
                    {['Weekly', 'Bi-weekly', 'Monthly'].map((freq) => (
                      <button 
                        key={freq}
                        onClick={() => setFrequency(freq.toLowerCase())}
                        className={`flex-1 py-3 text-xs font-black rounded-[14px] transition-all ${frequency === freq.toLowerCase() ? 'bg-surface-dark text-white shadow-xl scale-[1.02]' : 'text-slate-500 active:opacity-60'}`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Days of Week</label>
                  <div className="flex justify-between">
                    {['S','M','T','W','T','F','S'].map((day, i) => (
                      <button 
                        key={i}
                        onClick={() => toggleDay(day)}
                        className={`size-11 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${selectedDays.includes(day) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110' : 'border-white/5 bg-background-dark text-slate-600 active:bg-white/10'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gig Requirements (Rich Text Editor) */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Gig Requirements</label>
          <div className="bg-surface-dark border border-border-dark rounded-[2rem] overflow-hidden shadow-xl">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
              <button 
                onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }}
                className="size-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 active:text-primary transition-colors"
                title="Bold"
              >
                <span className="material-symbols-outlined text-xl">format_bold</span>
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }}
                className="size-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 active:text-primary transition-colors"
                title="Italic"
              >
                <span className="material-symbols-outlined text-xl">format_italic</span>
              </button>
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              <button 
                onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }}
                className="size-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 active:text-primary transition-colors"
                title="Bullet List"
              >
                <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
              </button>
            </div>
            
            {/* Editor Area */}
            <div 
              ref={editorRef}
              contentEditable
              onInput={(e) => setRequirements(e.currentTarget.innerHTML)}
              className="min-h-[160px] p-6 text-white text-base font-medium outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600 focus:ring-2 focus:ring-primary/20 transition-all"
              data-placeholder="Technical needs, backline provided, parking info..."
            ></div>
          </div>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Formatted for Artist EPK view</p>
        </div>

        {/* Budget & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Base Pay</label>
            <div className={`flex items-center bg-surface-dark border rounded-2xl px-5 h-16 shadow-lg transition-all ${isTipsOnly ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${errors.budget ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border-dark border-none'}`}>
              <span className={`font-black text-lg mr-2 ${errors.budget ? 'text-red-500' : 'text-slate-500'}`}>$</span>
              <input 
                value={isTipsOnly ? '0.00' : budget}
                disabled={isTipsOnly}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (errors.budget) setErrors({ ...errors, budget: undefined });
                }}
                className="bg-transparent border-none focus:ring-0 w-full p-0 font-black text-xl text-white disabled:text-slate-500" 
                placeholder="0.00" 
                type="number" 
              />
            </div>
            {isTipsOnly && <p className="text-accent-cyan text-[9px] font-black uppercase tracking-widest ml-1">Tips Only Enabled</p>}
            {errors.budget && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">{errors.budget}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Genre Tag</label>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white"
              >
                <option>Jazz</option>
                <option>Rock</option>
                <option>Indie</option>
                <option>EDM</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">unfold_more</span>
            </div>
          </div>
        </div>

        <div className="h-20"></div>
      </main>

      {/* Sticky Mobile Footer */}
      <footer className="shrink-0 p-5 pt-4 pb-10 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5">
        <div className="max-w-md mx-auto">
          <button 
            className={`w-full h-18 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${isSubmitting ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'}`}
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Live'}
            {!isSubmitting && <span className="material-symbols-outlined text-2xl">send</span>}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateGig;
