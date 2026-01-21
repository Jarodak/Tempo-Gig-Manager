// Google OAuth handler
// Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL in environment variables

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  const { httpMethod, queryStringParameters, path } = event;
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const siteUrl = process.env.SITE_URL || 'http://localhost:8888';
  const redirectUri = `${siteUrl}/.netlify/functions/auth-google`;
  
  // Step 1: Redirect to Google OAuth
  if (httpMethod === 'GET' && !queryStringParameters?.code) {
    const role = queryStringParameters?.role || 'artist';
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    
    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    return {
      statusCode: 302,
      headers: { Location: authUrl.toString() },
    };
  }
  
  // Step 2: Handle OAuth callback
  if (httpMethod === 'GET' && queryStringParameters?.code) {
    try {
      const { code, state } = queryStringParameters;
      const { role } = JSON.parse(Buffer.from(state, 'base64').toString());
      
      // Exchange code for tokens
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });
      
      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        return redirectWithError(siteUrl, 'Failed to get access token');
      }
      
      // Get user info
      const userResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const googleUser = await userResponse.json();
      
      // Create or get user in database
      const sql = checkDb();
      
      // Check if user exists
      let [user] = await sql`
        SELECT id::text, email, role, two_factor_enabled, face_verified, profile_completed
        FROM users WHERE email = ${googleUser.email}
      `;
      
      if (!user) {
        // Create new user
        [user] = await sql`
          INSERT INTO users (email, role)
          VALUES (${googleUser.email}, ${role})
          RETURNING id::text, email, role, two_factor_enabled, face_verified, profile_completed
        `;
      }
      
      // Create auth token (simple base64 for demo - use JWT in production)
      const authData = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: googleUser.name,
        picture: googleUser.picture,
        twoFactorEnabled: user.two_factor_enabled,
        faceVerified: user.face_verified,
        profileCompleted: user.profile_completed,
        provider: 'google',
      };
      
      const token = Buffer.from(JSON.stringify(authData)).toString('base64');
      
      // Redirect back to app with token
      return {
        statusCode: 302,
        headers: {
          Location: `${siteUrl}/auth-callback?token=${token}&provider=google`,
        },
      };
    } catch (err) {
      console.error('Google OAuth error:', err);
      return redirectWithError(siteUrl, err.message);
    }
  }
  
  return json(405, { error: 'Method not allowed' });
};

function redirectWithError(siteUrl, error) {
  return {
    statusCode: 302,
    headers: {
      Location: `${siteUrl}/auth-callback?error=${encodeURIComponent(error)}`,
    },
  };
}
