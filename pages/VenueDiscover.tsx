
import React, { useState, useEffect } from 'react';
import { AppView, Artist } from '../types';
import { artistsApi } from '../utils/api';

interface VenueDiscoverProps {
  navigate: (view: AppView) => void;
}


const VenueDiscover: React.FC<VenueDiscoverProps> = ({ navigate }) => {
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtists = async () => {
      setLoading(true);
      try {
        const res = await artistsApi.list();
        if (res.data?.artists) {
          setArtists(res.data.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
            genre: Array.isArray(a.genre) ? a.genre.join(', ') : a.genre || 'Various',
            rating: 4.5,
            type: 'Artist',
            avgDraw: '—',
            image: a.profile_picture || '',
          })));
        }
      } catch (err) {
        console.error('Failed to load artists:', err);
      }
      setLoading(false);
    };
    loadArtists();
  }, []);

  const filteredTalent = artists.filter(artist => 
    artist.name.toLowerCase().includes(search.toLowerCase()) || 
    artist.genre.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToRoster = (artist: Artist) => {
    if (addedIds.includes(artist.id)) return;
    setAddedIds([...addedIds, artist.id]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 50) {
      setError('Search term too long');
      return;
    }
    setError('');
    setSearch(value);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden text-white">
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-4 px-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => navigate(AppView.VENUE_ROSTER)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
             <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div>
              <h2 className="text-white text-2xl font-black tracking-tighter">Discover Talent</h2>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Scout the Tempo Scene</p>
           </div>
        </div>
        
        <div className="space-y-2">
          <div className="relative flex items-center rounded-2xl bg-surface-dark px-5 h-14 border border-white/5 transition-all focus-within:border-primary/50">
            <span className="material-symbols-outlined text-slate-500 text-[22px] mr-3">search</span>
            <input 
              value={search}
              onChange={handleSearchChange}
              className="bg-transparent border-none text-white focus:ring-0 w-full text-base font-bold placeholder:text-slate-600" 
              placeholder="Search by name or genre..." 
            />
          </div>
          {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-2">{error}</p>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 hide-scrollbar space-y-4">
        {filteredTalent.length > 0 ? (
          filteredTalent.map(artist => (
            <div key={artist.id} className="bg-surface-dark border border-white/5 rounded-[2rem] p-5 flex items-center gap-5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="size-20 rounded-[1.5rem] bg-cover bg-center shrink-0 border border-white/5" style={{ backgroundImage: `url(${artist.image})` }}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                    {artist.genre}
                   </span>
                   <div className="flex items-center text-yellow-500">
                    <span className="material-symbols-outlined text-[10px] fill-1">star</span>
                    <span className="text-[10px] font-black ml-0.5">{artist.rating}</span>
                  </div>
                </div>
                <h4 className="text-white font-black text-xl leading-none truncate mb-2">{artist.name}</h4>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Avg Draw: {artist.avgDraw}+</p>
              </div>
              <button 
                onClick={() => handleAddToRoster(artist)}
                disabled={addedIds.includes(artist.id)}
                className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                  addedIds.includes(artist.id) 
                    ? 'bg-green-500/10 text-green-500 scale-90' 
                    : 'bg-primary text-white shadow-lg shadow-primary/20 active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {addedIds.includes(artist.id) ? 'check' : 'add'}
                </span>
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4 opacity-50">
            <span className="material-symbols-outlined text-slate-700 text-6xl">search_off</span>
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">No talent found matching "{search}"</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5">
        <button 
          onClick={() => navigate(AppView.VENUE_ROSTER)}
          className="w-full bg-primary h-18 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-[0.97] transition-all"
        >
          {addedIds.length > 0 ? `Update Roster (${addedIds.length})` : 'Done Searching'}
          <span className="material-symbols-outlined text-2xl">check</span>
        </button>
      </footer>
    </div>
  );
};

export default VenueDiscover;
