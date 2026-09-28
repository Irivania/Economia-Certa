import { db } from '@/db/db';
import { quotationItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function runDebug() {
  try {
    console.log('=== A INSPECIONAR ITENS DE COTAÇÃO ===');
    const items = await db.select().from(quotationItems);
    
    for (const item of items) {
      console.log('Item Bruto:', JSON.stringify(item, null, 2));
      
      if (item.productId) {
        const prodMatch = await db.select().from(products).where(eq(products.id, item.productId));
        console.log('Produto Relacionado:', JSON.stringify(prodMatch[0] ?? 'Nenhum produto encontrado com este ID', null, 2));
      } else {
        console.log('Produto Relacionado: ID do produto está vazio/nulo neste item.');
      }
      console.log('--------------------------------------------------');
    }
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
  }
  process.exit(0);
}

runDebug();