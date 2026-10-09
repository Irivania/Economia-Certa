import { db } from '../src/db/db';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function runTest() {
  console.log('A testar ligação à base de dados e hash de senha...');
  
  const hashedPassword = await bcrypt.hash('senha123', 10);
  console.log('Hash gerado com sucesso:', hashedPassword);
  
  const allUsers = await db.select().from(users).limit(5);
  console.log('Utilizadores encontrados na BD:', allUsers.length);
}

runTest().catch(console.error);