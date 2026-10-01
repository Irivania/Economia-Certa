import { db } from '@/db/db';
import { quotationItems } from '@/db/schema';

async function testQuantityParsing() {
  try {
    console.log('=== A TESTAR EXTRAÇÃO DE QUANTIDADES ===');
    const items = await db.select().from(quotationItems);

    for (const item of items) {
      const rawQtyText = String(item.requestedQuantity ?? '1').trim();
      const matchNum = rawQtyText.match(/^(\d+)/);
      const quantity = matchNum ? parseInt(matchNum[1], 10) : 1;

      console.log(`ID: ${item.id}`);
      console.log(`  -> Valor Bruto no DB: "${rawQtyText}"`);
      console.log(`  -> Quantidade Extraída: ${quantity}`);
      console.log('--------------------------------------------------');
    }
  } catch (error) {
    console.error('Erro no teste:', error);
  }
  process.exit(0);
}

testQuantityParsing();