import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: "postgresql://postgres:@#PFIM22@$86@db.zbmlzqjhdicvgayzlfap.supabase.co:5432/postgres",
});

export const db = drizzle(pool, { schema });