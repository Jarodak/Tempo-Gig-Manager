import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      if (!params.user_id) {
        return json(400, { error: 'user_id parameter required' });
      }
      
      // Get availability for a date range
      const startDate = params.start_date || new Date().toISOString().split('T')[0];
      const endDate = params.end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const availability = await sql`
        SELECT id::text, date::text, is_available, created_at
        FROM calendar_availability 
        WHERE user_id = ${params.user_id}::uuid
          AND date >= ${startDate}::date
          AND date <= ${endDate}::date
        ORDER BY date ASC
      `;
      
      return json(200, { availability });
    }
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { user_id, date, is_available } = body;
      
      if (!user_id || !date) {
        return json(400, { error: 'user_id and date required' });
      }
      
      // Upsert availability
      const [record] = await sql`
        INSERT INTO calendar_availability (user_id, date, is_available)
        VALUES (${user_id}::uuid, ${date}::date, ${is_available ?? true})
        ON CONFLICT (user_id, date) 
        DO UPDATE SET is_available = ${is_available ?? true}
        RETURNING id::text, date::text, is_available, created_at
      `;
      
      return json(200, { availability: record });
    }
    
    if (event.httpMethod === 'DELETE') {
      const params = event.queryStringParameters || {};
      
      if (!params.user_id || !params.date) {
        return json(400, { error: 'user_id and date parameters required' });
      }
      
      await sql`
        DELETE FROM calendar_availability 
        WHERE user_id = ${params.user_id}::uuid AND date = ${params.date}::date
      `;
      
      return json(200, { ok: true });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('calendar error:', err);
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
