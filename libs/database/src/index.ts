import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './lib/schema.js';

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export { schema };
