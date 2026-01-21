// Admin API endpoint for dashboard management
// Protected by ADMIN_SECRET environment variable

import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  const { httpMethod, queryStringParameters, headers } = event;
  
  // Check admin authorization
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = headers['x-admin-secret'] || queryStringParameters?.secret;
  
  if (adminSecret && providedSecret !== adminSecret) {
    return json(401, { error: 'Unauthorized' });
  }
  
  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      },
      body: '',
    };
  }
  
  try {
    const sql = checkDb();
    const resource = queryStringParameters?.resource;
    
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
