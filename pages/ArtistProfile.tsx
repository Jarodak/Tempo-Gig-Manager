
import React, { useState } from 'react';
import { AppView } from '../types';

interface ArtistProfileProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const INSTRUMENT_OPTIONS = [
  'Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Saxophone', 
  'Trumpet', 'Violin', 'Cello', 'DJ Equipment', 'Percussion'
];

const ArtistProfile: React.FC<ArtistProfileProps> = ({ navigate, logout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState('The Midnight Echoes');
  const [genres, setGenres] = useState<string[]>(['Indie', 'Rock']);
  const [instruments, setInstruments] = useState<string[]>(['Guitar', 'Bass', 'Drums', 'Vocals']);
  const [zipCode, setZipCode] = useState('11201');
  const [gender, setGender] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('band@midnightechoes.com');
  const [previewSong, setPreviewSong] = useState('');
  const [profilePicture, setProfilePicture] = useState('https://picsum.photos/seed/artist_profile/400/400');
  const [cityOfOrigin, setCityOfOrigin] = useState('Brooklyn, NY');
  const [openToWork, setOpenToWork] = useState(true);
  const [bio, setBio] = useState('Based in Brooklyn, The Midnight Echoes deliver a high-energy blend of modern indie hooks and classic garage rock grit.');

  const toggleGenre = (genre: string) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    if (errors.genres) setErrors({ ...errors, genres: undefined });
  };

  const toggleInstrument = (instrument: string) => {
    setInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
    if (errors.instruments) setErrors({ ...errors, instruments: undefined });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (genres.length === 0) e.genres = "At least one genre is required";
    if (instruments.length === 0) e.instruments = "At least one instrument is required";
    if (!zipCode.trim()) e.zipCode = "Zip code is required";
    if (!gender) e.gender = "Gender is required for ID verification";
    if (!emailOrPhone.trim()) e.emailOrPhone = "Email or phone is required";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setIsSaving(true);
    // TODO: Save to API
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark overflow-hidden pb-safe text-white">
      <header className="p-4 pt-10 flex items-center justify-between bg-background-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <button onClick={() => navigate(AppView.ARTIST_FEED)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan">Artist Profile</p>
        </div>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-primary active:scale-90 transition-transform">
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {!isEditing ? (
          <>
            {/* View Mode */}
            <div className="p-6 text-center space-y-6">
              <div className="relative inline-block">
                <div 
                  className="size-32 bg-center bg-cover rounded-[3rem] mx-auto border-4 border-accent-cyan/20 shadow-2xl shadow-accent-cyan/10" 
                  style={{ backgroundImage: `url("${profilePicture}")` }}
                ></div>
                <div className="absolute -bottom-2 -right-2 bg-accent-cyan text-black size-10 rounded-2xl flex items-center justify-center shadow-lg border-4 border-background-dark">
                  <span className="material-symbols-outlined text-xl fill-1">verified</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter">{name}</h1>
                <p className="text-accent-cyan text-sm font-black uppercase tracking-[0.2em]">{genres.join(' • ')}</p>
              </div>
              
              {/* Open to Work Badge */}
              {openToWork && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="material-symbols-outlined text-green-500 text-lg">work</span>
                  <span className="text-green-500 text-xs font-black uppercase tracking-widest">Open to Work</span>
                </div>
              )}
            </div>

            <div className="px-6 grid grid-cols-3 gap-3">
              <div className="bg-surface-dark p-4 rounded-3xl border border-white/5 text-center space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Rating</p>
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  <span className="material-symbols-outlined text-sm fill-1">star</span>
                  <p className="text-lg font-black text-white">4.9</p>
                </div>
              </div>
              <div className="bg-surface-dark p-4 rounded-3xl border border-white/5 text-center space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Avg Draw</p>
                <p className="text-lg font-black text-white">250+</p>
              </div>
              <div className="bg-surface-dark p-4 rounded-3xl border border-white/5 text-center space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Shows</p>
                <p className="text-lg font-black text-white">42</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-1">About</h3>
              <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-6">
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{bio}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Instruments</h3>
              <div className="flex flex-wrap gap-2">
                {instruments.map(i => (
                  <span key={i} className="px-4 py-2 bg-surface-dark border border-white/10 rounded-full text-sm font-bold text-white">{i}</span>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Location</h3>
              <div className="bg-surface-dark border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-500">location_on</span>
                <span className="text-white font-medium">{cityOfOrigin} ({zipCode})</span>
              </div>
            </div>

            <div className="p-6">
              <button 
                onClick={logout}
                className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-black flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">logout</span>
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div 
                    className="size-32 bg-center bg-cover rounded-[3rem] mx-auto border-4 border-white/10" 
                    style={{ backgroundImage: `url("${profilePicture}")` }}
                  ></div>
                  <button className="absolute -bottom-2 -right-2 bg-primary text-white size-10 rounded-2xl flex items-center justify-center shadow-lg border-4 border-background-dark">
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-3">Tap to change photo</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Name <span className="text-red-500">*</span></label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                  className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white placeholder:text-slate-600"
                  placeholder="Your name or band name"
                />
                {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.name}</p>}
              </div>

              {/* Email or Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email or Phone <span className="text-red-500">*</span></label>
                <input
                  value={emailOrPhone}
                  onChange={(e) => { setEmailOrPhone(e.target.value); if (errors.emailOrPhone) setErrors({ ...errors, emailOrPhone: undefined }); }}
                  className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white placeholder:text-slate-600"
                  placeholder="email@example.com or (555) 123-4567"
                />
                {errors.emailOrPhone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.emailOrPhone}</p>}
              </div>

              {/* Zip Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Zip Code <span className="text-red-500">*</span></label>
                <input
                  value={zipCode}
                  onChange={(e) => { setZipCode(e.target.value); if (errors.zipCode) setErrors({ ...errors, zipCode: undefined }); }}
                  className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white placeholder:text-slate-600"
                  placeholder="12345"
                />
                {errors.zipCode && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.zipCode}</p>}
              </div>

              {/* City of Origin */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">City of Origin</label>
                <input
                  value={cityOfOrigin}
                  onChange={(e) => setCityOfOrigin(e.target.value)}
                  className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white placeholder:text-slate-600"
                  placeholder="Brooklyn, NY"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Gender <span className="text-red-500">*</span> <span className="text-slate-600">(for ID verification)</span></label>
                <select
                  value={gender}
                  onChange={(e) => { setGender(e.target.value); if (errors.gender) setErrors({ ...errors, gender: undefined }); }}
                  className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 text-base font-black text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.gender}</p>}
              </div>

              {/* Genres Multi-Select */}
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

              {/* Instruments Multi-Select */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Instruments <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {instruments.map(i => (
                    <span key={i} className="px-3 py-1.5 bg-accent-cyan text-black text-xs font-black rounded-full flex items-center gap-1">
                      {i}
                      <button onClick={() => toggleInstrument(i)} className="ml-1 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
                <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
                  {INSTRUMENT_OPTIONS.map(instrument => (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() => toggleInstrument(instrument)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        instruments.includes(instrument)
                          ? 'bg-accent-cyan text-black'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
                {errors.instruments && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.instruments}</p>}
              </div>

              {/* Preview Song Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Preview Song</label>
                <button className="w-full h-20 rounded-2xl border-2 border-dashed border-white/10 bg-surface-dark flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-primary/50 transition-all">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                  <span className="text-xs font-bold">Upload audio file</span>
                </button>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl border-none bg-surface-dark h-32 px-4 py-3 focus:ring-2 focus:ring-primary/50 text-base font-medium text-white placeholder:text-slate-600 resize-none"
                  placeholder="Tell venues about yourself..."
                />
              </div>

              {/* Open to Work Toggle */}
              <div className="bg-surface-dark rounded-2xl border border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-500 text-2xl">work</span>
                  <div>
                    <p className="font-black text-white">Open to Work</p>
                    <p className="text-slate-500 text-xs">Show venues you're available</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOpenToWork(!openToWork)}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${openToWork ? 'bg-green-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-sm ${openToWork ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
                  isSaving
                    ? 'bg-slate-800 text-slate-600'
                    : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
                {!isSaving && <span className="material-symbols-outlined text-2xl">save</span>}
              </button>
            </div>
          </>
        )}

        <div className="h-20"></div>
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
          <button onClick={() => navigate(AppView.ARTIST_SCHEDULE)} className="flex flex-col items-center gap-1.5 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">confirmation_number</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Gigs</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-accent-cyan active:scale-90 transition-transform">
            <span className="material-symbols-outlined fill-1 text-[28px]">person</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ArtistProfile;
