import { db } from './db/db';
import { quotationItems, products } from './db/schema';

async function testQuery() {
  try {
    console.log('A executar consulta de teste aos itens de cotação...');
    const items = await db.select().from(quotationItems).limit(5);
    console.log('--- RESULTADO BRUTO DO BANCO DE DADOS ---');
    console.log(JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Erro ao consultar banco:', error);
  }
  process.exit(0);
}

testQuery();