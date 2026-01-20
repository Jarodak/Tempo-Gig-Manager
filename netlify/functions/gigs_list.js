import { sql, json } from './_db.js';

export const handler = async () => {
  try {
    const gigs = await sql`
      SELECT
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
        is_tips_only AS "isTipsOnly"
      FROM gigs
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    return json(200, { gigs });
  } catch (_err) {
    return json(500, { error: 'Failed to list gigs' });
  }
};
