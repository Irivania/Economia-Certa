import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.NEXT_PUBLIC_DATABASE_URL || 
  "postgresql://postgres:SUA_SENHA_AQUI@db.zbmlzqjhdicvgayzlfap.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });