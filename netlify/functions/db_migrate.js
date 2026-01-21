import { checkDb, json } from './_db.js';

export const handler = async (event) => {
  try {
    const sql = checkDb();
    
    // Check for migration token if set
    const token = process.env.MIGRATE_TOKEN;
    if (token && event.headers?.['x-migrate-token'] !== token) {
      return json(403, { error: 'Invalid migration token' });
    }

    // Create extensions
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email text UNIQUE,
        phone text UNIQUE,
        role text NOT NULL CHECK (role IN ('venue', 'artist', 'band')),
        two_factor_enabled boolean DEFAULT false,
        face_verified boolean DEFAULT false,
        profile_completed boolean DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Venues table
    await sql`
      CREATE TABLE IF NOT EXISTS venues (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        email text NOT NULL,
        phone text NOT NULL,
        address text NOT NULL,
        type text NOT NULL CHECK (type IN ('hotel', 'restaurant', 'bar', 'dive', 'church')),
        esrb_rating text NOT NULL CHECK (esrb_rating IN ('family', '21+', 'nsfw')),
        typical_genres text[],
        stage_details jsonb NOT NULL DEFAULT '{}',
        equipment_onsite text[] DEFAULT '{}',
        special_instructions text,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Artists table
    await sql`
      CREATE TABLE IF NOT EXISTS artists (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        genre text[] NOT NULL,
        instruments text[] NOT NULL,
        zip_code text NOT NULL,
        gender text NOT NULL,
        email_or_phone text NOT NULL,
        preview_song text,
        profile_picture text,
        city_of_origin text,
        open_to_work boolean DEFAULT true,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        face_verified boolean DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Bands table
    await sql`
      CREATE TABLE IF NOT EXISTS bands (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        image text,
        phone text NOT NULL,
        email text NOT NULL,
        genre text NOT NULL,
        equipment text[] DEFAULT '{}',
        profile_picture text NOT NULL,
        social_links jsonb DEFAULT '{}',
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Band members table
    await sql`
      CREATE TABLE IF NOT EXISTS band_members (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        role text NOT NULL,
        instrument text NOT NULL,
        email text,
        phone text,
        band_id uuid NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Enhanced gigs table
    await sql`
      DROP TABLE IF EXISTS gigs CASCADE;
      CREATE TABLE gigs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text NOT NULL,
        venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
        venue text NOT NULL,
        location text NOT NULL,
        date text NOT NULL,
        time text NOT NULL,
        price text NOT NULL,
        genre text[] NOT NULL,
        is_verified boolean DEFAULT false,
        image text,
        stage text,
        is_recurring boolean DEFAULT false,
        frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly')),
        status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'confirmed', 'applied', 'pending')),
        is_tips_only boolean DEFAULT false,
        payment_type text NOT NULL CHECK (payment_type IN ('tips', 'hourly', 'flat_fee', 'in_kind')),
        esrb_rating text NOT NULL CHECK (esrb_rating IN ('family', '21+', 'nsfw')),
        equipment_provided text[] DEFAULT '{}',
        posting_schedule jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Gig applicants table
    await sql`
      CREATE TABLE IF NOT EXISTS gig_applicants (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        band_id uuid NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
        band_name text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        rank integer,
        gig_id uuid NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
        UNIQUE(gig_id, band_id)
      );
    `;

    // Calendar availability table
    await sql`
      CREATE TABLE IF NOT EXISTS calendar_availability (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date date NOT NULL,
        is_available boolean DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(user_id, date)
      );
    `;

    // Analytics events table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        event text NOT NULL,
        properties jsonb DEFAULT '{}',
        timestamp timestamptz NOT NULL DEFAULT now(),
        user_id uuid REFERENCES users(id) ON DELETE SET NULL
      );
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_gigs_venue_id ON gigs(venue_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gig_applicants_gig_id ON gig_applicants(gig_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_venues_user_id ON venues(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bands_user_id ON bands(user_id);`;

    // Admin users table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        username text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        last_login timestamptz
      );
    `;

    return json(200, { ok: true });
  } catch (err) {
    console.error('Migration error:', err);
    return json(500, { error: 'Migration failed', details: err.message });
  }
};
