import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.NEXT_PUBLIC_DATABASE_URL || 
  "postgresql://postgres:SUA_SENHA_AQUI@db.zbmlzqjhdicvgayzlfap.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString,
  // Configurações robustas para evitar timeouts com o Supabase na nuvem
  connectionTimeoutMillis: 10000, // Espera até 10 segundos para estabelecer a conexão
  idleTimeoutMillis: 30000,        // Mantém conexões ociosas abertas por 30 segundos
  max: 10,                       // Número máximo de clientes no pool
});

export const db = drizzle(pool, { schema });