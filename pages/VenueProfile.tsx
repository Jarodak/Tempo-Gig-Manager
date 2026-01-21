import React, { useState, useEffect } from 'react';
import { AppView, Venue, VenueType, EsrbRating } from '../types';
import { venuesApi, analyticsApi } from '../utils/api';
import { getCurrentUser } from '../services/auth';

interface VenueProfileProps {
  navigate: (view: AppView) => void;
  logout: () => void;
}

const VENUE_TYPES = [
  { value: VenueType.HOTEL, label: 'Hotel' },
  { value: VenueType.RESTAURANT, label: 'Restaurant' },
  { value: VenueType.BAR, label: 'Bar' },
  { value: VenueType.DIVE, label: 'Dive Bar' },
  { value: VenueType.CHURCH, label: 'Church' },
];

const ESRB_OPTIONS = [
  { value: EsrbRating.FAMILY, label: 'Family Friendly' },
  { value: EsrbRating.ADULTS_ONLY, label: '21+' },
  { value: EsrbRating.NSFW, label: 'NSFW' },
];

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop', 'R&B', 'Country', 
  'Folk', 'Classical', 'Metal', 'Punk', 'Indie', 'Blues'
];

const EQUIPMENT_OPTIONS = [
  'PA System', 'Microphones', 'Drum Kit', 'Piano', 'Lighting System',
  'Stage Monitors', 'DJ Booth', 'Backline', 'Cables', 'Power Distribution'
];

