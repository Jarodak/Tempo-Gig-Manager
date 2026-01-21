import React, { useEffect, useState } from 'react';
import { AppView, UserRole } from '../types';
import { setCurrentUser, AuthUser } from '../services/auth';

interface AuthCallbackProps {
  navigate: (view: AppView) => void;
  onAuthSuccess: (role: UserRole, email: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ navigate, onAuthSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorParam = params.get('error');
    const provider = params.get('provider');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setProcessing(false);
      return;
    }

    if (token) {
      try {
        const authData = JSON.parse(atob(token));
        
        // Map role string to UserRole enum
        const roleMap: Record<string, UserRole> = {
          venue: UserRole.VENUE,
          artist: UserRole.ARTIST,
          band: UserRole.BAND,
        };
        
        const userRole = roleMap[authData.role] || UserRole.ARTIST;
        
        // Save user to local storage
        const user: AuthUser = {
          id: authData.id,
          email: authData.email,
          role: userRole,
          twoFactorEnabled: authData.twoFactorEnabled || false,
          faceVerified: authData.faceVerified || false,
          profileCompleted: authData.profileCompleted || false,
          createdAt: new Date().toISOString(),
        };
        
        setCurrentUser(user);
        
        // Clear URL params
        window.history.replaceState({}, document.title, '/');
        
        // Navigate based on role
        onAuthSuccess(userRole, authData.email);
      } catch (err) {
        setError('Failed to process authentication');
        setProcessing(false);
      }
    } else {
      setError('No authentication token received');
      setProcessing(false);
    }
  }, [navigate, onAuthSuccess]);

  if (processing && !error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-dark text-white p-6">
        <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Signing you in...</h2>
        <p className="text-slate-500">Please wait while we complete authentication</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-dark text-white p-6">
        <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
        <p className="text-slate-500 text-center mb-6">{error}</p>
        <button
          onClick={() => navigate(AppView.LANDING)}
          className="h-14 px-8 bg-primary text-white font-bold rounded-2xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
