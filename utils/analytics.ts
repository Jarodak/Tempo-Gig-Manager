export type AnalyticsEventType = 
  | 'screen_view'
  | 'signup_started'
  | 'signup_completed'
  | 'login'
  | 'logout'
  | 'profile_updated'
  | 'gig_created'
  | 'gig_applied'
  | 'gig_published'
  | 'band_created'
  | 'band_member_invited'
  | 'opening_posted'
  | 'availability_updated'
  | 'filter_applied'
  | 'two_factor_setup'
  | 'face_verification_started'
  | 'face_verification_completed';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;
  userId?: string;
  properties?: Record<string, unknown>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  track(type: AnalyticsEventType, properties?: Record<string, unknown>) {
    const event: AnalyticsEvent = {
      type,
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      properties,
    };

    this.events.push(event);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', type, properties);
    }

    // TODO: Send to analytics backend
    // this.sendToBackend(event);
  }

  trackScreenView(screenName: string) {
    this.track('screen_view', { screen: screenName });
  }

  trackSignupStarted(method: 'email' | 'google' | 'apple' | 'facebook') {
    this.track('signup_started', { method });
  }

  trackSignupCompleted(role: string) {
    this.track('signup_completed', { role });
  }

  trackLogin(method: 'email' | 'google' | 'apple' | 'facebook') {
    this.track('login', { method });
  }

  trackLogout() {
    this.track('logout');
  }

  trackProfileUpdated(profileType: 'artist' | 'venue' | 'band') {
    this.track('profile_updated', { profileType });
  }

  trackGigCreated(gigId?: string, isRecurring?: boolean) {
    this.track('gig_created', { gigId, isRecurring });
  }

  trackGigApplied(gigId: string) {
    this.track('gig_applied', { gigId });
  }

  trackGigPublished(gigId: string) {
    this.track('gig_published', { gigId });
  }

  trackBandCreated(bandId?: string) {
    this.track('band_created', { bandId });
  }

  trackBandMemberInvited(bandId: string) {
    this.track('band_member_invited', { bandId });
  }

  trackOpeningPosted(bandId: string, instrument: string) {
    this.track('opening_posted', { bandId, instrument });
  }

  trackAvailabilityUpdated(date: string, status: string) {
    this.track('availability_updated', { date, status });
  }

  trackFilterApplied(filterType: string, value: unknown) {
    this.track('filter_applied', { filterType, value });
  }

  trackTwoFactorSetup(method: 'sms' | 'authenticator') {
    this.track('two_factor_setup', { method });
  }

  trackFaceVerificationStarted() {
    this.track('face_verification_started');
  }

  trackFaceVerificationCompleted(success: boolean) {
    this.track('face_verification_completed', { success });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();
export default analytics;
