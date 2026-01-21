import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'POST required' });
    }

    const body = event.body ? JSON.parse(event.body) : null;
    const gig = body?.gig ?? body;

    if (!gig || typeof gig !== 'object') {
      return json(400, { error: 'Invalid payload' });
    }

    const required = ['title', 'venue', 'location', 'date', 'time', 'price', 'genre'];
    for (const key of required) {
      if (!gig[key] || String(gig[key]).trim() === '') {
        return json(400, { error: `${key} is required` });
      }
    }

    const [row] = await sql`
      INSERT INTO gigs (
        title, venue, location, date, time, price, genre,
        is_verified, image, stage,
        is_recurring, frequency, status, is_tips_only
      ) VALUES (
        ${gig.title},
        ${gig.venue},
        ${gig.location},
        ${gig.date},
        ${gig.time},
        ${gig.price},
        ${gig.genre},
        ${Boolean(gig.isVerified)},
        ${gig.image ?? ''},
        ${gig.stage ?? null},
        ${gig.isRecurring ?? null},
        ${gig.frequency ?? null},
        ${gig.status ?? null},
        ${gig.isTipsOnly ?? null}
      )
      RETURNING
        id::text AS id,
        title,
        venue,
        location,
        date,
        time,
        price,
        genre,
        is_verified AS "isVerified",
        image,
        stage,
        is_recurring AS "isRecurring",
        frequency,
        status,
        is_tips_only AS "isTipsOnly";
    `;

    return json(201, { gig: row });
  } catch (err) {
    console.error('gigs_create error:', err);
    return json(500, { error: 'Failed to create gig', details: err.message });
  }
};
