
import React, { useState, useMemo } from 'react';
import { AppView, Artist } from '../types';

interface BandMember extends Artist {
  joinedAt: string;
  isLeader?: boolean;
}

interface BandInvite {
  id: string;
  fromBand: string;
  fromArtist: string;
  role: string;
  image: string;
}

const SEARCHABLE_ARTISTS: Artist[] = [
  { id: 't2', name: 'Luna Soul', genre: 'R&B', rating: 4.7, type: 'Soloist', avgDraw: '180', image: 'https://picsum.photos/seed/luna/200/200' },
  { id: 't3', name: 'Neon Pulse', genre: 'Electronic', rating: 4.2, type: 'Duo', avgDraw: '150', image: 'https://picsum.photos/seed/neon/200/200' },
  { id: 't4', name: 'The Backbeats', genre: 'Classic Rock', rating: 4.4, type: '5 Piece', avgDraw: '300', image: 'https://picsum.photos/seed/back/200/200' },
  { id: 't5', name: 'Velvet Undergrounds', genre: 'Alternative', rating: 4.5, type: 'Band', avgDraw: '200', image: 'https://picsum.photos/seed/velvet/200/200' },
];

const INITIAL_INVITES: BandInvite[] = [
  { id: 'inv1', fromBand: 'The Midnight Echoes', fromArtist: 'Alex Thompson', role: 'Drums', image: 'https://picsum.photos/seed/echoes/200/200' }
];

