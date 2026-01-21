// Script to add password_hash column to users table
// Run: DATABASE_URL="..." node scripts/add-password-column.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function addPasswordColumn() {
  const sql = neon(DATABASE_URL);
  
  console.log('Adding password_hash column to users table...');

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`;
    console.log('✓ password_hash column added to users table');
  } catch (e) {
    console.log('  Error or column already exists:', e.message);
  }

  console.log('\n✓ Done!');
}

addPasswordColumn().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
