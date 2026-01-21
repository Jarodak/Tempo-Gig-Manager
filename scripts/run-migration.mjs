// Run database migration to create admin_users table
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function migrate() {
  const sql = neon(DATABASE_URL);
  
  console.log('Running migration...');
  
  // Create admin_users table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      username text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz
    )
  `;
  
  console.log('✓ admin_users table created/verified');
  
  // Check if admin exists
  const admins = await sql`SELECT username, created_at FROM admin_users`;
  
  if (admins.length === 0) {
    console.log('\nNo admin users found. Create one with:');
    console.log('  node scripts/create-admin.mjs <username> <password>');
  } else {
    console.log('\nExisting admin users:');
    admins.forEach(a => console.log(`  - ${a.username}`));
  }
}

migrate().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
