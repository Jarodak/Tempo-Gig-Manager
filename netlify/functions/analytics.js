import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { event: eventName, properties, user_id } = body;
      
      if (!eventName) {
        return json(400, { error: 'event name required' });
      }
      
      const [record] = await sql`
        INSERT INTO analytics_events (event, properties, user_id)
        VALUES (${eventName}, ${JSON.stringify(properties || {})}, ${user_id ? user_id : null}::uuid)
        RETURNING id::text, event, properties, timestamp, user_id::text
      `;
      
      return json(201, { event: record });
    }
    
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      // Get events for a user or all events (admin)
      if (params.user_id) {
        const events = await sql`
          SELECT id::text, event, properties, timestamp, user_id::text
          FROM analytics_events 
          WHERE user_id = ${params.user_id}::uuid
          ORDER BY timestamp DESC
          LIMIT 100
        `;
        return json(200, { events });
      }
      
      // Get event counts by type
      if (params.summary === 'true') {
        const summary = await sql`
          SELECT event, COUNT(*) as count
          FROM analytics_events
          WHERE timestamp > now() - interval '30 days'
          GROUP BY event
          ORDER BY count DESC
        `;
        return json(200, { summary });
      }
      
      return json(400, { error: 'user_id or summary=true parameter required' });
    }
    
    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('analytics error:', err);
    return json(500, { error: 'Operation failed', details: err.message });
  }
};
