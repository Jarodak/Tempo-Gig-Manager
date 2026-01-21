// Apple Sign In OAuth handler
// Requires: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, SITE_URL

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';

import { checkDb, json } from './_db.js';

// Generate Apple client secret (JWT)
async function generateClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  // For production, use a proper JWT library
  // This is a simplified version - in production use jose or jsonwebtoken
  const header = { alg: 'ES256', kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 86400 * 180, // 180 days
    aud: 'https://appleid.apple.com',
    sub: clientId,
  };
  
  // Note: In production, properly sign this JWT with the private key
  // For now, return a placeholder - you'll need to implement proper signing
  return Buffer.from(JSON.stringify({ header, payload })).toString('base64');
}

export const handler = async (event) => {
  const { httpMethod, queryStringParameters, body } = event;
  
  const clientId = process.env.APPLE_CLIENT_ID;
  const siteUrl = process.env.SITE_URL || 'http://localhost:8888';
  const redirectUri = `${siteUrl}/.netlify/functions/auth-apple`;
  
  // Step 1: Redirect to Apple Sign In
  if (httpMethod === 'GET' && !queryStringParameters?.code) {
    const role = queryStringParameters?.role || 'artist';
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    
    const authUrl = new URL(APPLE_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'name email');
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('state', state);
    
    return {
      statusCode: 302,
      headers: { Location: authUrl.toString() },
    };
  }
  
  // Step 2: Handle OAuth callback (Apple uses POST for form_post)
  if (httpMethod === 'POST') {
    try {
      const params = new URLSearchParams(body);
      const code = params.get('code');
      const state = params.get('state');
      const userDataStr = params.get('user'); // Apple sends user info on first auth only
      
      const { role } = JSON.parse(Buffer.from(state, 'base64').toString());
      
      // Exchange code for tokens
      const clientSecret = await generateClientSecret();
      
      const tokenResponse = await fetch(APPLE_TOKEN_URL, {
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
      
      if (!tokens.id_token) {
        return redirectWithError(siteUrl, 'Failed to get ID token');
      }
      
      // Decode ID token to get user info (simplified - use proper JWT verification in production)
      const idTokenParts = tokens.id_token.split('.');
      const idTokenPayload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());
      
      const email = idTokenPayload.email;
      let name = 'Apple User';
      
      // Parse user data if provided (first sign-in only)
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          name = `${userData.name?.firstName || ''} ${userData.name?.lastName || ''}`.trim() || name;
        } catch (e) {}
      }
      
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
        name,
        twoFactorEnabled: user.two_factor_enabled,
        faceVerified: user.face_verified,
        profileCompleted: user.profile_completed,
        provider: 'apple',
      };
      
      const token = Buffer.from(JSON.stringify(authData)).toString('base64');
      
      // Return HTML that redirects (since Apple uses form_post)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <!DOCTYPE html>
          <html>
          <head><meta http-equiv="refresh" content="0;url=${siteUrl}/auth-callback?token=${token}&provider=apple"></head>
          <body>Redirecting...</body>
          </html>
        `,
      };
    } catch (err) {
      console.error('Apple OAuth error:', err);
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
