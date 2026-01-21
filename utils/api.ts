const API_BASE = '/.netlify/functions';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed', details: data.details };
    }

    return { data };
  } catch (err) {
    return { error: 'Network error', details: (err as Error).message };
  }
}

// Users API
export const usersApi = {
  getById: (id: string) => request<{ user: User }>(`users?id=${id}`),
  getByEmail: (email: string) => request<{ user: User }>(`users?email=${encodeURIComponent(email)}`),
  create: (data: CreateUserData) => request<{ user: User }>('users', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: UpdateUserData) => request<{ user: User }>('users', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Venues API
export const venuesApi = {
  getById: (id: string) => request<{ venue: Venue }>(`venues?id=${id}`),
  getByUserId: (userId: string) => request<{ venues: Venue[] }>(`venues?user_id=${userId}`),
  create: (data: CreateVenueData) => request<{ venue: Venue }>('venues', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: UpdateVenueData) => request<{ venue: Venue }>('venues', { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ ok: boolean }>(`venues?id=${id}`, { method: 'DELETE' }),
};

// Artists API
export const artistsApi = {
  getById: (id: string) => request<{ artist: Artist }>(`artists?id=${id}`),
  getByUserId: (userId: string) => request<{ artist: Artist }>(`artists?user_id=${userId}`),
  list: () => request<{ artists: Artist[] }>('artists'),
  create: (data: CreateArtistData) => request<{ artist: Artist }>('artists', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: UpdateArtistData) => request<{ artist: Artist }>('artists', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Bands API
export const bandsApi = {
  getById: (id: string) => request<{ band: Band }>(`bands?id=${id}`),
  getByUserId: (userId: string) => request<{ bands: Band[] }>(`bands?user_id=${userId}`),
  create: (data: CreateBandData) => request<{ band: Band }>('bands', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: UpdateBandData) => request<{ band: Band }>('bands', { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ ok: boolean }>(`bands?id=${id}`, { method: 'DELETE' }),
};

// Band Members API
export const bandMembersApi = {
  getByBandId: (bandId: string) => request<{ members: BandMember[] }>(`band_members?band_id=${bandId}`),
  create: (data: CreateBandMemberData) => request<{ member: BandMember }>('band_members', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ ok: boolean }>(`band_members?id=${id}`, { method: 'DELETE' }),
};

// Gigs API
export const gigsApi = {
  list: () => request<{ gigs: Gig[] }>('gigs_list'),
  create: (data: CreateGigData) => request<{ gig: Gig }>('gigs_create', { method: 'POST', body: JSON.stringify(data) }),
};

// Calendar API
export const calendarApi = {
  getAvailability: (userId: string, startDate?: string, endDate?: string) => {
    let url = `calendar?user_id=${userId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    return request<{ availability: CalendarAvailability[] }>(url);
  },
  setAvailability: (data: SetAvailabilityData) => 
    request<{ availability: CalendarAvailability }>('calendar', { method: 'POST', body: JSON.stringify(data) }),
  deleteAvailability: (userId: string, date: string) => 
    request<{ ok: boolean }>(`calendar?user_id=${userId}&date=${date}`, { method: 'DELETE' }),
};

// Analytics API
export const analyticsApi = {
  track: (event: string, properties?: Record<string, unknown>, userId?: string) =>
    request<{ event: AnalyticsEvent }>('analytics', { 
      method: 'POST', 
      body: JSON.stringify({ event, properties, user_id: userId }) 
    }),
  getByUserId: (userId: string) => request<{ events: AnalyticsEvent[] }>(`analytics?user_id=${userId}`),
  getSummary: () => request<{ summary: { event: string; count: number }[] }>('analytics?summary=true'),
};

// Type definitions
interface User {
  id: string;
  email?: string;
  phone?: string;
  role: 'venue' | 'artist' | 'band';
  two_factor_enabled: boolean;
  face_verified: boolean;
  profile_completed: boolean;
  created_at: string;
}

interface CreateUserData {
  email?: string;
  phone?: string;
  role: 'venue' | 'artist' | 'band';
}

interface UpdateUserData {
  id: string;
  two_factor_enabled?: boolean;
  face_verified?: boolean;
  profile_completed?: boolean;
}

interface Venue {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  esrb_rating: string;
  typical_genres: string[];
  stage_details: Record<string, unknown>;
  equipment_onsite: string[];
  special_instructions?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateVenueData {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  esrb_rating: string;
  typical_genres?: string[];
  stage_details?: Record<string, unknown>;
  equipment_onsite?: string[];
  special_instructions?: string;
  user_id: string;
}

interface UpdateVenueData extends Partial<Omit<CreateVenueData, 'user_id'>> {
  id: string;
}

interface Artist {
  id: string;
  name: string;
  genre: string[];
  instruments: string[];
  zip_code: string;
  gender: string;
  email_or_phone: string;
  preview_song?: string;
  profile_picture?: string;
  city_of_origin?: string;
  open_to_work: boolean;
  face_verified: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateArtistData {
  name: string;
  genre: string[];
  instruments: string[];
  zip_code?: string;
  gender?: string;
  email_or_phone: string;
  preview_song?: string;
  profile_picture?: string;
  city_of_origin?: string;
  open_to_work?: boolean;
  bio?: string;
  user_id: string;
}

interface UpdateArtistData extends Partial<Omit<CreateArtistData, 'user_id'>> {
  id: string;
}

interface Band {
  id: string;
  name: string;
  image?: string;
  phone: string;
  email: string;
  genre: string;
  equipment: string[];
  profile_picture: string;
  social_links: Record<string, string>;
  user_id: string;
  members?: BandMember[];
  created_at: string;
  updated_at: string;
}

interface CreateBandData {
  name: string;
  image?: string;
  phone: string;
  email: string;
  genre: string;
  equipment?: string[];
  profile_picture: string;
  social_links?: Record<string, string>;
  user_id: string;
}

interface UpdateBandData extends Partial<Omit<CreateBandData, 'user_id'>> {
  id: string;
}

interface BandMember {
  id: string;
  name: string;
  role: string;
  instrument: string;
  email?: string;
  phone?: string;
  band_id?: string;
  created_at: string;
}

interface CreateBandMemberData {
  band_id: string;
  name: string;
  role: string;
  instrument: string;
  email?: string;
  phone?: string;
}

interface Gig {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  price: string;
  genre: string[];
  isVerified: boolean;
  image?: string;
  stage?: string;
  isRecurring?: boolean;
  frequency?: string;
  status: string;
  isTipsOnly?: boolean;
}

interface CreateGigData {
  title: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  price: string;
  genre: string[];
  isVerified?: boolean;
  image?: string;
  stage?: string;
  isRecurring?: boolean;
  frequency?: string;
  status?: string;
  isTipsOnly?: boolean;
}

interface CalendarAvailability {
  id: string;
  date: string;
  is_available: boolean;
  created_at: string;
}

interface SetAvailabilityData {
  user_id: string;
  date: string;
  is_available: boolean;
}

interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
}

export type {
  User,
  CreateUserData,
  UpdateUserData,
  Venue,
  CreateVenueData,
  UpdateVenueData,
  Artist,
  CreateArtistData,
  UpdateArtistData,
  Band,
  CreateBandData,
  UpdateBandData,
  BandMember,
  CreateBandMemberData,
  Gig,
  CreateGigData,
  CalendarAvailability,
  SetAvailabilityData,
  AnalyticsEvent,
};
