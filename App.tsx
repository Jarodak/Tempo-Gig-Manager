
import React, { useState, useEffect } from 'react';
import { AppView, UserRole } from './types';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './auth';
import VenueDashboard from './pages/VenueDashboard';
import GigFinder from './pages/GigFinder';
import CreateGig from './pages/CreateGig';
import ArtistRanking from './pages/ArtistRanking';
import Onboarding from './pages/Onboarding';
import VenueOnboarding from './pages/VenueOnboarding';
import Agreement from './pages/Agreement';
import InviteArtist from './pages/InviteArtist';
import VenueSchedule from './pages/VenueSchedule';
import ArtistSchedule from './pages/ArtistSchedule';
import VenueProfile from './pages/VenueProfile';
import ArtistProfile from './pages/ArtistProfile';
import VenueRoster from './pages/VenueRoster';
import VenueDiscover from './pages/VenueDiscover';
import ArtistRoster from './pages/ArtistRoster';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignupVenue from './pages/SignupVenue';
import SignupArtist from './pages/SignupArtist';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [activeDay, setActiveDay] = useState<number>(13); 
  const [isInvited, setIsInvited] = useState<boolean>(false);

  // Restore auth state on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setRole(user.role);
      if (user.role === UserRole.VENUE) {
        setCurrentView(AppView.VENUE_DASHBOARD);
      } else {
        setCurrentView(AppView.ARTIST_FEED);
      }
    }
  }, []);

  const handleLogin = (selectedRole: UserRole, email?: string) => {
    setRole(selectedRole);
    setIsInvited(false);
    setCurrentUser({ role: selectedRole, email });
    if (selectedRole === UserRole.VENUE) {
      setCurrentView(AppView.VENUE_DASHBOARD);
    } else {
      setCurrentView(AppView.ARTIST_FEED);
    }
  };

  const handleSignup = (selectedRole: UserRole, email?: string, name?: string) => {
    setRole(selectedRole);
    setCurrentUser({ role: selectedRole, email, name });
    if (selectedRole === UserRole.VENUE) {
      setCurrentView(AppView.VENUE_ONBOARDING);
    } else {
      setCurrentView(AppView.ONBOARDING);
    }
  };

  const logout = () => {
    setRole(UserRole.NONE);
    setIsInvited(false);
    setCurrentView(AppView.LANDING);
    clearCurrentUser();
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <Landing 
          navigate={(v) => {
            setIsInvited(false);
            setCurrentView(v);
          }} 
          onInvitedClick={() => {
            setIsInvited(true);
            setCurrentView(AppView.SIGNUP_ARTIST);
          }}
        />;
      case AppView.LOGIN:
        return <Login navigate={(v) => setCurrentView(v)} onAuthSuccess={handleLogin} />;
      case AppView.SIGNUP_VENUE:
        return <SignupVenue navigate={(v) => setCurrentView(v)} onAuthSuccess={(email, name) => handleSignup(UserRole.VENUE, email, name)} />;
      case AppView.SIGNUP_ARTIST:
        return <SignupArtist navigate={(v) => setCurrentView(v)} onAuthSuccess={(email, name) => handleSignup(UserRole.ARTIST, email, name)} />;
      
      // Venue Views
      case AppView.VENUE_ONBOARDING:
        return <VenueOnboarding navigate={(v) => setCurrentView(v)} logout={logout} />;
      case AppView.VENUE_DASHBOARD:
        return <VenueDashboard navigate={(v) => setCurrentView(v)} logout={logout} onSelectDay={(day) => { setActiveDay(day); setCurrentView(AppView.VENUE_SCHEDULE); }} />;
      case AppView.VENUE_SCHEDULE:
        return <VenueSchedule navigate={(v) => setCurrentView(v)} initialDay={activeDay} />;
      case AppView.VENUE_PROFILE:
        return <VenueProfile navigate={(v) => setCurrentView(v)} logout={logout} />;
      case AppView.VENUE_ROSTER:
        return <VenueRoster navigate={(v) => setCurrentView(v)} />;
      case AppView.VENUE_DISCOVER:
        return <VenueDiscover navigate={(v) => setCurrentView(v)} />;
      case AppView.CREATE_GIG:
        return <CreateGig navigate={(v) => setCurrentView(v)} />;
      case AppView.INVITE_ARTIST:
        return <InviteArtist navigate={(v) => setCurrentView(v)} />;
      case AppView.RANKING:
        return <ArtistRanking navigate={(v) => setCurrentView(v)} />;
      
      // Artist Views
      case AppView.ONBOARDING:
        return <Onboarding navigate={(v) => setCurrentView(v)} logout={logout} isInvited={isInvited} />;
      case AppView.ARTIST_FEED:
        return <GigFinder navigate={(v) => setCurrentView(v)} logout={logout} />;
      case AppView.ARTIST_SCHEDULE:
        return <ArtistSchedule navigate={(v) => setCurrentView(v)} />;
      case AppView.ARTIST_PROFILE:
        return <ArtistProfile navigate={(v) => setCurrentView(v)} logout={logout} />;
      case AppView.ARTIST_ROSTER:
        return <ArtistRoster navigate={(v) => setCurrentView(v)} />;
      case AppView.AGREEMENT:
        return <Agreement navigate={(v) => setCurrentView(v)} />;
      
      default:
        return <Landing navigate={(v) => setCurrentView(v)} onInvitedClick={() => { setIsInvited(true); setCurrentView(AppView.SIGNUP_ARTIST); }} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background-dark">
      <div className="w-full max-w-md bg-background-dark min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
