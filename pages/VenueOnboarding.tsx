
import React, { useState, useRef } from 'react';
import { AppView } from '../types';

interface VenueOnboardingProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

type PlaceSuggestion = {
  id: string;
  name: string;
  description: string;
};

const VenueOnboarding: React.FC<VenueOnboardingProps> = ({ navigate, logout }) => {
  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState('Club');
  const [capacity, setCapacity] = useState(250);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7));
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});
  const [validatedAddress, setValidatedAddress] = useState<any>(null);

  const searchTimeout = useRef<number | null>(null);

  const hasApi = true;

  const handleAddressSearch = async (val: string) => {
    setAddress(val);
    setValidatedAddress(null);
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);

    searchTimeout.current = window.setTimeout(async () => {
      try {
        const url = new URL('/api/places_autocomplete', window.location.origin);
        url.searchParams.set('input', val);
        url.searchParams.set('session_token', sessionToken);
        url.searchParams.set('country', 'us');

        const resp = await fetch(url.toString());
        const data = await resp.json();

        const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
        const nextSuggestions: PlaceSuggestion[] = predictions.slice(0, 5).map((p: any) => ({
          id: String(p?.place_id ?? ''),
          name: String(p?.structured_formatting?.main_text ?? p?.description ?? ''),
          description: String(p?.description ?? ''),
        })).filter((s: PlaceSuggestion) => Boolean(s.id) && Boolean(s.description));

        setSuggestions(nextSuggestions);
        setShowSuggestions(nextSuggestions.length > 0);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectPlace = async (place: PlaceSuggestion) => {
    setIsSearching(true);
    setShowSuggestions(false);
    setAddress(place.description);

    try {
      const detailsUrl = new URL('/api/place_details', window.location.origin);
      detailsUrl.searchParams.set('place_id', place.id);
      detailsUrl.searchParams.set('session_token', sessionToken);

      const detailsResp = await fetch(detailsUrl.toString());
      const detailsData = await detailsResp.json();
      const formatted = String(detailsData?.result?.formatted_address ?? place.description);
      const comps: any[] = Array.isArray(detailsData?.result?.address_components)
        ? detailsData.result.address_components
        : [];

      const byType = (t: string) => comps.find((c) => Array.isArray(c?.types) && c.types.includes(t));

      const streetNumber = byType('street_number')?.long_name ?? '';
      const route = byType('route')?.long_name ?? '';
      const street = `${streetNumber} ${route}`.trim();
      const city = byType('locality')?.long_name ?? byType('sublocality')?.long_name ?? '';
      const state = byType('administrative_area_level_1')?.short_name ?? '';
      const postal = byType('postal_code')?.long_name ?? '';
      const country = byType('country')?.long_name ?? '';

      const validationResp = await fetch('/api/address_validation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          address_lines: [formatted],
          region_code: 'US',
        }),
      });
      const validationData = await validationResp.json();

      const validatedFormatted =
        validationData?.result?.address?.formattedAddress ??
        formatted;

      setValidatedAddress({
        formatted: validatedFormatted,
        components: {
          street: street || '',
          city: city || '',
          state: state || '',
          postal: postal || '',
          country: country || '',
        },
      });
      if (!venueName) setVenueName(place.name.replace(' St, New York, NY', ''));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = () => {
    const e: { name?: string; address?: string } = {};
    if (!venueName.trim()) e.name = "Venue name is required";
    if (!address.trim()) e.address = "Address is required";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      navigate(AppView.VENUE_DASHBOARD);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-[100]">
        <button onClick={logout} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">logout</span>
        </button>
        <div className="flex-1 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Venue Registry</p>
        </div>
        <div className="size-11"></div>
      </header>

      <main className="px-6 py-8 flex-1 overflow-y-auto hide-scrollbar space-y-10 pb-40">
        <div className="text-center space-y-4 pt-4">
          <div className="size-28 bg-primary/20 rounded-[2.5rem] mx-auto flex items-center justify-center border-2 border-primary border-dashed group active:bg-primary/30 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-primary text-5xl">add_business</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">Your Venue</h1>
            <p className="text-slate-500 font-medium">Capture your location accurately.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Venue Name</label>
            <input 
              value={venueName}
              onChange={(e) => { setVenueName(e.target.value); if(errors.name) setErrors({...errors, name: undefined}); }}
              className={`w-full h-18 bg-surface-dark border-2 rounded-[1.5rem] px-6 text-xl font-black focus:border-primary transition-all outline-none ${errors.name ? 'border-red-500/50' : 'border-white/5'}`} 
              placeholder="e.g. Blue Note NYC" 
            />
            {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.name}</p>}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Space Category</label>
            <div className="grid grid-cols-2 gap-2">
              {['Bar', 'Club', 'Theater', 'Outdoor'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setVenueType(t)}
                  className={`py-4 rounded-2xl text-[10px] font-black border-2 transition-all active:scale-95 uppercase tracking-widest ${venueType === t ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface-dark border-white/5 text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 relative">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Location Capture</label>
            <div className="relative group">
              <input 
                value={address}
                onChange={(e) => handleAddressSearch(e.target.value)}
                onFocus={() => address.length > 2 && setShowSuggestions(true)}
                className={`w-full h-18 bg-surface-dark border-2 rounded-[1.5rem] px-6 text-base font-black focus:border-primary transition-all outline-none pr-14 ${errors.address ? 'border-red-500/50' : 'border-white/5'}`} 
                placeholder="Start typing an address..." 
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
                {isSearching ? (
                  <span className="material-symbols-outlined text-primary text-xl animate-spin">progress_activity</span>
                ) : (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_Logo_2020.svg" className="h-4 grayscale opacity-40" alt="Google" />
                )}
              </div>

              {/* AI-Powered Suggestion Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => selectPlace(s)}
                      className="w-full p-5 text-left flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-none active:bg-white/10 transition-colors"
                    >
                      <div className="size-10 rounded-xl bg-background-dark flex items-center justify-center text-slate-500 shrink-0">
                        <span className="material-symbols-outlined text-xl">location_on</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate">{s.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.address && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.address}</p>}
          </div>

          {/* Validation Summary Card */}
          {validatedAddress && (
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 space-y-4 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Standardized Address</span>
                <span className="material-symbols-outlined text-primary fill-1">verified</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black tracking-tight">{validatedAddress.formatted}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-black uppercase text-slate-400">CITY: {validatedAddress.components.city}</span>
                  <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-black uppercase text-slate-400">STATE: {validatedAddress.components.state}</span>
                  <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-black uppercase text-slate-400">POSTAL: {validatedAddress.components.postal}</span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Missing apartment or unit? Add it below if needed.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">House Rules / Technical Info</label>
             <textarea 
               className="w-full bg-surface-dark border-2 border-white/5 rounded-[1.5rem] p-6 text-base font-bold focus:border-primary outline-none h-32 resize-none" 
               placeholder="Describe load-in, parking, and stage dimensions..."
             ></textarea>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-background-dark/90 backdrop-blur-xl border-t border-white/5">
        <button 
          className="w-full bg-primary h-18 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-[0.97] transition-all"
          onClick={handleCreate}
        >
          Confirm Venue Profile
          <span className="material-symbols-outlined text-2xl">check</span>
        </button>
      </footer>
    </div>
  );
};

export default VenueOnboarding;
