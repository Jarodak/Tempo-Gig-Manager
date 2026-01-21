// Script to create an admin user
// Usage: node scripts/create-admin.mjs <username> <password>

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node scripts/create-admin.mjs <username> <password>');
  process.exit(1);
}

// Hash function matching the one in admin.js
async function hashPassword(pwd) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd + 'tempo_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createAdmin() {
  const sql = neon(DATABASE_URL);
  
  // Create admin_users table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      username text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz
    );
  `;
  
  const passwordHash = await hashPassword(password);
  
  // Check if user already exists
  const [existing] = await sql`SELECT id FROM admin_users WHERE username = ${username}`;
  
  if (existing) {
    // Update password
    await sql`UPDATE admin_users SET password_hash = ${passwordHash} WHERE username = ${username}`;
    console.log(`✓ Updated password for admin user: ${username}`);
  } else {
    // Create new user
    await sql`INSERT INTO admin_users (username, password_hash) VALUES (${username}, ${passwordHash})`;
    console.log(`✓ Created admin user: ${username}`);
  }
  
  // List all admin users
  const admins = await sql`SELECT username, created_at, last_login FROM admin_users`;
  console.log('\nAdmin users:');
  admins.forEach(a => {
    console.log(`  - ${a.username} (created: ${a.created_at})`);
  });
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
