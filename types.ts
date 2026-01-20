
export enum UserRole {
  VENUE = 'VENUE',
  ARTIST = 'ARTIST',
  NONE = 'NONE'
}

export enum AppView {
  // Auth Views
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNUP_VENUE = 'SIGNUP_VENUE',
  SIGNUP_ARTIST = 'SIGNUP_ARTIST',

  // Venue Views
  VENUE_DASHBOARD = 'VENUE_DASHBOARD',
  VENUE_SCHEDULE = 'VENUE_SCHEDULE',
  VENUE_ONBOARDING = 'VENUE_ONBOARDING',
  VENUE_PROFILE = 'VENUE_PROFILE',
  VENUE_ROSTER = 'VENUE_ROSTER',
  VENUE_DISCOVER = 'VENUE_DISCOVER',
  CREATE_GIG = 'CREATE_GIG',
  INVITE_ARTIST = 'INVITE_ARTIST',
  RANKING = 'RANKING',
  
  // Artist Views
  ARTIST_FEED = 'ARTIST_FEED',
  ARTIST_PROFILE = 'ARTIST_PROFILE',
  ARTIST_ROSTER = 'ARTIST_ROSTER',
  ARTIST_SCHEDULE = 'ARTIST_SCHEDULE',
  ONBOARDING = 'ONBOARDING',
  AGREEMENT = 'AGREEMENT'
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  rating: number;
  type: string;
  image: string;
  avgDraw: string;
  bio?: string;
  members?: number;
  equipment?: string[];
}

export interface Gig {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  price: string;
  genre: string;
  isVerified: boolean;
  image: string;
  stage?: string;
  isRecurring?: boolean;
  frequency?: 'weekly' | 'monthly' | 'biweekly';
  status?: 'confirmed' | 'pending' | 'draft' | 'applied';
  isTipsOnly?: boolean;
}

export interface CalendarDay {
  dayName: string;
  dayNumber: number;
  hasEvent?: boolean;
  isToday?: boolean;
}