const VenueProfile: React.FC<VenueProfileProps> = ({ navigate, logout }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<VenueType>(VenueType.BAR);
  const [esrbRating, setEsrbRating] = useState<EsrbRating>(EsrbRating.FAMILY);
  const [typicalGenres, setTypicalGenres] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState('');
  const [availableOutlets, setAvailableOutlets] = useState(0);
  const [adaAccessible, setAdaAccessible] = useState(false);
  const [equipmentOnsite, setEquipmentOnsite] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    const loadVenues = async () => {
      const user = getCurrentUser();
      if (!user) return;
      
      await analyticsApi.track('screen_view', { screen: 'venue_profile' }, user.id);
      
      const response = await venuesApi.getByUserId(user.id);
      if (response.data?.venues) {
        const mappedVenues: Venue[] = response.data.venues.map((v: any) => ({
          id: v.id,
          name: v.name,
          email: v.email,
          phone: v.phone,
          address: v.address,
          type: v.type as VenueType,
          esrbRating: v.esrb_rating as EsrbRating,
          typicalGenres: v.typical_genres || [],
          stageDetails: v.stage_details || { size: '', availableOutlets: 0, adaAccessible: false },
          equipmentOnsite: v.equipment_onsite || [],
          specialInstructions: v.special_instructions || '',
          userId: v.user_id,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        }));
        setVenues(mappedVenues);
        if (mappedVenues.length > 0) {
          setSelectedVenue(mappedVenues[0]);
          populateForm(mappedVenues[0]);
        }
      }
    };
    loadVenues();
  }, []);

  const populateForm = (venue: Venue) => {
    setName(venue.name);
    setEmail(venue.email);
    setPhone(venue.phone);
    setAddress(venue.address);
    setType(venue.type);
    setEsrbRating(venue.esrbRating);
    setTypicalGenres(venue.typicalGenres);
    setStageSize(venue.stageDetails.size);
    setAvailableOutlets(venue.stageDetails.availableOutlets);
    setAdaAccessible(venue.stageDetails.adaAccessible);
    setEquipmentOnsite(venue.equipmentOnsite);
    setSpecialInstructions(venue.specialInstructions || '');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Venue name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!address.trim()) e.address = "Address is required";
    if (typicalGenres.length === 0) e.typicalGenres = "At least one genre is required";
    
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
      const venueData = {
        name,
        email,
        phone,
        address,
        type,
        esrb_rating: esrbRating,
        typical_genres: typicalGenres,
        stage_details: { size: stageSize, availableOutlets, adaAccessible },
        equipment_onsite: equipmentOnsite,
        special_instructions: specialInstructions,
        user_id: user.id,
      };
      
      let response;
      if (isAddingNew) {
        response = await venuesApi.create(venueData);
        await analyticsApi.track('profile_updated', { action: 'venue_created' }, user.id);
      } else if (selectedVenue) {
        response = await venuesApi.update({ id: selectedVenue.id, ...venueData });
        await analyticsApi.track('profile_updated', { action: 'venue_updated' }, user.id);
      }
      
      if (response?.data?.venue) {
        const v = response.data.venue;
        const updatedVenue: Venue = {
          id: v.id,
          name: v.name,
          email: v.email,
          phone: v.phone,
          address: v.address,
          type: v.type as VenueType,
          esrbRating: v.esrb_rating as EsrbRating,
          typicalGenres: v.typical_genres || [],
          stageDetails: v.stage_details || { size: '', availableOutlets: 0, adaAccessible: false },
          equipmentOnsite: v.equipment_onsite || [],
          specialInstructions: v.special_instructions || '',
          userId: v.user_id,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        };
        
        if (isAddingNew) {
          setVenues(prev => [...prev, updatedVenue]);
        } else {
          setVenues(prev => prev.map(venue => venue.id === updatedVenue.id ? updatedVenue : venue));
        }
        setSelectedVenue(updatedVenue);
      }
      
      setIsEditing(false);
      setIsAddingNew(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    populateForm(venue);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setSelectedVenue(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setType(VenueType.BAR);
    setEsrbRating(EsrbRating.FAMILY);
    setTypicalGenres([]);
    setStageSize('');
    setAvailableOutlets(0);
    setAdaAccessible(false);
    setEquipmentOnsite([]);
    setSpecialInstructions('');
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const toggleGenre = (genre: string) => {
    setTypicalGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleEquipment = (equipment: string) => {
    setEquipmentOnsite(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark h-screen overflow-hidden pb-safe text-white">
      <header className="sticky top-0 z-[100] bg-background-dark/80 backdrop-blur-xl pt-10 pb-4 px-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter">Venue Profile</h2>
          <div className="flex gap-2">
            <button 
              onClick={logout}
              className="size-11 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center text-slate-400 active:scale-90"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 hide-scrollbar">
        {/* Venue Selector */}
        {venues.length > 1 && !isEditing && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Your Venues</h3>
              <button
                onClick={handleAddNew}
                className="h-10 px-4 bg-primary text-white text-xs font-black rounded-xl active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-lg mr-1">add</span>
                Add Venue
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {venues.map(venue => (
                <button
                  key={venue.id}
                  onClick={() => handleSelectVenue(venue)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedVenue?.id === venue.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-black text-base">{venue.name}</div>
                  <div className="text-slate-500 text-sm mt-1">{venue.address}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Venue Form */}
        {(isEditing || venues.length <= 1) && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">
                {isAddingNew ? 'Add New Venue' : 'Edit Venue'}
              </h3>
              {!isAddingNew && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-500 text-sm font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Venue Name</label>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600"
                    placeholder="The Blue Note"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600"
                    placeholder="venue@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600"
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: undefined });
                    }}
                    className="w-full rounded-2xl border-none bg-surface-dark h-24 px-4 py-3 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600 resize-none"
                    placeholder="123 Main St, City, State 12345"
                  />
                  {errors.address && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.address}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Type of Venue</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VenueType)}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white"
                  >
                    {VENUE_TYPES.map(vt => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">ESRB Setting</label>
                  <select
                    value={esrbRating}
                    onChange={(e) => setEsrbRating(e.target.value as EsrbRating)}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white"
                  >
                    {ESRB_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Typical Genres</label>
                  <div className="relative">
                    <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
                      {GENRE_OPTIONS.map(genre => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            typicalGenres.includes(genre)
                              ? 'bg-primary text-white'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.typicalGenres && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.typicalGenres}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Stage Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Stage Size</label>
                  <input
                    value={stageSize}
                    onChange={(e) => setStageSize(e.target.value)}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600"
                    placeholder="Small, Medium, Large"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Available Outlets</label>
                  <input
                    type="number"
                    value={availableOutlets}
                    onChange={(e) => setAvailableOutlets(parseInt(e.target.value) || 0)}
                    className="w-full rounded-2xl border-none bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600"
                    placeholder="8"
                  />
                </div>

                <div className="flex items-center h-14">
                  <input
                    type="checkbox"
                    id="ada"
                    checked={adaAccessible}
                    onChange={(e) => setAdaAccessible(e.target.checked)}
                    className="w-5 h-5 text-primary rounded focus:ring-primary/50"
                  />
                  <label htmlFor="ada" className="ml-3 text-sm font-medium">ADA Accessible</label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Equipment Onsite</h4>
              <div className="relative">
                <div className="min-h-[100px] max-h-32 overflow-y-auto rounded-2xl border border-white/5 bg-surface-dark p-3 space-y-2">
                  {EQUIPMENT_OPTIONS.map(equipment => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => toggleEquipment(equipment)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        equipmentOnsite.includes(equipment)
                          ? 'bg-accent-cyan text-black'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Special Instructions</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full rounded-2xl border-none bg-surface-dark h-24 px-4 py-3 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black text-white placeholder:text-slate-600 resize-none"
                placeholder="Load in through back entrance, parking available..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={isSaving 
                ? "w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all bg-slate-800 text-slate-600"
                : "w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all bg-primary text-white shadow-primary/40 active:scale-[0.97]"
              }
            >
              {isSaving ? 'Saving...' : (isAddingNew ? 'Add Venue' : 'Save Changes')}
              {!isSaving && <span className="material-symbols-outlined text-2xl">save</span>}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default VenueProfile;
