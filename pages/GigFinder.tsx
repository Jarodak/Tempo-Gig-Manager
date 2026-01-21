
import React, { useEffect, useMemo, useState } from 'react';
import { AppView, Gig } from '../types';
import { gigsApi, analyticsApi } from '../utils/api';
import { getCurrentUser } from '../services/auth';

interface GigFinderProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

const GigFinder: React.FC<GigFinderProps> = ({ navigate, logout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Location filters
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(15);
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Genre filter
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadGigs = async () => {
      const user = getCurrentUser();
      if (user) {
        await analyticsApi.track('screen_view', { screen: 'gig_finder' }, user.id);
      }
      
      const response = await gigsApi.list();
      if (!cancelled && response.data?.gigs) {
        const mappedGigs: Gig[] = response.data.gigs.map((g: any) => ({
          id: g.id,
          title: g.title,
          venueId: g.venue_id || '',
          venue: g.venue,
          location: g.location,
          date: g.date,
          time: g.time,
          price: g.price,
          genre: Array.isArray(g.genre) ? g.genre : [g.genre],
          isVerified: g.isVerified ?? false,
          image: g.image,
          stage: g.stage,
          isRecurring: g.isRecurring ?? false,
          frequency: g.frequency,
          status: g.status || 'published',
          isTipsOnly: g.isTipsOnly ?? false,
          paymentType: g.payment_type || 'flat_fee',
          esrbRating: g.esrb_rating || 'family',
          equipmentProvided: g.equipment_provided || [],
          postingSchedule: g.posting_schedule,
          applicants: [],
          createdAt: g.created_at || new Date().toISOString(),
          updatedAt: g.updated_at || new Date().toISOString(),
        }));
        setGigs(mappedGigs);
      }
    };
    loadGigs();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGigs = useMemo(() => {
    let result = gigs;
    
    // Text search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((g) =>
        [g.title, g.venue, g.location, g.genre].some((v) => String(v ?? '').toLowerCase().includes(q))
      );
    }
    
    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter((g) => selectedGenres.includes(g.genre));
    }
    
    // TODO: Add location/radius filtering when we have geocoding
    // TODO: Add date range filtering when gigs have proper date objects
    
    return result;
  }, [gigs, searchQuery, selectedGenres]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setUseCurrentLocation(true);
    setZipCode('');
    setRadius(15);
    setStartDate('');
    setEndDate('');
    setSelectedGenres([]);
  };

  const activeFilterCount = [
    !useCurrentLocation && zipCode,
    radius !== 15,
    startDate,
    endDate,
    selectedGenres.length > 0
  ].filter(Boolean).length;

  return (
    <div className="flex-1 pb-safe overflow-y-auto hide-scrollbar text-white">
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-2xl border-b border-white/5 pt-10 px-5 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent-cyan rounded-[14px] size-11 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl fill-1">graphic_eq</span>
            </div>
            <div>
              <h2 className="text-white text-2xl font-black tracking-tighter leading-none">Find Gigs</h2>
              <p className="text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                {useCurrentLocation ? 'Near you' : zipCode || 'All locations'} • {radius} mi
              </p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center justify-center rounded-2xl size-11 bg-surface-dark text-slate-500 active:scale-90">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1 flex items-center rounded-2xl bg-surface-dark px-5 h-14 border border-white/5 shadow-inner transition-all focus-within:border-primary/50 group">
            <span className="material-symbols-outlined text-slate-500 text-[22px] mr-3 group-focus-within:text-primary transition-colors">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white focus:ring-0 w-full text-base font-bold placeholder:text-slate-600 pr-4" 
              placeholder="Search city, venue or genre..." 
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`size-14 rounded-2xl flex items-center justify-center transition-all relative ${
              showFilters || activeFilterCount > 0 
                ? 'bg-primary text-white' 
                : 'bg-surface-dark text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined">tune</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-accent-cyan text-black text-[10px] font-black rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-surface-dark rounded-2xl border border-white/5 space-y-6 animate-in slide-in-from-top-2">
            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Location</label>
                <button 
                  onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                    useCurrentLocation 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">my_location</span>
                  Use Current
                </button>
              </div>
              {!useCurrentLocation && (
                <input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full rounded-xl border-none bg-background-dark h-12 px-4 focus:ring-2 focus:ring-primary/50 text-base font-bold text-white placeholder:text-slate-600"
                  placeholder="Enter zip code or city"
                />
              )}
            </div>

            {/* Radius Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Search Radius</label>
                <span className="text-primary font-black">{radius} miles</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-background-dark rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                <span>1 mi</span>
                <span>50 mi</span>
                <span>100 mi</span>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-600 font-bold uppercase">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border-none bg-background-dark h-12 px-3 focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-600 font-bold uppercase">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border-none bg-background-dark h-12 px-3 focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Genre Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Genres</label>
              <div className="flex flex-wrap gap-2">
                {['Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 'Indie', 'Blues'].map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary text-white'
                        : 'bg-background-dark text-slate-500 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button 
                onClick={clearFilters}
                className="w-full h-10 rounded-xl bg-red-500/10 text-red-500 text-xs font-black flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </header>

      <main className="py-6 space-y-8">
        <div className="px-5 space-y-4">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-cyan">Your Invites</h3>
           <div className="bg-accent-cyan/10 border-2 border-accent-cyan/20 rounded-[2rem] p-6 flex items-center gap-5 cursor-pointer" onClick={() => navigate(AppView.AGREEMENT)}>
              <div className="size-14 bg-accent-cyan text-black rounded-2xl flex items-center justify-center shadow-xl shadow-accent-cyan/20">
                 <span className="material-symbols-outlined text-3xl">mail</span>
              </div>
              <div className="flex-1 text-white">
                 <h4 className="font-black text-lg leading-tight">Moxy Chelsea NYC</h4>
                 <p className="text-accent-cyan text-xs font-bold uppercase mt-1">Invited: Jazz Night</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
           </div>
        </div>

        <div className="px-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              Public Listings
              {filteredGigs.length > 0 && <span className="text-primary ml-2">({filteredGigs.length})</span>}
            </h3>
          </div>
          
          {filteredGigs.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">search_off</span>
              <p className="text-slate-500 font-bold">No gigs found</p>
              <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <div key={gig.id} className="rounded-[2.5rem] overflow-hidden bg-surface-dark border border-white/5 active:scale-[0.98] transition-all">
                <div className="relative aspect-[4/3] bg-center bg-cover" style={{ backgroundImage: `url(${gig.image || 'https://picsum.photos/seed/gig_fallback/800/600'})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent opacity-80"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-white">{gig.genre}</span>
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-accent-cyan">{gig.date}</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white text-3xl font-black tracking-tighter">{gig.title}</h3>
                      <p className="text-white/80 text-sm font-bold flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {gig.location}
                      </p>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold">{gig.venue}</span>
                    <span className="text-primary font-black">{gig.price}</span>
                  </div>
                  <button 
                    className="w-full bg-primary text-white text-lg font-black h-16 rounded-[1.5rem] shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                    onClick={() => navigate(AppView.AGREEMENT)}
                  >
                    Quick Apply <span className="material-symbols-outlined">bolt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-10 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">explore</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Feed</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_ROSTER)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Roster</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">confirmation_number</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Gigs</span>
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

export default GigFinder;
