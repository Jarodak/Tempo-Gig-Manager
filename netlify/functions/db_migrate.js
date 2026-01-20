import { sql, json } from './_db.js';

export const handler = async (event) => {
  try {
    const requiredToken = process.env.MIGRATE_TOKEN;
    if (requiredToken) {
      const token = event.headers?.['x-migrate-token'] ?? event.headers?.['X-Migrate-Token'];
      if (token !== requiredToken) {
        return json(401, { error: 'Unauthorized' });
      }
    }

    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE,
        role text NOT NULL CHECK (role IN ('VENUE', 'ARTIST')),
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS venues (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name text NOT NULL,
        venue_type text,
        capacity integer,
        address text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS artists (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name text NOT NULL,
        genre text,
        bio text,
        image text,
        avg_draw text,
        members integer,
        equipment text[],
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS gigs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        venue text NOT NULL,
        location text NOT NULL,
        date text NOT NULL,
        time text NOT NULL,
        price text NOT NULL,
        genre text NOT NULL,
        is_verified boolean NOT NULL DEFAULT false,
        image text NOT NULL DEFAULT '',
        stage text,
        is_recurring boolean,
        frequency text,
        status text,
        is_tips_only boolean,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: 'Migration failed' });
  }
};
