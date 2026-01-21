import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { bandsApi, bandMembersApi, analyticsApi } from '../utils/api';
import { getCurrentUser } from '../services/auth';

interface BandProfileProps {
  navigate: (view: AppView) => void;
}

interface BandMember {
  id: string;
  name: string;
  role: string;
  instrument: string;
  avatar: string;
  isVerified: boolean;
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const INSTRUMENT_OPTIONS = [
  'Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Saxophone', 
  'Trumpet', 'Violin', 'Cello', 'DJ Equipment', 'Percussion'
];

const BandProfile: React.FC<BandProfileProps> = ({ navigate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bandId, setBandId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPostOpening, setShowPostOpening] = useState(false);

  // Band state
  const [bandName, setBandName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [bandPhoto, setBandPhoto] = useState('');
  const [members, setMembers] = useState<BandMember[]>([]);

  useEffect(() => {
    const loadBand = async () => {
      const user = getCurrentUser();
      if (!user) {
        setIsLoading(false);
        setIsCreating(true);
        return;
      }
      
      await analyticsApi.track('screen_view', { screen: 'band_profile' }, user.id);
      
      const response = await bandsApi.getByUserId(user.id);
      if (response.data?.bands && response.data.bands.length > 0) {
        const b = response.data.bands[0];
        setBandId(b.id);
        setBandName(b.name);
        setGenres(b.genre ? [b.genre] : []);
        setBio('');
        setBandPhoto(b.profile_picture || '');
        
        // Load members
        const membersResponse = await bandMembersApi.getByBandId(b.id);
        if (membersResponse.data?.members) {
          setMembers(membersResponse.data.members.map((m: any) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            instrument: m.instrument,
            avatar: '',
            isVerified: false,
          })));
        }
      } else {
        setIsCreating(true);
      }
      setIsLoading(false);
    };
    loadBand();
  }, []);

  // Opening post state
  const [openingInstrument, setOpeningInstrument] = useState('');
  const [openingDescription, setOpeningDescription] = useState('');

  // New member invite
  const [inviteEmail, setInviteEmail] = useState('');