const ArtistRoster: React.FC<{ navigate: (v: AppView) => void }> = ({ navigate }) => {
  const [isBandMember, setIsBandMember] = useState(false);
  const [bandName, setBandName] = useState('');
  const [members, setMembers] = useState<BandMember[]>([]);
  const [invites, setInvites] = useState<BandInvite[]>(INITIAL_INVITES);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showStartBand, setShowStartBand] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredArtists = useMemo(() => {
    return SEARCHABLE_ARTISTS.filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.genre.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleStartBand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandName.trim()) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsBandMember(true);
      setShowStartBand(false);
      setIsProcessing(false);
      // Add self as leader
      setMembers([{
        id: 'self',
        name: 'You (Leader)',
        genre: 'Various',
        rating: 5.0,
        type: 'Artist',
        avgDraw: '0',
        image: 'https://picsum.photos/seed/artist_profile/200/200',
        joinedAt: 'Today',
        isLeader: true
      }]);
    }, 800);
  };

  const handleAcceptInvite = (invite: BandInvite) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsBandMember(true);
      setBandName(invite.fromBand);
      setInvites([]);
      setMembers([
        {
          id: 'leader',
          name: invite.fromArtist,
          genre: 'Leader',
          rating: 4.9,
          type: 'Artist',
          avgDraw: '100',
          image: invite.image,
          joinedAt: 'Founding Member',
          isLeader: true
        },
        {
          id: 'self',
          name: 'You',
          genre: 'Your Role',
          rating: 5.0,
          type: 'Artist',
          avgDraw: '0',
          image: 'https://picsum.photos/seed/artist_profile/200/200',
          joinedAt: 'Just Now'
        }
      ]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleInviteArtist = (artist: Artist) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSearch(false);
      alert(`Invitation sent to ${artist.name}! They will appear on your roster once they accept.`);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden pb-safe text-white relative">
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-4 px-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
           <h2 className="text-white text-2xl font-black tracking-tighter leading-none">
            {isBandMember ? bandName : 'Your Roster'}
           </h2>
           <div className="flex gap-2">
              {isBandMember ? (
                <button 
                  onClick={() => setShowSearch(true)}
                  className="size-11 rounded-2xl bg-accent-cyan text-black flex items-center justify-center shadow-lg active:scale-90"
                >
                  <span className="material-symbols-outlined font-black">person_add</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowStartBand(true)}
                  className="size-11 rounded-2xl bg-surface-dark border border-white/5 text-accent-cyan flex items-center justify-center active:scale-90"
                >
                  <span className="material-symbols-outlined">group_add</span>
                </button>
              )}
           </div>
        </div>
        <p className="text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em]">
          {isBandMember ? 'Connected Band Accounts' : 'Performing as a Solo Artist'}
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 hide-scrollbar space-y-8">
        {!isBandMember ? (
          <div className="space-y-10 py-10">
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="size-24 bg-surface-dark rounded-[2.5rem] mx-auto flex items-center justify-center border-2 border-dashed border-white/10">
                <span className="material-symbols-outlined text-slate-700 text-5xl">person</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black">Solo Mode</h3>
                <p className="text-slate-500 text-sm font-medium max-w-[240px] mx-auto">
                  You aren't part of a band yet. Connect with other artists to form a group.
                </p>
              </div>
              <button 
                onClick={() => setShowStartBand(true)}
                className="bg-accent-cyan text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent-cyan/20 active:scale-95 transition-all"
              >
                Form a Band
              </button>
            </div>

            {invites.length > 0 && (
              <div className="space-y-4 animate-in fade-in delay-200">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Pending Invites</h4>
                {invites.map(invite => (
                  <div key={invite.id} className="bg-accent-cyan/5 border-2 border-accent-cyan/20 rounded-[2.5rem] p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-cover bg-center border border-accent-cyan/20" style={{ backgroundImage: `url(${invite.image})` }}></div>
                      <div>
                        <h5 className="font-black text-white">{invite.fromBand}</h5>
                        <p className="text-accent-cyan text-[10px] font-black uppercase tracking-widest">Invited by {invite.fromArtist}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAcceptInvite(invite)}
                        className="flex-1 bg-accent-cyan h-12 rounded-xl text-black font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Accept & Join
                      </button>
                      <button 
                        onClick={() => setInvites(invites.filter(i => i.id !== invite.id))}
                        className="flex-1 bg-white/5 h-12 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Active Members</h4>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="bg-surface-dark border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-cover bg-center border border-white/5 shadow-lg" style={{ backgroundImage: `url(${member.image})` }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-white font-black text-lg truncate leading-none">{member.name}</h5>
                      {member.isLeader && (
                        <span className="bg-accent-cyan text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Leader</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1.5">Joined: {member.joinedAt}</p>
                  </div>
                  {member.id !== 'self' && (
                    <button className="size-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center active:scale-90">
                      <span className="material-symbols-outlined text-xl">person_remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Start Band */}
      {showStartBand && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-dark w-full max-w-sm rounded-[3rem] border border-white/10 p-8 space-y-8 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="size-20 bg-accent-cyan/10 rounded-3xl mx-auto flex items-center justify-center text-accent-cyan">
                <span className="material-symbols-outlined text-4xl">groups</span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter">New Band</h3>
              <p className="text-slate-500 text-sm font-medium">Create a group identity to book bigger gigs.</p>
            </div>
            
            <form onSubmit={handleStartBand} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Band Name</label>
                <input 
                  autoFocus
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  placeholder="e.g. The Midnight Echoes"
                  className="w-full bg-background-dark border border-white/5 rounded-2xl h-14 px-6 text-sm font-black focus:border-accent-cyan outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={!bandName || isProcessing}
                className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${
                  !bandName || isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-accent-cyan text-black shadow-accent-cyan/20 active:scale-95'
                }`}
              >
                {isProcessing ? 'Forming...' : 'Establish Band'}
              </button>
              <button 
                type="button"
                onClick={() => setShowStartBand(false)}
                className="w-full text-slate-500 font-black text-[10px] uppercase tracking-widest h-10"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Search Collaborators */}
      {showSearch && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-background-dark animate-in slide-in-from-bottom duration-500">
          <header className="pt-12 px-5 pb-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tighter">Find Artists</h3>
              <button onClick={() => setShowSearch(false)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="relative flex items-center rounded-2xl bg-surface-dark px-5 h-14 border border-white/5 focus-within:border-accent-cyan transition-all">
              <span className="material-symbols-outlined text-slate-500 mr-3">search</span>
              <input 
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or genre..."
                className="bg-transparent border-none text-white focus:ring-0 w-full font-black text-sm"
              />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4 hide-scrollbar">
            {filteredArtists.length > 0 ? (
              filteredArtists.map(artist => (
                <div key={artist.id} className="bg-surface-dark border border-white/5 rounded-[2rem] p-5 flex items-center gap-4 animate-in fade-in">
                  <div className="size-16 rounded-2xl bg-cover bg-center border border-white/5" style={{ backgroundImage: `url(${artist.image})` }}></div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-black text-base truncate">{artist.name}</h5>
                    <p className="text-accent-cyan text-[10px] font-black uppercase tracking-widest mt-0.5">{artist.genre}</p>
                  </div>
                  <button 
                    onClick={() => handleInviteArtist(artist)}
                    className="h-10 px-4 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                  >
                    Invite
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-40">
                <span className="material-symbols-outlined text-6xl">person_search</span>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">No artists found</p>
              </div>
            )}
          </main>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[300] bg-background-dark/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
           <div className="size-16 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-10 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => navigate(AppView.ARTIST_FEED)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">explore</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Feed</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">group</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Roster</span>
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

export default ArtistRoster;
