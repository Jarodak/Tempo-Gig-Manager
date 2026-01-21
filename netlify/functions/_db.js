import { neon } from '@neondatabase/serverless';

// Use DATABASE_URL environment variable for flexibility
// Works with Netlify Neon, Supabase, Railway, Render, etc.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL not set. Database operations will fail.');
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

export const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

export const checkDb = () => {
  if (!sql) {
    throw new Error('Database not configured. Set DATABASE_URL environment variable.');
  }
  return sql;
};
