// X (Twitter) OAuth 2.0 handler
// Requires: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, SITE_URL in environment variables

const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_USERINFO_URL = 'https://api.twitter.com/2/users/me';

import { checkDb, json } from './_db.js';

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const verifier = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
  // For simplicity, using plain challenge - in production use S256
  return { verifier, challenge: verifier };
}

export const handler = async (event) => {
  const { httpMethod, queryStringParameters } = event;
  
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const siteUrl = process.env.SITE_URL || 'http://localhost:8888';
  const redirectUri = `${siteUrl}/.netlify/functions/auth-twitter`;
  
  // Step 1: Redirect to Twitter OAuth
  if (httpMethod === 'GET' && !queryStringParameters?.code) {
    const role = queryStringParameters?.role || 'artist';
    const { verifier, challenge } = generatePKCE();
    const state = Buffer.from(JSON.stringify({ role, verifier })).toString('base64');
    
    const authUrl = new URL(TWITTER_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'users.read tweet.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'plain');
    
    return {
      statusCode: 302,
      headers: { Location: authUrl.toString() },
    };
  }
  
  // Step 2: Handle OAuth callback
  if (httpMethod === 'GET' && queryStringParameters?.code) {
    try {
      const { code, state } = queryStringParameters;
      const { role, verifier } = JSON.parse(Buffer.from(state, 'base64').toString());
      
      // Exchange code for tokens
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: verifier,
        }),
      });
      
      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        return redirectWithError(siteUrl, 'Failed to get access token');
      }
      
      // Get user info
      const userResponse = await fetch(`${TWITTER_USERINFO_URL}?user.fields=profile_image_url`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const { data: twitterUser } = await userResponse.json();
      
      // Twitter doesn't provide email by default - use username as identifier
      const email = `${twitterUser.username}@twitter.tempo.app`;
      
      // Create or get user in database
      const sql = checkDb();
      
      let [user] = await sql`
        SELECT id::text, email, role, two_factor_enabled, face_verified, profile_completed
        FROM users WHERE email = ${email}
      `;
      
      if (!user) {
        [user] = await sql`
          INSERT INTO users (email, role)
          VALUES (${email}, ${role})
          RETURNING id::text, email, role, two_factor_enabled, face_verified, profile_completed
        `;
      }
      
      const authData = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: twitterUser.name,
        username: twitterUser.username,
        picture: twitterUser.profile_image_url,
        twoFactorEnabled: user.two_factor_enabled,
        faceVerified: user.face_verified,
        profileCompleted: user.profile_completed,
        provider: 'twitter',
      };
      
      const token = Buffer.from(JSON.stringify(authData)).toString('base64');
      
      return {
        statusCode: 302,
        headers: {
          Location: `${siteUrl}/auth-callback?token=${token}&provider=twitter`,
        },
      };
    } catch (err) {
      console.error('Twitter OAuth error:', err);
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
