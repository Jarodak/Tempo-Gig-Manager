import { checkDb, json } from './_db.js';

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
      const { email, phone, role } = body;
      
      if (!role || !['venue', 'artist', 'band'].includes(role)) {
        return json(400, { error: 'Valid role required (venue, artist, band)' });
      }
      
      if (!email && !phone) {
        return json(400, { error: 'Email or phone required' });
      }
      
      const [user] = await sql`
        INSERT INTO users (email, phone, role)
        VALUES (${email}, ${phone}, ${role})
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
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
