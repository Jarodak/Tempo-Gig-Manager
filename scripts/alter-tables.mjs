// Script to alter existing tables to make fields optional and add bio
// Run: DATABASE_URL="..." node scripts/alter-tables.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function alterTables() {
  const sql = neon(DATABASE_URL);
  
  console.log('Altering tables...\n');

  // Alter venues table - make email, phone, address nullable
  try {
    await sql`ALTER TABLE venues ALTER COLUMN email DROP NOT NULL`;
    console.log('✓ venues.email is now nullable');
  } catch (e) {
    console.log('  venues.email already nullable or error:', e.message);
  }

  try {
    await sql`ALTER TABLE venues ALTER COLUMN phone DROP NOT NULL`;
    console.log('✓ venues.phone is now nullable');
  } catch (e) {
    console.log('  venues.phone already nullable or error:', e.message);
  }

  try {
    await sql`ALTER TABLE venues ALTER COLUMN address DROP NOT NULL`;
    console.log('✓ venues.address is now nullable');
  } catch (e) {
    console.log('  venues.address already nullable or error:', e.message);
  }

  // Alter artists table - make zip_code, gender, email_or_phone nullable
  try {
    await sql`ALTER TABLE artists ALTER COLUMN zip_code DROP NOT NULL`;
    console.log('✓ artists.zip_code is now nullable');
  } catch (e) {
    console.log('  artists.zip_code already nullable or error:', e.message);
  }

  try {
    await sql`ALTER TABLE artists ALTER COLUMN gender DROP NOT NULL`;
    console.log('✓ artists.gender is now nullable');
  } catch (e) {
    console.log('  artists.gender already nullable or error:', e.message);
  }

  try {
    await sql`ALTER TABLE artists ALTER COLUMN email_or_phone DROP NOT NULL`;
    console.log('✓ artists.email_or_phone is now nullable');
  } catch (e) {
    console.log('  artists.email_or_phone already nullable or error:', e.message);
  }

  // Add bio column to artists if it doesn't exist
  try {
    await sql`ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio text`;
    console.log('✓ artists.bio column added');
  } catch (e) {
    console.log('  artists.bio already exists or error:', e.message);
  }

  console.log('\n✓ Table alterations complete!');
}

alterTables().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
