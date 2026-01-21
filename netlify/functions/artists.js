import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      if (params.id) {
        const [artist] = await sql`
          SELECT id::text, name, genre, instruments, zip_code, gender, email_or_phone,
                 preview_song, profile_picture, city_of_origin, open_to_work, bio, face_verified,
                 user_id::text, created_at, updated_at
          FROM artists WHERE id = ${params.id}::uuid
        `;
        return artist ? json(200, { artist }) : json(404, { error: 'Artist not found' });
      }
      
      if (params.user_id) {
        const [artist] = await sql`
          SELECT id::text, name, genre, instruments, zip_code, gender, email_or_phone,
                 preview_song, profile_picture, city_of_origin, open_to_work, bio, face_verified,
                 user_id::text, created_at, updated_at
          FROM artists WHERE user_id = ${params.user_id}::uuid
        `;
        return artist ? json(200, { artist }) : json(404, { error: 'Artist not found' });
      }
      
      // List all artists (with optional filters)
      const artists = await sql`
        SELECT id::text, name, genre, instruments, zip_code, city_of_origin, open_to_work, 
               profile_picture, face_verified, created_at
        FROM artists
        WHERE open_to_work = true
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return json(200, { artists });
    }
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, genre, instruments, zip_code, gender, email_or_phone, 
              preview_song, profile_picture, city_of_origin, open_to_work, bio, user_id } = body;
      
      if (!name || !genre || !instruments || !user_id) {
        return json(400, { error: 'Missing required fields: name, genre, instruments, user_id' });
      }
      
      const [artist] = await sql`
        INSERT INTO artists (name, genre, instruments, zip_code, gender, email_or_phone,
                            preview_song, profile_picture, city_of_origin, open_to_work, bio, user_id)
        VALUES (${name}, ${genre}, ${instruments}, ${zip_code || null}, ${gender || null}, ${email_or_phone || null},
                ${preview_song || null}, ${profile_picture || null}, ${city_of_origin || null}, ${open_to_work ?? true}, ${bio || null}, ${user_id}::uuid)
        RETURNING id::text, name, genre, instruments, zip_code, gender, email_or_phone,
                  preview_song, profile_picture, city_of_origin, open_to_work, bio, face_verified,
                  user_id::text, created_at, updated_at
      `;
      
      return json(201, { artist });
    }
    
    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const { id, ...updates } = body;
      
      if (!id) {
        return json(400, { error: 'Artist id required' });
      }
      
      const [artist] = await sql`
        UPDATE artists SET
          name = COALESCE(${updates.name}, name),
          genre = COALESCE(${updates.genre}, genre),
          instruments = COALESCE(${updates.instruments}, instruments),
          zip_code = COALESCE(${updates.zip_code}, zip_code),
          gender = COALESCE(${updates.gender}, gender),
          email_or_phone = COALESCE(${updates.email_or_phone}, email_or_phone),
          preview_song = COALESCE(${updates.preview_song}, preview_song),
          profile_picture = COALESCE(${updates.profile_picture}, profile_picture),
          city_of_origin = COALESCE(${updates.city_of_origin}, city_of_origin),
          open_to_work = COALESCE(${updates.open_to_work}, open_to_work),
          bio = COALESCE(${updates.bio}, bio),
          face_verified = COALESCE(${updates.face_verified}, face_verified),
          updated_at = now()
        WHERE id = ${id}::uuid
        RETURNING id::text, name, genre, instruments, zip_code, gender, email_or_phone,
                  preview_song, profile_picture, city_of_origin, open_to_work, bio, face_verified,
                  user_id::text, created_at, updated_at
      `;
      
      return artist ? json(200, { artist }) : json(404, { error: 'Artist not found' });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('artists error:', err);
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
