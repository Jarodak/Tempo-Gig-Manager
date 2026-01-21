import { usersApi, venuesApi, artistsApi } from '../utils/api';
import { UserRole } from '../types';

const STORAGE_KEY = 'tempo_user';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  faceVerified: boolean;
  profileCompleted: boolean;
  createdAt: string;
}

// Get current user from localStorage
export const getCurrentUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Save user to localStorage
export const setCurrentUser = (user: AuthUser): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

// Clear user from localStorage
export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Check if logged in
export const isLoggedIn = (): boolean => {
  return !!getCurrentUser();
};

// Sign up a new user
export const signUp = async (data: {
  email?: string;
  phone?: string;
  password?: string;
  role: 'venue' | 'artist' | 'band';
}): Promise<{ user: AuthUser; error?: string }> => {
  const response = await usersApi.create(data);
  
  if (response.error || !response.data?.user) {
    return { user: null as any, error: response.error || 'Signup failed' };
  }
  
  const user: AuthUser = {
    id: response.data.user.id,
    email: response.data.user.email,
    phone: response.data.user.phone,
    role: response.data.user.role === 'venue' ? UserRole.VENUE : 
          response.data.user.role === 'artist' ? UserRole.ARTIST : UserRole.BAND,
    twoFactorEnabled: response.data.user.two_factor_enabled,
    faceVerified: response.data.user.face_verified,
    profileCompleted: response.data.user.profile_completed,
    createdAt: response.data.user.created_at,
  };
  
  setCurrentUser(user);
  return { user };
};

// Log in existing user
export const logIn = async (email: string): Promise<{ user: AuthUser; error?: string }> => {
  const response = await usersApi.getByEmail(email);
  
  if (response.error || !response.data?.user) {
    return { user: null as any, error: response.error || 'User not found' };
  }
  
  const user: AuthUser = {
    id: response.data.user.id,
    email: response.data.user.email,
    phone: response.data.user.phone,
    role: response.data.user.role === 'venue' ? UserRole.VENUE : 
          response.data.user.role === 'artist' ? UserRole.ARTIST : UserRole.BAND,
    twoFactorEnabled: response.data.user.two_factor_enabled,
    faceVerified: response.data.user.face_verified,
    profileCompleted: response.data.user.profile_completed,
    createdAt: response.data.user.created_at,
  };
  
  setCurrentUser(user);
  return { user };
};

// Log out
export const logOut = (): void => {
  clearCurrentUser();
};

// Update user settings (2FA, face verification, profile completion)
export const updateUserSettings = async (data: {
  twoFactorEnabled?: boolean;
  faceVerified?: boolean;
  profileCompleted?: boolean;
}): Promise<{ success: boolean; error?: string }> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Not logged in' };
  }
  
  const response = await usersApi.update({
    id: currentUser.id,
    two_factor_enabled: data.twoFactorEnabled,
    face_verified: data.faceVerified,
    profile_completed: data.profileCompleted,
  });
  
  if (response.error || !response.data?.user) {
    return { success: false, error: response.error || 'Update failed' };
  }
  
  // Update local storage
  const updatedUser: AuthUser = {
    ...currentUser,
    twoFactorEnabled: response.data.user.two_factor_enabled,
    faceVerified: response.data.user.face_verified,
    profileCompleted: response.data.user.profile_completed,
  };
  setCurrentUser(updatedUser);
  
  return { success: true };
};

// Create venue profile after signup
export const createVenueProfile = async (data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  esrbRating: string;
  typicalGenres?: string[];
  stageDetails?: Record<string, unknown>;
  equipmentOnsite?: string[];
  specialInstructions?: string;
}): Promise<{ venueId: string; error?: string }> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { venueId: '', error: 'Not logged in' };
  }
  
  const response = await venuesApi.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    type: data.type,
    esrb_rating: data.esrbRating,
    typical_genres: data.typicalGenres,
    stage_details: data.stageDetails,
    equipment_onsite: data.equipmentOnsite,
    special_instructions: data.specialInstructions,
    user_id: currentUser.id,
  });
  
  if (response.error || !response.data?.venue) {
    return { venueId: '', error: response.error || 'Failed to create venue' };
  }
  
  return { venueId: response.data.venue.id };
};

// Create artist profile after signup
export const createArtistProfile = async (data: {
  name: string;
  genre: string[];
  instruments: string[];
  zipCode: string;
  gender: string;
  emailOrPhone: string;
  previewSong?: string;
  profilePicture?: string;
  cityOfOrigin?: string;
  openToWork?: boolean;
}): Promise<{ artistId: string; error?: string }> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { artistId: '', error: 'Not logged in' };
  }
  
  const response = await artistsApi.create({
    name: data.name,
    genre: data.genre,
    instruments: data.instruments,
    zip_code: data.zipCode,
    gender: data.gender,
    email_or_phone: data.emailOrPhone,
    preview_song: data.previewSong,
    profile_picture: data.profilePicture,
    city_of_origin: data.cityOfOrigin,
    open_to_work: data.openToWork ?? true,
    user_id: currentUser.id,
  });
  
  if (response.error || !response.data?.artist) {
    return { artistId: '', error: response.error || 'Failed to create artist profile' };
  }
  
  return { artistId: response.data.artist.id };
};

export default {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  isLoggedIn,
  signUp,
  logIn,
  logOut,
  updateUserSettings,
  createVenueProfile,
  createArtistProfile,
};
