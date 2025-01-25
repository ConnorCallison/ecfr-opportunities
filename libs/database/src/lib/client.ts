import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'pg';
import * as schema from './schema';

// Create postgres client
const client = pg(process.env.DATABASE_URL || '');

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export { schema };
