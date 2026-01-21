import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ev4VYmU9KDLq@ep-red-mud-ahfysdhk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing database connection...\n');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connection successful!');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   PostgreSQL: ${result[0].pg_version.split(',')[0]}\n`);

    // Run migration
    console.log('Running database migration...\n');
    
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✅ uuid-ossp extension ready');

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
      )
    `;
    console.log('✅ users table ready');

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
      )
    `;
    console.log('✅ venues table ready');

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
      )
    `;
    console.log('✅ artists table ready');

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
      )
    `;
    console.log('✅ bands table ready');

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
      )
    `;
    console.log('✅ band_members table ready');

    await sql`
      CREATE TABLE IF NOT EXISTS gigs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text NOT NULL,
        venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
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
        payment_type text NOT NULL DEFAULT 'tips' CHECK (payment_type IN ('tips', 'hourly', 'flat_fee', 'in_kind')),
        esrb_rating text NOT NULL DEFAULT 'family' CHECK (esrb_rating IN ('family', '21+', 'nsfw')),
        equipment_provided text[] DEFAULT '{}',
        posting_schedule jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    console.log('✅ gigs table ready');

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
      )
    `;
    console.log('✅ gig_applicants table ready');

    await sql`
      CREATE TABLE IF NOT EXISTS calendar_availability (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date date NOT NULL,
        is_available boolean DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(user_id, date)
      )
    `;
    console.log('✅ calendar_availability table ready');

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        event text NOT NULL,
        properties jsonb DEFAULT '{}',
        timestamp timestamptz NOT NULL DEFAULT now(),
        user_id uuid REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    console.log('✅ analytics_events table ready');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_venues_user_id ON venues(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bands_user_id ON bands(user_id)`;
    console.log('✅ indexes created');

    // List tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 Database tables:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
