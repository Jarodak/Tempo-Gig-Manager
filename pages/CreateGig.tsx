
import React, { useState, useRef, useEffect } from 'react';
import { AppView, PaymentType, EsrbRating } from '../types';
import { gigsApi, venuesApi, analyticsApi } from '../utils/api';
import { getCurrentUser } from '../services/auth';

interface CreateGigProps {
  navigate: (view: AppView) => void;
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const EQUIPMENT_OPTIONS = [
  'PA System', 'Microphones', 'Drum Kit', 'Piano', 'Lighting System',
  'Stage Monitors', 'DJ Booth', 'Backline', 'Cables', 'Power Distribution'
];

const CreateGig: React.FC<CreateGigProps> = ({ navigate }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>(['F']);
  const [sameBandForAll, setSameBandForAll] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [loadInTime, setLoadInTime] = useState('20:00');
  const [curfewTime, setCurfewTime] = useState('23:00');
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.FLAT_FEE);
  const [budget, setBudget] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [inKindDescription, setInKindDescription] = useState('');
  const [esrbRating, setEsrbRating] = useState<EsrbRating>(EsrbRating.FAMILY);
  const [equipmentProvided, setEquipmentProvided] = useState<string[]>([]);
  const [requirements, setRequirements] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [postingSchedule, setPostingSchedule] = useState<'immediate' | 'scheduled'>('immediate');
  const [daysBeforePost, setDaysBeforePost] = useState(7);
  
  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autofillApplied, setAutofillApplied] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Time picker options
  const timeOptions = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00'
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  // Calendar helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getMonthDays(calendarDate);

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) return;
    
    setSelectedDate(newDate);
    const dateStr = newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setDate(dateStr);
    if (errors.date) setErrors({ ...errors, date: undefined });
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === calendarDate.getMonth() && 
           selectedDate.getFullYear() === calendarDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === calendarDate.getMonth() && 
           today.getFullYear() === calendarDate.getFullYear();
  };

  const isPastDate = (day: number) => {
    const checkDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const monthYearStr = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Autofill from venue profile on mount
  useEffect(() => {
    const loadVenueProfile = async () => {
      const user = getCurrentUser();
      if (!user) return;
      
      await analyticsApi.track('screen_view', { screen: 'create_gig' }, user.id);
      
      const response = await venuesApi.getByUserId(user.id);
      if (response.data?.venues && response.data.venues.length > 0) {
        const venue = response.data.venues[0];
        setGenres(venue.typical_genres || []);
        setEsrbRating((venue.esrb_rating as EsrbRating) || EsrbRating.FAMILY);
        setEquipmentProvided(venue.equipment_onsite || []);
        
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setTitle(`${venue.name} – ${dateStr}`);
        setAutofillApplied(true);
      }
    };
    loadVenueProfile();
  }, []);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    if (errors.genres) setErrors({ ...errors, genres: undefined });
  };

  const toggleEquipment = (equipment: string) => {
    setEquipmentProvided(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
    if (errors.equipment) setErrors({ ...errors, equipment: undefined });
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      setRequirements(editorRef.current.innerHTML);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Gig name is required';
    }
    
    if (genres.length === 0) {
      newErrors.genres = 'At least one genre is required';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    // Validate payment based on type
    if (paymentType === PaymentType.FLAT_FEE && !budget) {
      newErrors.budget = 'Payment amount is required';
    }
    if (paymentType === PaymentType.HOURLY && !hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    }
    if (paymentType === PaymentType.IN_KIND && !inKindDescription.trim()) {
      newErrors.inKind = 'Please describe what you\'re offering';
    }
    
    if (equipmentProvided.length === 0) {
      newErrors.equipment = 'Equipment provided is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      const response = await gigsApi.create({
        title,
        venue: 'Main Stage',
        location: 'NYC',
        date,
        time: loadInTime,
        price: paymentType === PaymentType.TIPS 
          ? 'Tips Only' 
          : paymentType === PaymentType.HOURLY 
            ? `$${hourlyRate}/hr` 
            : paymentType === PaymentType.IN_KIND 
              ? 'In-Kind' 
              : `$${budget}`,
        genre: genres,
        isVerified: true,
        image: '',
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        status: 'published',
        isTipsOnly: paymentType === PaymentType.TIPS,
      });
      
      if (response.error) {
        setErrors({ submit: response.error });
        return;
      }
      
      await analyticsApi.track('gig_created', { 
        gigId: response.data?.gig?.id,
        isRecurring,
        paymentType 
      }, user.id);
      
      navigate(AppView.VENUE_DASHBOARD);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create gig' });
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
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Select Start Date {date && <span className="text-white">— {date}</span>}</label>
          <div className={`bg-surface-dark border rounded-[2rem] p-6 shadow-xl ${errors.date ? 'border-red-500/50' : 'border-border-dark'}`}>
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="size-10 rounded-full bg-background-dark/50 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"><span className="material-symbols-outlined">chevron_left</span></button>
              <p className="font-black text-base text-white">{monthYearStr}</p>
              <button onClick={handleNextMonth} className="size-10 rounded-full bg-background-dark/50 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-600 mb-4 uppercase tracking-tighter">
              {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isDateSelected(day);
                const today = isToday(day);
                const past = isPastDate(day);
                return (
                  <div key={day} className="h-10 flex items-center justify-center">
                    <button
                      onClick={() => handleSelectDate(day)}
                      disabled={past}
                      className={`size-10 flex items-center justify-center rounded-[12px] text-sm font-black transition-all ${
                        selected 
                          ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110' 
                          : today
                            ? 'bg-primary/20 text-primary border-2 border-primary'
                            : past
                              ? 'text-slate-700 cursor-not-allowed'
                              : 'text-slate-400 hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {errors.date && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">{errors.date}</p>}
        </div>

        {/* Time Slots */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Performance window</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Load In</p>
              <div className="relative">
                <select
                  value={loadInTime}
                  onChange={(e) => setLoadInTime(e.target.value)}
                  className="w-full bg-surface-dark border border-border-dark rounded-2xl pl-12 pr-10 h-16 text-white font-black text-base appearance-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-xl pointer-events-none">schedule</span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Curfew</p>
              <div className="relative">
                <select
                  value={curfewTime}
                  onChange={(e) => setCurfewTime(e.target.value)}
                  className="w-full bg-surface-dark border border-border-dark rounded-2xl pl-12 pr-10 h-16 text-white font-black text-base appearance-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-xl pointer-events-none">logout</span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Type Selector */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Payment Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: PaymentType.TIPS, label: 'Tips Only', icon: 'volunteer_activism', desc: 'Artist keeps all tips' },
              { value: PaymentType.HOURLY, label: 'Hourly', icon: 'schedule', desc: 'Pay per hour worked' },
              { value: PaymentType.FLAT_FEE, label: 'Flat Fee', icon: 'payments', desc: 'Fixed amount for gig' },
              { value: PaymentType.IN_KIND, label: 'In-Kind', icon: 'handshake', desc: 'Non-cash compensation' },
            ].map(pt => (
              <button
                key={pt.value}
                onClick={() => {
                  setPaymentType(pt.value);
                  if (pt.value === PaymentType.TIPS) {
                    setBudget('');
                    setHourlyRate('');
                    setEstimatedHours('');
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentType === pt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-2xl mb-2">{pt.icon}</span>
                <div className="font-black text-sm">{pt.label}</div>
                <div className="text-[9px] mt-1 opacity-70">{pt.desc}</div>
              </button>
            ))}
          </div>

          {/* Payment Details based on type */}
          <div className="bg-surface-dark rounded-[2rem] border border-border-dark p-6 space-y-4 animate-in fade-in duration-300">
            {paymentType === PaymentType.TIPS && (
              <div className="text-center py-4">
                <div className="size-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
                </div>
                <h4 className="text-white font-black text-lg">Tips Only</h4>
                <p className="text-slate-400 text-sm mt-2">Artist will perform for tips collected during the gig.</p>
                <p className="text-accent-cyan text-[10px] font-black uppercase tracking-widest mt-4">No upfront payment required</p>
              </div>
            )}

            {paymentType === PaymentType.FLAT_FEE && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <span className="text-white font-black">Flat Fee Payment</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Amount</label>
                  <div className={`flex items-center bg-background-dark border rounded-2xl px-5 h-16 transition-all ${errors.budget ? 'border-red-500/50' : 'border-white/5'}`}>
                    <span className="font-black text-xl text-slate-500 mr-2">$</span>
                    <input 
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        if (errors.budget) setErrors({ ...errors, budget: undefined });
                      }}
                      className="bg-transparent border-none focus:ring-0 w-full p-0 font-black text-2xl text-white" 
                      placeholder="500" 
                      type="number" 
                    />
                  </div>
                  {errors.budget && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.budget}</p>}
                </div>
              </div>
            )}

            {paymentType === PaymentType.HOURLY && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="text-white font-black">Hourly Payment</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hourly Rate</label>
                    <div className={`flex items-center bg-background-dark border rounded-2xl px-5 h-16 transition-all ${errors.hourlyRate ? 'border-red-500/50' : 'border-white/5'}`}>
                      <span className="font-black text-lg text-slate-500 mr-2">$</span>
                      <input 
                        value={hourlyRate}
                        onChange={(e) => {
                          setHourlyRate(e.target.value);
                          if (errors.hourlyRate) setErrors({ ...errors, hourlyRate: undefined });
                        }}
                        className="bg-transparent border-none focus:ring-0 w-full p-0 font-black text-xl text-white" 
                        placeholder="50" 
                        type="number" 
                      />
                      <span className="text-slate-500 text-sm font-bold">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Est. Hours</label>
                    <div className="flex items-center bg-background-dark border border-white/5 rounded-2xl px-5 h-16">
                      <input 
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 w-full p-0 font-black text-xl text-white" 
                        placeholder="4" 
                        type="number" 
                      />
                      <span className="text-slate-500 text-sm font-bold">hrs</span>
                    </div>
                  </div>
                </div>
                {hourlyRate && estimatedHours && (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Estimated Total</span>
                    <span className="text-primary font-black text-xl">${(parseFloat(hourlyRate) * parseFloat(estimatedHours)).toFixed(2)}</span>
                  </div>
                )}
                {errors.hourlyRate && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.hourlyRate}</p>}
              </div>
            )}

            {paymentType === PaymentType.IN_KIND && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">handshake</span>
                  <span className="text-white font-black">In-Kind Compensation</span>
                </div>
                <p className="text-slate-400 text-sm">Describe what you're offering instead of cash payment:</p>
                <div className="space-y-2">
                  <textarea 
                    value={inKindDescription}
                    onChange={(e) => {
                      setInKindDescription(e.target.value);
                      if (errors.inKind) setErrors({ ...errors, inKind: undefined });
                    }}
                    className={`w-full bg-background-dark border rounded-2xl p-5 font-medium text-white resize-none h-32 transition-all ${errors.inKind ? 'border-red-500/50' : 'border-white/5'}`}
                    placeholder="e.g., Free meals & drinks, exposure to 500+ audience, professional recording of set, merchandise table space..."
                  />
                  {errors.inKind && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.inKind}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Free Food & Drinks', 'Recording', 'Merch Table', 'Promotion'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setInKindDescription(prev => prev ? `${prev}, ${tag}` : tag)}
                      className="px-3 py-1.5 bg-background-dark border border-white/10 rounded-full text-xs font-bold text-slate-400 hover:border-primary hover:text-primary transition-all"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

        {/* ESRB Rating */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Age Rating</label>
          <div className="relative">
            <select
              value={esrbRating}
              onChange={(e) => setEsrbRating(e.target.value as EsrbRating)}
              className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white"
            >
              <option value={EsrbRating.FAMILY}>Family Friendly</option>
              <option value={EsrbRating.ADULTS_ONLY}>21+</option>
              <option value={EsrbRating.NSFW}>NSFW</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">unfold_more</span>
          </div>
          {autofillApplied && <p className="text-accent-cyan text-[9px] font-black uppercase tracking-widest ml-1">Autofilled from venue</p>}
        </div>

        {/* Genre Multi-Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
            Genre(s) <span className="text-red-500">*</span>
            {autofillApplied && <span className="text-accent-cyan ml-2">Autofilled</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <span key={g} className="px-3 py-1.5 bg-primary text-white text-xs font-black rounded-full flex items-center gap-1">
                {g}
                <button onClick={() => toggleGenre(g)} className="ml-1 hover:text-red-300">×</button>
              </span>
            ))}
          </div>
          <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
            {GENRE_OPTIONS.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  genres.includes(genre)
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {errors.genres && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.genres}</p>}
        </div>

        {/* Equipment Provided Multi-Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
            Equipment Provided <span className="text-red-500">*</span>
            {autofillApplied && <span className="text-accent-cyan ml-2">Autofilled</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {equipmentProvided.map(e => (
              <span key={e} className="px-3 py-1.5 bg-accent-cyan text-black text-xs font-black rounded-full flex items-center gap-1">
                {e}
                <button onClick={() => toggleEquipment(e)} className="ml-1 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
          <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
            {EQUIPMENT_OPTIONS.map(equipment => (
              <button
                key={equipment}
                type="button"
                onClick={() => toggleEquipment(equipment)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  equipmentProvided.includes(equipment)
                    ? 'bg-accent-cyan text-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {equipment}
              </button>
            ))}
          </div>
          {errors.equipment && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.equipment}</p>}
        </div>

        <div className="h-20"></div>

        {errors.submit && (
          <div className="px-5">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
              <span className="material-symbols-outlined text-red-500 text-2xl mb-2">error</span>
              <p className="text-red-500 text-xs font-black uppercase tracking-widest">{errors.submit}</p>
            </div>
          </div>
        )}
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
