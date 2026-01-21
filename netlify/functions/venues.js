import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      if (params.id) {
        const [venue] = await sql`
          SELECT id::text, name, email, phone, address, type, esrb_rating, 
                 typical_genres, stage_details, equipment_onsite, special_instructions,
                 user_id::text, created_at, updated_at
          FROM venues WHERE id = ${params.id}::uuid
        `;
        return venue ? json(200, { venue }) : json(404, { error: 'Venue not found' });
      }
      
      if (params.user_id) {
        const venues = await sql`
          SELECT id::text, name, email, phone, address, type, esrb_rating, 
                 typical_genres, stage_details, equipment_onsite, special_instructions,
                 user_id::text, created_at, updated_at
          FROM venues WHERE user_id = ${params.user_id}::uuid
          ORDER BY created_at DESC
        `;
        return json(200, { venues });
      }
      
      return json(400, { error: 'id or user_id parameter required' });
    }
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, email, phone, address, type, esrb_rating, typical_genres, 
              stage_details, equipment_onsite, special_instructions, user_id } = body;
      
      if (!name || !type || !esrb_rating || !user_id) {
        return json(400, { error: 'Missing required fields: name, type, esrb_rating, user_id' });
      }
      
      const [venue] = await sql`
        INSERT INTO venues (name, email, phone, address, type, esrb_rating, typical_genres, 
                           stage_details, equipment_onsite, special_instructions, user_id)
        VALUES (${name}, ${email}, ${phone}, ${address}, ${type}, ${esrb_rating}, 
                ${typical_genres || []}, ${JSON.stringify(stage_details || {})}, 
                ${equipment_onsite || []}, ${special_instructions}, ${user_id}::uuid)
        RETURNING id::text, name, email, phone, address, type, esrb_rating, 
                  typical_genres, stage_details, equipment_onsite, special_instructions,
                  user_id::text, created_at, updated_at
      `;
      
      return json(201, { venue });
    }
    
    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const { id, ...updates } = body;
      
      if (!id) {
        return json(400, { error: 'Venue id required' });
      }
      
      const [venue] = await sql`
        UPDATE venues SET
          name = COALESCE(${updates.name}, name),
          email = COALESCE(${updates.email}, email),
          phone = COALESCE(${updates.phone}, phone),
          address = COALESCE(${updates.address}, address),
          type = COALESCE(${updates.type}, type),
          esrb_rating = COALESCE(${updates.esrb_rating}, esrb_rating),
          typical_genres = COALESCE(${updates.typical_genres}, typical_genres),
          stage_details = COALESCE(${updates.stage_details ? JSON.stringify(updates.stage_details) : null}::jsonb, stage_details),
          equipment_onsite = COALESCE(${updates.equipment_onsite}, equipment_onsite),
          special_instructions = COALESCE(${updates.special_instructions}, special_instructions),
          updated_at = now()
        WHERE id = ${id}::uuid
        RETURNING id::text, name, email, phone, address, type, esrb_rating, 
                  typical_genres, stage_details, equipment_onsite, special_instructions,
                  user_id::text, created_at, updated_at
      `;
      
      return venue ? json(200, { venue }) : json(404, { error: 'Venue not found' });
    }
    
    if (event.httpMethod === 'DELETE') {
      const params = event.queryStringParameters || {};
      if (!params.id) {
        return json(400, { error: 'id parameter required' });
      }
      
      await sql`DELETE FROM venues WHERE id = ${params.id}::uuid`;
      return json(200, { ok: true });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('venues error:', err);
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