  const toggleGenre = (genre: string) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    if (errors.genres) setErrors({ ...errors, genres: undefined });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!bandName.trim()) e.bandName = "Band name is required";
    if (genres.length === 0) e.genres = "At least one genre is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    
    const user = getCurrentUser();
    if (!user) {
      setIsSaving(false);
      return;
    }
    
    try {
      const bandData = {
        name: bandName,
        genre: genres[0] || 'Rock',
        phone: '555-0000',
        email: user.email || 'band@tempo.app',
        profile_picture: bandPhoto || 'https://picsum.photos/seed/band/400/400',
        user_id: user.id,
      };
      
      let response;
      if (bandId) {
        response = await bandsApi.update({ id: bandId, ...bandData });
        await analyticsApi.track('profile_updated', { action: 'band_updated' }, user.id);
      } else {
        response = await bandsApi.create(bandData);
        await analyticsApi.track('band_created', { bandName }, user.id);
      }
      
      if (response?.data?.band) {
        setBandId(response.data.band.id);
      }
      
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;
    // TODO: Send invite via API
    setInviteEmail('');
    setShowAddMember(false);
  };

  const handlePostOpening = () => {
    if (!openingInstrument) return;
    // TODO: Post opening via API
    setOpeningInstrument('');
    setOpeningDescription('');
    setShowPostOpening(false);
  };

  const removeMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // Create Band Form
  if (isCreating) {
    return (
      <div className="flex-1 flex flex-col bg-background-dark overflow-hidden pb-safe text-white">
        <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
          <button onClick={() => setIsCreating(false)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Create Band</p>
          <div className="size-11"></div>
        </header>

        <main className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6">
          <div className="text-center">
            <button className="size-32 rounded-[3rem] bg-surface-dark border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 mx-auto">
              <span className="material-symbols-outlined text-3xl text-slate-500">add_photo_alternate</span>
              <span className="text-[10px] text-slate-500 font-bold">Band Photo</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Band Name <span className="text-red-500">*</span></label>
            <input
              value={bandName}
              onChange={(e) => { setBandName(e.target.value); if (errors.bandName) setErrors({ ...errors, bandName: undefined }); }}
              className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white placeholder:text-slate-600"
              placeholder="Enter band name"
            />
            {errors.bandName && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.bandName}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Genre(s) <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <span key={g} className="px-3 py-1.5 bg-primary text-white text-xs font-black rounded-full flex items-center gap-1">
                  {g}
                  <button onClick={() => toggleGenre(g)} className="ml-1 hover:text-red-300">×</button>
                </span>
              ))}
            </div>
            <div className="max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    genres.includes(genre) ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {errors.genres && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.genres}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border-none bg-surface-dark h-32 px-4 py-3 focus:ring-2 focus:ring-primary/50 text-base font-medium text-white placeholder:text-slate-600 resize-none"
              placeholder="Tell venues about your band..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
              isSaving ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'
            }`}
          >
            {isSaving ? 'Creating...' : 'Create Band'}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden pb-safe text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <button onClick={() => navigate(AppView.ARTIST_ROSTER)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Band Profile</p>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {!isEditing ? (
          <>
            {/* View Mode */}
            <div className="relative aspect-video bg-center bg-cover" style={{ backgroundImage: `url("${bandPhoto}")` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl font-black tracking-tighter">{bandName}</h1>
                <p className="text-accent-cyan text-sm font-black uppercase tracking-[0.2em] mt-1">{genres.join(' • ')}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-surface-dark border border-white/5 rounded-2xl p-4">
                <p className="text-slate-400 text-sm leading-relaxed">{bio}</p>
              </div>

              {/* Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Members ({members.length})</h3>
                  <button 
                    onClick={() => setShowAddMember(true)}
                    className="text-xs font-bold text-primary flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="bg-surface-dark border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                      <div className="relative">
                        <div 
                          className="size-12 rounded-xl bg-center bg-cover"
                          style={{ backgroundImage: `url("${member.avatar}")` }}
                        ></div>
                        {member.isVerified && (
                          <div className="absolute -bottom-1 -right-1 size-5 bg-accent-cyan text-black rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs fill-1">verified</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white">{member.name}</p>
                        <p className="text-slate-500 text-xs">{member.instrument} • {member.role}</p>
                      </div>
                      {!member.isVerified && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-full">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Post Opening Button */}
              <button 
                onClick={() => setShowPostOpening(true)}
                className="w-full h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-black flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">campaign</span>
                Post Opening for New Member
              </button>

              {/* Create New Band Button */}
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full h-14 rounded-2xl bg-surface-dark border border-white/10 text-slate-400 font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Create Another Band
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div 
                    className="w-full aspect-video rounded-2xl bg-center bg-cover border-2 border-white/10"
                    style={{ backgroundImage: `url("${bandPhoto}")` }}
                  ></div>
                  <button className="absolute bottom-2 right-2 bg-primary text-white size-10 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Band Name <span className="text-red-500">*</span></label>
                <input
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Genre(s)</label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        genres.includes(genre) ? 'bg-primary text-white' : 'bg-surface-dark text-slate-500'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl border-none bg-surface-dark h-32 px-4 py-3 focus:ring-2 focus:ring-primary/50 text-base font-medium text-white resize-none"
                />
              </div>

              {/* Manage Members */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Members</label>
                {members.map(member => (
                  <div key={member.id} className="bg-surface-dark border border-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div 
                      className="size-10 rounded-lg bg-center bg-cover"
                      style={{ backgroundImage: `url("${member.avatar}")` }}
                    ></div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{member.name}</p>
                      <p className="text-slate-500 text-xs">{member.instrument}</p>
                    </div>
                    <button 
                      onClick={() => removeMember(member.id)}
                      className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
                  isSaving ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}

        <div className="h-20"></div>
      </main>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-end justify-center">
          <div className="bg-surface-dark w-full max-w-md rounded-t-[2rem] p-6 space-y-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Invite Member</h3>
              <button onClick={() => setShowAddMember(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-500">info</span>
              <p className="text-yellow-500 text-xs">Members must complete face verification before they can be added to your band.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl border-none bg-background-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-bold text-white placeholder:text-slate-600"
                placeholder="member@email.com"
                type="email"
              />
            </div>

            <button
              onClick={handleInviteMember}
              className="w-full h-14 rounded-xl bg-primary text-white font-black flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">send</span>
              Send Invite
            </button>
          </div>
        </div>
      )}

      {/* Post Opening Modal */}
      {showPostOpening && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-end justify-center">
          <div className="bg-surface-dark w-full max-w-md rounded-t-[2rem] p-6 space-y-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Post Opening</h3>
              <button onClick={() => setShowPostOpening(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Looking for <span className="text-red-500">*</span></label>
              <select
                value={openingInstrument}
                onChange={(e) => setOpeningInstrument(e.target.value)}
                className="w-full rounded-xl border-none bg-background-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-bold text-white"
              >
                <option value="">Select instrument/role</option>
                {INSTRUMENT_OPTIONS.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Description</label>
              <textarea
                value={openingDescription}
                onChange={(e) => setOpeningDescription(e.target.value)}
                className="w-full rounded-xl border-none bg-background-dark h-24 px-4 py-3 focus:ring-2 focus:ring-primary/50 text-sm font-medium text-white placeholder:text-slate-600 resize-none"
                placeholder="Describe what you're looking for..."
              />
            </div>

            <button
              onClick={handlePostOpening}
              disabled={!openingInstrument}
              className={`w-full h-14 rounded-xl font-black flex items-center justify-center gap-2 ${
                openingInstrument ? 'bg-accent-cyan text-black' : 'bg-slate-800 text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined">campaign</span>
              Post Opening
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-10 pt-4 pb-10 z-[120]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => navigate(AppView.ARTIST_FEED)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">explore</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Feed</span>
          </button>
          <button onClick={() => navigate(AppView.ARTIST_ROSTER)} className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
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

export default BandProfile;
