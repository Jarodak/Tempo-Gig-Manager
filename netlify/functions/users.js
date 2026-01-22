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
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'GET') {
      // Get user by ID or email
      const params = event.queryStringParameters || {};
      
      if (params.id) {
        const [user] = await sql`
          SELECT id::text, email, phone, role, two_factor_enabled, face_verified, profile_completed, created_at
          FROM users WHERE id = ${params.id}::uuid
        `;
        return user ? json(200, { user }) : json(404, { error: 'User not found' });
      }
      
      if (params.email) {
        const [user] = await sql`
          SELECT id::text, email, phone, role, two_factor_enabled, face_verified, profile_completed, created_at
          FROM users WHERE email = ${params.email}
        `;
        return user ? json(200, { user }) : json(404, { error: 'User not found' });
      }
      
      return json(400, { error: 'id or email parameter required' });
    }
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { email, phone, password, role } = body;
      
      if (!role || !['venue', 'artist', 'band'].includes(role)) {
        return json(400, { error: 'Valid role required (venue, artist, band)' });
      }
      
      if (!email && !phone) {
        return json(400, { error: 'Email or phone required' });
      }
      
      const passwordHash = password ? await hashPassword(password) : null;
      
      const [user] = await sql`
        INSERT INTO users (email, phone, password_hash, role)
        VALUES (${email}, ${phone}, ${passwordHash}, ${role})
        RETURNING id::text, email, phone, role, two_factor_enabled, face_verified, profile_completed, created_at
      `;
      
      return json(201, { user });
    }
    
    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const { id, two_factor_enabled, face_verified, profile_completed } = body;
      
      if (!id) {
        return json(400, { error: 'User id required' });
      }
      
      const [user] = await sql`
        UPDATE users SET
          two_factor_enabled = COALESCE(${two_factor_enabled}, two_factor_enabled),
          face_verified = COALESCE(${face_verified}, face_verified),
          profile_completed = COALESCE(${profile_completed}, profile_completed),
          updated_at = now()
        WHERE id = ${id}::uuid
        RETURNING id::text, email, phone, role, two_factor_enabled, face_verified, profile_completed, created_at
      `;
      
      return user ? json(200, { user }) : json(404, { error: 'User not found' });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('users error:', err);
    // Handle duplicate email/phone constraint violation
    if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint') || err.code === '23505') {
      return json(409, { error: 'An account with this email already exists' });
    }
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
