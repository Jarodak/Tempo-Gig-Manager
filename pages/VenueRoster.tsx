
import React, { useState, useEffect } from 'react';
import { AppView, Artist, Gig } from '../types';
import { artistsApi, gigsApi } from '../utils/api';
import { getCurrentUser } from '../services/auth';

interface VenueRosterProps {
  navigate: (view: AppView) => void;
}


const VenueRoster: React.FC<VenueRosterProps> = ({ navigate }) => {
  const [search, setSearch] = useState('');
  const [invitingArtist, setInvitingArtist] = useState<Artist | null>(null);
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all artists
        const artistsRes = await artistsApi.list();
        if (artistsRes.data?.artists) {
          setArtists(artistsRes.data.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
            genre: Array.isArray(a.genre) ? a.genre.join(', ') : a.genre || 'Various',
            rating: 4.5,
            type: 'Artist',
            avgDraw: '—',
            image: a.profile_picture || '',
          })));
        }
        // Load all gigs (will filter by venue later when we have venue_id on gigs)
        const gigsRes = await gigsApi.list();
        if (gigsRes.data?.gigs) {
          setGigs(gigsRes.data.gigs);
        }
      } catch (err) {
        console.error('Failed to load roster data:', err);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const filtered = artists.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.genre.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendInvite = () => {
    if (!selectedGigId) return;
    
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setInvitingArtist(null);
      setSelectedGigId(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden pb-safe text-white relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Invite sent successfully
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-4 px-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
           <div>
              <h2 className="text-white text-2xl font-black tracking-tighter leading-none">Venue Roster</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage your trusted talent</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => navigate(AppView.INVITE_ARTIST)}
                className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
                title="Invite External Artist"
              >
                <span className="material-symbols-outlined">mail</span>
              </button>
              <button 
                onClick={() => navigate(AppView.VENUE_DISCOVER)}
                className="size-11 rounded-2xl bg-primary flex items-center justify-center text-white active:scale-90 shadow-lg shadow-primary/20"
                title="Find Artists on Tempo"
              >
                <span className="material-symbols-outlined">person_search</span>
              </button>
           </div>
        </div>
        
        {/* Roster Search Bar Area */}
        <div className="space-y-3">
          <div className="relative flex items-center rounded-2xl bg-surface-dark px-5 h-14 border border-white/5 shadow-inner transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 group">
            <span className="material-symbols-outlined text-slate-500 text-[22px] mr-3 group-focus-within:text-primary transition-colors">search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-white focus:ring-0 w-full text-base font-bold placeholder:text-slate-600" 
              placeholder="Quick find by artist or genre..." 
            />
            {search ? (
              <button 
                onClick={() => setSearch('')}
                className="size-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 active:scale-90 hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            ) : (
              <span className="material-symbols-outlined text-slate-700 text-lg">tune</span>
            )}
          </div>
          
          {/* Active Search Meta */}
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {search ? `Searching: "${search}"` : 'Your Roster'}
                </span>
             </div>
             <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-widest animate-in fade-in">
               {filtered.length} {filtered.length === 1 ? 'Artist' : 'Artists'}
             </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 hide-scrollbar space-y-4">
        {filtered.length > 0 ? (
          filtered.map((artist, idx) => (
            <div 
              key={artist.id} 
              className="bg-surface-dark border border-white/5 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="size-16 rounded-2xl bg-cover bg-center shrink-0 border border-white/5 shadow-lg" style={{ backgroundImage: `url(${artist.image})` }}></div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-white font-black text-lg leading-tight truncate">{artist.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{artist.genre}</span>
                  <span className="text-slate-700">•</span>
                  <div className="flex items-center text-yellow-500">
                    <span className="material-symbols-outlined text-xs fill-1">star</span>
                    <span className="text-[10px] font-black ml-0.5">{artist.rating}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setInvitingArtist(artist)}
                className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-all shadow-inner hover:bg-primary/20"
                title="Quick Invite"
              >
                <span className="material-symbols-outlined text-2xl">bolt</span>
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-6 animate-in zoom-in duration-300">
            <div className="size-24 bg-white/5 rounded-[2.5rem] mx-auto flex items-center justify-center border-2 border-dashed border-white/10">
              <span className="material-symbols-outlined text-slate-700 text-5xl">person_off</span>
            </div>
            <div className="space-y-2">
               <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">No results for "{search}"</p>
               <button 
                  onClick={() => setSearch('')}
                  className="text-primary font-black text-sm uppercase tracking-widest border-b-2 border-primary/30 pb-1"
               >
                  Clear Search
               </button>
            </div>
          </div>
        )}
      </main>

      {/* Quick Invite Overlay */}
      {invitingArtist && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-surface-dark w-full max-w-md rounded-[3rem] border border-white/10 p-8 space-y-8 animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter">Invite Artist</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">To which gig for {invitingArtist.name}?</p>
                 </div>
                 <button 
                    onClick={() => { setInvitingArtist(null); setSelectedGigId(null); }}
                    className="size-11 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 active:scale-90"
                 >
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto hide-scrollbar">
                 {gigs.length > 0 ? gigs.map(gig => (
                    <button 
                       key={gig.id}
                       onClick={() => setSelectedGigId(gig.id)}
                       className={`w-full p-5 rounded-[1.75rem] border-2 transition-all flex items-center justify-between group ${
                          selectedGigId === gig.id 
                             ? 'bg-primary/20 border-primary shadow-lg' 
                             : 'bg-background-dark/50 border-white/5 active:border-white/10'
                       }`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`size-12 rounded-2xl flex items-center justify-center ${selectedGigId === gig.id ? 'bg-primary text-white' : 'bg-surface-dark text-slate-600'}`}>
                             <span className="material-symbols-outlined">calendar_today</span>
                          </div>
                          <div className="text-left">
                             <h4 className="font-black text-base">{gig.title}</h4>
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{gig.date} • {gig.time}</p>
                          </div>
                       </div>
                       {selectedGigId === gig.id && (
                          <span className="material-symbols-outlined text-primary text-2xl fill-1">check_circle</span>
                       )}
                    </button>
                 )) : (
                    <p className="text-slate-500 text-center py-4">No gigs created yet. Create a gig first to invite artists.</p>
                 )}
              </div>

              <div className="pt-4">
                 <button 
                    disabled={!selectedGigId || isSending}
                    onClick={handleSendInvite}
                    className={`w-full h-18 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${
                       selectedGigId && !isSending 
                          ? 'bg-primary text-white shadow-2xl shadow-primary/40 active:scale-[0.97]' 
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                 >
                    {isSending ? 'Sending Invitation...' : 'Send Performance Invite'}
                    {!isSending && <span className="material-symbols-outlined">send</span>}
                 </button>
              </div>
           </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-8 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center text-white">
          <button onClick={() => navigate(AppView.VENUE_DASHBOARD)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
          </button>
          <button onClick={() => navigate(AppView.VENUE_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">calendar_month</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Schedule</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-primary active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">group</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Roster</span>
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

export default VenueRoster;
