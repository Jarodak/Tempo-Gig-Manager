import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      if (params.id) {
        const [band] = await sql`
          SELECT id::text, name, image, phone, email, genre, equipment, profile_picture,
                 social_links, user_id::text, created_at, updated_at
          FROM bands WHERE id = ${params.id}::uuid
        `;
        
        if (!band) return json(404, { error: 'Band not found' });
        
        // Get band members
        const members = await sql`
          SELECT id::text, name, role, instrument, email, phone, created_at
          FROM band_members WHERE band_id = ${params.id}::uuid
        `;
        
        return json(200, { band: { ...band, members } });
      }
      
      if (params.user_id) {
        const bands = await sql`
          SELECT id::text, name, image, genre, profile_picture, created_at
          FROM bands WHERE user_id = ${params.user_id}::uuid
          ORDER BY created_at DESC
        `;
        return json(200, { bands });
      }
      
      return json(400, { error: 'id or user_id parameter required' });
    }
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, image, phone, email, genre, equipment, profile_picture, social_links, user_id } = body;
      
      if (!name || !phone || !email || !genre || !profile_picture || !user_id) {
        return json(400, { error: 'Missing required fields' });
      }
      
      const [band] = await sql`
        INSERT INTO bands (name, image, phone, email, genre, equipment, profile_picture, social_links, user_id)
        VALUES (${name}, ${image}, ${phone}, ${email}, ${genre}, ${equipment || []}, 
                ${profile_picture}, ${JSON.stringify(social_links || {})}, ${user_id}::uuid)
        RETURNING id::text, name, image, phone, email, genre, equipment, profile_picture,
                  social_links, user_id::text, created_at, updated_at
      `;
      
      return json(201, { band });
    }
    
    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const { id, ...updates } = body;
      
      if (!id) {
        return json(400, { error: 'Band id required' });
      }
      
      const [band] = await sql`
        UPDATE bands SET
          name = COALESCE(${updates.name}, name),
          image = COALESCE(${updates.image}, image),
          phone = COALESCE(${updates.phone}, phone),
          email = COALESCE(${updates.email}, email),
          genre = COALESCE(${updates.genre}, genre),
          equipment = COALESCE(${updates.equipment}, equipment),
          profile_picture = COALESCE(${updates.profile_picture}, profile_picture),
          social_links = COALESCE(${updates.social_links ? JSON.stringify(updates.social_links) : null}::jsonb, social_links),
          updated_at = now()
        WHERE id = ${id}::uuid
        RETURNING id::text, name, image, phone, email, genre, equipment, profile_picture,
                  social_links, user_id::text, created_at, updated_at
      `;
      
      return band ? json(200, { band }) : json(404, { error: 'Band not found' });
    }
    
    if (event.httpMethod === 'DELETE') {
      const params = event.queryStringParameters || {};
      if (!params.id) {
        return json(400, { error: 'id parameter required' });
      }
      
      await sql`DELETE FROM bands WHERE id = ${params.id}::uuid`;
      return json(200, { ok: true });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('bands error:', err);
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
