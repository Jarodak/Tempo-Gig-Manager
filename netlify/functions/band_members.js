import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      if (!params.band_id) {
        return json(400, { error: 'band_id parameter required' });
      }
      
      const members = await sql`
        SELECT id::text, name, role, instrument, email, phone, created_at
        FROM band_members WHERE band_id = ${params.band_id}::uuid
        ORDER BY created_at ASC
      `;
      
      return json(200, { members });
    }
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { band_id, name, role, instrument, email, phone } = body;
      
      if (!band_id || !name || !role || !instrument) {
        return json(400, { error: 'band_id, name, role, and instrument required' });
      }
      
      const [member] = await sql`
        INSERT INTO band_members (band_id, name, role, instrument, email, phone)
        VALUES (${band_id}::uuid, ${name}, ${role}, ${instrument}, ${email}, ${phone})
        RETURNING id::text, name, role, instrument, email, phone, band_id::text, created_at
      `;
      
      return json(201, { member });
    }
    
    if (event.httpMethod === 'DELETE') {
      const params = event.queryStringParameters || {};
      
      if (!params.id) {
        return json(400, { error: 'id parameter required' });
      }
      
      await sql`DELETE FROM band_members WHERE id = ${params.id}::uuid`;
      return json(200, { ok: true });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('band_members error:', err);
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
