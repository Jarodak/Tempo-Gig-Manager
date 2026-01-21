// Admin API endpoint for dashboard management
// Protected by admin_users table authentication

import { checkDb, json } from './_db.js';

// Simple hash function for password (use bcrypt in production)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'tempo_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const handler = async (event) => {
  const { httpMethod, queryStringParameters, headers, body } = event;
  
  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      },
      body: '',
    };
  }
  
  try {
    const sql = checkDb();
    const resource = queryStringParameters?.resource;
    
    // Login endpoint - no auth required
    if (httpMethod === 'POST' && resource === 'login') {
      const { username, password } = JSON.parse(body || '{}');
      
      if (!username || !password) {
        return json(400, { error: 'Username and password required' });
      }
      
      const passwordHash = await hashPassword(password);
      
      const [admin] = await sql`
        SELECT id::text, username FROM admin_users 
        WHERE username = ${username} AND password_hash = ${passwordHash}
      `;
      
      if (!admin) {
        return json(401, { error: 'Invalid credentials' });
      }
      
      // Update last login
      await sql`UPDATE admin_users SET last_login = now() WHERE id = ${admin.id}::uuid`;
      
      // Create simple token (use JWT in production)
      const token = Buffer.from(JSON.stringify({ 
        id: admin.id, 
        username: admin.username,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })).toString('base64');
      
      return json(200, { token, username: admin.username });
    }
    
    // All other endpoints require authentication
    const authToken = headers['x-admin-token'];
    
    if (!authToken) {
      return json(401, { error: 'Authentication required' });
    }
    
    try {
      const tokenData = JSON.parse(Buffer.from(authToken, 'base64').toString());
      if (tokenData.exp < Date.now()) {
        return json(401, { error: 'Token expired' });
      }
      
      // Verify admin still exists
      const [admin] = await sql`SELECT id FROM admin_users WHERE id = ${tokenData.id}::uuid`;
      if (!admin) {
        return json(401, { error: 'Invalid token' });
      }
    } catch (e) {
      return json(401, { error: 'Invalid token' });
    }
    
    // GET - Fetch data
    if (httpMethod === 'GET') {
      switch (resource) {
        case 'stats': {
          const [userCount] = await sql`SELECT COUNT(*) as count FROM users`;
          const [venueCount] = await sql`SELECT COUNT(*) as count FROM venues`;
          const [artistCount] = await sql`SELECT COUNT(*) as count FROM artists`;
          const [bandCount] = await sql`SELECT COUNT(*) as count FROM bands`;
          const [gigCount] = await sql`SELECT COUNT(*) as count FROM gigs`;
          
          const recentUsers = await sql`
            SELECT id::text, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
          `;
          
          const recentGigs = await sql`
            SELECT id::text, title, venue, status, created_at 
            FROM gigs 
            ORDER BY created_at DESC 
            LIMIT 5
          `;
          
          return json(200, {
            stats: {
              users: parseInt(userCount.count),
              venues: parseInt(venueCount.count),
              artists: parseInt(artistCount.count),
              bands: parseInt(bandCount.count),
              gigs: parseInt(gigCount.count),
            },
            recentUsers,
            recentGigs,
          });
        }
        
        case 'users': {
          const users = await sql`
            SELECT id::text, email, phone, role, two_factor_enabled, face_verified, profile_completed, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 100
          `;
          return json(200, { users });
        }
        
        case 'venues': {
          const venues = await sql`
            SELECT v.id::text, v.name, v.email, v.phone, v.address, v.type, v.esrb_rating, v.created_at,
                   u.email as owner_email
            FROM venues v
            LEFT JOIN users u ON v.user_id = u.id
            ORDER BY v.created_at DESC
            LIMIT 100
          `;
          return json(200, { venues });
        }
        
        case 'artists': {
          const artists = await sql`
            SELECT a.id::text, a.name, a.genre, a.instruments, a.city_of_origin, a.open_to_work, a.created_at,
                   u.email as owner_email
            FROM artists a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 100
          `;
          return json(200, { artists });
        }
        
        case 'bands': {
          const bands = await sql`
            SELECT b.id::text, b.name, b.genre, b.email, b.phone, b.created_at,
                   u.email as owner_email
            FROM bands b
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 100
          `;
          return json(200, { bands });
        }
        
        case 'gigs': {
          const gigs = await sql`
            SELECT g.id::text, g.title, g.venue, g.location, g.date, g.time, g.price, g.genre, g.status, g.payment_type, g.created_at
            FROM gigs g
            ORDER BY g.created_at DESC
            LIMIT 100
          `;
          return json(200, { gigs });
        }
        
        case 'analytics': {
          const events = await sql`
            SELECT event, COUNT(*) as count
            FROM analytics_events
            GROUP BY event
            ORDER BY count DESC
          `;
          
          const recentEvents = await sql`
            SELECT id::text, event, properties, timestamp, user_id::text
            FROM analytics_events
            ORDER BY timestamp DESC
            LIMIT 50
          `;
          
          return json(200, { eventCounts: events, recentEvents });
        }
        
        default:
          return json(400, { error: 'Invalid resource. Use: stats, users, venues, artists, bands, gigs, analytics' });
      }
    }
    
    // DELETE - Remove records
    if (httpMethod === 'DELETE') {
      const id = queryStringParameters?.id;
      if (!id) {
        return json(400, { error: 'ID required for deletion' });
      }
      
      switch (resource) {
        case 'users': {
          await sql`DELETE FROM users WHERE id = ${id}::uuid`;
          return json(200, { ok: true, message: 'User deleted' });
        }
        case 'venues': {
          await sql`DELETE FROM venues WHERE id = ${id}::uuid`;
          return json(200, { ok: true, message: 'Venue deleted' });
        }
        case 'artists': {
          await sql`DELETE FROM artists WHERE id = ${id}::uuid`;
          return json(200, { ok: true, message: 'Artist deleted' });
        }
        case 'bands': {
          await sql`DELETE FROM bands WHERE id = ${id}::uuid`;
          return json(200, { ok: true, message: 'Band deleted' });
        }
        case 'gigs': {
          await sql`DELETE FROM gigs WHERE id = ${id}::uuid`;
          return json(200, { ok: true, message: 'Gig deleted' });
        }
        default:
          return json(400, { error: 'Invalid resource for deletion' });
      }
    }
    
    return json(405, { error: 'Method not allowed' });
    
  } catch (err) {
    console.error('Admin API error:', err);
    return json(500, { error: 'Server error', details: err.message });
  }
};
