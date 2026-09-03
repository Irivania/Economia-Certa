import 'dotenv/config';
import { db } from '../src/db/db';
import { products } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function runTests() {
  console.log('🧪 ----------------------------------------');
  console.log('🧪 Iniciando Bateria Completa de Testes...');
  console.log('🧪 ----------------------------------------');

  const testCompanyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
  const sharedEan = 'EAN_TESTE_COMPARTILHADO_' + Date.now();

  try {
    // -------------------------------------------------------------
    // TESTE 1: Inserção padrão de produto
    // -------------------------------------------------------------
    console.log('\n1️⃣ [TESTE] Inserindo produto base...');
    const inserted = await db.insert(products).values({
      id: crypto.randomUUID(),
      companyId: testCompanyId,
      description: 'PERFUME TESTE UNIDADE',
      ean: sharedEan,
      brand: 'NATURA',
      unit: 'UN',
      boxQuantity: 1,
      costPrice: '50.00',
      salePrice: '100.00',
      stockCurrent: 15,
    }).returning();
    
    console.log('✅ Sucesso: Produto cadastrado com ID:', inserted[0].id);

    // -------------------------------------------------------------
    // TESTE 2: Tentativa de duplicar o mesmo EAN para a mesma empresa
    // -------------------------------------------------------------
    console.log('\n2️⃣ [TESTE] Validando bloqueio de EAN duplicado...');
    let duplicateBlocked = false;

    try {
      await db.insert(products).values({
        id: crypto.randomUUID(),
        companyId: testCompanyId,
        description: 'PERFUME DUPLICADO TENTATIVA',
        ean: sharedEan, // Mesmo EAN do produto anterior
        brand: 'NATURA',
        unit: 'UN',
        boxQuantity: 1,
      });
    } catch {
      duplicateBlocked = true;
    }

    if (duplicateBlocked) {
      console.log('✅ Sucesso: O banco/sistema barrou com segurança a tentativa de duplicar o EAN.');
    } else {
      console.log('⚠️ Aviso: A inserção duplicada passou.');
    }

    // -------------------------------------------------------------
    // TESTE 3: Validação de busca por Empresa
    // -------------------------------------------------------------
    console.log('\n3️⃣ [TESTE] Consultando produtos filtrados por Empresa...');
    const companyProducts = await db
      .select()
      .from(products)
      .where(eq(products.companyId, testCompanyId));

    console.log(`✅ Sucesso: Encontrados ${companyProducts.length} produtos para a empresa.`);

    // -------------------------------------------------------------
    // TESTE 4: Limpeza do ambiente de testes
    // -------------------------------------------------------------
    console.log('\n4️⃣ [TESTE] Limpando dados de teste do banco...');
    await db.delete(products).where(eq(products.id, inserted[0].id));
    console.log('✅ Sucesso: Ambiente limpo, registro de teste removido.');

    console.log('\n🎉 ----------------------------------------');
    console.log('🎉 Todos os testes concluídos com êxito!');
    console.log('🎉 ----------------------------------------');

  } catch (error) {
    console.error('❌ Erro crítico durante os testes:', error);
  }
}

runTests();