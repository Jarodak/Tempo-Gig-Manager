
export enum UserRole {
  NONE = 'none',
  VENUE = 'venue',
  ARTIST = 'artist',
  BAND = 'band',
}

export enum AppView {
  // Auth Views
  LANDING = 'landing',
  LOGIN = 'login',
  SIGNUP_VENUE = 'signup_venue',
  SIGNUP_ARTIST = 'signup_artist',
  AUTH_CALLBACK = 'auth_callback',
  TWO_FACTOR_SETUP = 'two_factor_setup',
  FACE_VERIFICATION = 'face_verification',
  PROFILE_COMPLETION = 'profile_completion',

  // Venue Views
  VENUE_DASHBOARD = 'venue_dashboard',
  VENUE_ONBOARDING = 'venue_onboarding',
  VENUE_SCHEDULE = 'venue_schedule',
  VENUE_ROSTER = 'venue_roster',
  VENUE_DISCOVER = 'venue_discover',
  CREATE_GIG = 'create_gig',
  INVITE_ARTIST = 'invite_artist',
  VENUE_PROFILE = 'venue_profile',
  RANKING = 'ranking',
  
  // Artist Views
  ARTIST_FEED = 'artist_feed',
  ARTIST_PROFILE = 'artist_profile',
  ARTIST_ROSTER = 'artist_roster',
  ARTIST_SCHEDULE = 'artist_schedule',
  ONBOARDING = 'onboarding',
  AGREEMENT = 'agreement',
  GIG_FINDER = 'gig_finder',
  GIG_DETAIL = 'gig_detail',
  APPLY_GIG = 'apply_gig',
  CHOOSE_BAND = 'choose_band',
  
  // Band Views
  CREATE_BAND = 'create_band',
  BAND_PROFILE = 'band_profile',
  FIND_BAND_MEMBERS = 'find_band_members',
  POST_OPENING = 'post_opening',
  
  // Calendar
  CALENDAR = 'calendar',
}

export interface Venue {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: VenueType;
  esrbRating: EsrbRating;
  typicalGenres: string[];
  stageDetails: StageDetails;
  equipmentOnsite: string[];
  specialInstructions: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum VenueType {
  HOTEL = 'hotel',
  RESTAURANT = 'restaurant',
  BAR = 'bar',
  DIVE = 'dive',
  CHURCH = 'church',
}

export enum EsrbRating {
  FAMILY = 'family',
  ADULTS_ONLY = '21+',
  NSFW = 'nsfw',
}

export interface StageDetails {
  size: string;
  availableOutlets: number;
  adaAccessible: boolean;
}

export interface Artist {
  id: string;
  name: string;
  genre: string[];
  instruments: string[];
  zipCode: string;
  gender: string;
  emailOrPhone: string;
  previewSong?: string;
  profilePicture?: string;
  cityOfOrigin?: string;
  openToWork: boolean;
  userId: string;
  faceVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Band {
  id: string;
  name: string;
  image?: string;
  members: BandMember[];
  phone: string;
  email: string;
  genre: string;
  equipment: string[];
  profilePicture: string;
  socialLinks: SocialLinks;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BandMember {
  id: string;
  name: string;
  role: string;
  instrument: string;
  email?: string;
  phone?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
}

export interface Gig {
  id: string;
  title: string;
  venueId: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  price: string;
  genre: string[];
  isVerified: boolean;
  image?: string;
  stage?: string;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  status: 'draft' | 'published' | 'confirmed' | 'applied' | 'pending';
  isTipsOnly: boolean;
  paymentType: PaymentType;
  esrbRating: EsrbRating;
  equipmentProvided: string[];
  postingSchedule?: PostingSchedule;
  applicants: GigApplicant[];
  createdAt: string;
  updatedAt: string;
}

export enum PaymentType {
  TIPS = 'tips',
  HOURLY = 'hourly',
  FLAT_FEE = 'flat_fee',
  IN_KIND = 'in_kind',
}

export interface PostingSchedule {
  occurrences: {
    date: string;
    postAt: string;
  }[];
}

export interface GigApplicant {
  id: string;
  bandId: string;
  bandName: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  rank?: number;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  faceVerified: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  date: number;
  hasGigs: boolean;
  gigs?: Gig[];
  isAvailable: boolean;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}
