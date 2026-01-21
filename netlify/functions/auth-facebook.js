// Facebook OAuth handler
// Requires: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, SITE_URL in environment variables

const FB_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const FB_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
const FB_USERINFO_URL = 'https://graph.facebook.com/me';

import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  const { httpMethod, queryStringParameters } = event;
  
  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const siteUrl = process.env.SITE_URL || 'http://localhost:8888';
  const redirectUri = `${siteUrl}/.netlify/functions/auth-facebook`;
  
  // Step 1: Redirect to Facebook OAuth
  if (httpMethod === 'GET' && !queryStringParameters?.code) {
    const role = queryStringParameters?.role || 'artist';
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    
    const authUrl = new URL(FB_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'email,public_profile');
    authUrl.searchParams.set('state', state);
    
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
      const tokenUrl = new URL(FB_TOKEN_URL);
      tokenUrl.searchParams.set('client_id', clientId);
      tokenUrl.searchParams.set('client_secret', clientSecret);
      tokenUrl.searchParams.set('code', code);
      tokenUrl.searchParams.set('redirect_uri', redirectUri);
      
      const tokenResponse = await fetch(tokenUrl.toString());
      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        return redirectWithError(siteUrl, 'Failed to get access token');
      }
      
      // Get user info
      const userUrl = new URL(FB_USERINFO_URL);
      userUrl.searchParams.set('fields', 'id,name,email,picture');
      userUrl.searchParams.set('access_token', tokens.access_token);
      
      const userResponse = await fetch(userUrl.toString());
      const fbUser = await userResponse.json();
      
      if (!fbUser.email) {
        return redirectWithError(siteUrl, 'Email not provided by Facebook');
      }
      
      // Create or get user in database
      const sql = checkDb();
      
      let [user] = await sql`
        SELECT id::text, email, role, two_factor_enabled, face_verified, profile_completed
        FROM users WHERE email = ${fbUser.email}
      `;
      
      if (!user) {
        [user] = await sql`
          INSERT INTO users (email, role)
          VALUES (${fbUser.email}, ${role})
          RETURNING id::text, email, role, two_factor_enabled, face_verified, profile_completed
        `;
      }
      
      const authData = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: fbUser.name,
        picture: fbUser.picture?.data?.url,
        twoFactorEnabled: user.two_factor_enabled,
        faceVerified: user.face_verified,
        profileCompleted: user.profile_completed,
        provider: 'facebook',
      };
      
      const token = Buffer.from(JSON.stringify(authData)).toString('base64');
      
      return {
        statusCode: 302,
        headers: {
          Location: `${siteUrl}/auth-callback?token=${token}&provider=facebook`,
        },
      };
    } catch (err) {
      console.error('Facebook OAuth error:', err);
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
