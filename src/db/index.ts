import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
<<<<<<< HEAD
  connectionString: "postgresql://postgres:@#PFIM22@$86@db.zbmlzqjhdicvgayzlfap.supabase.co:5432/postgres",
=======
  connectionString: process.env.DATABASE_URL,
>>>>>>> e9c4a5b (chore: atualiza estrutura do projeto e usa variaveis de ambiente)
});

export const db = drizzle(pool, { schema });