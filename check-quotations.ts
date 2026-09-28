import 'dotenv/config';
import { db } from './src/db/db';
import { quotations, companies, quotationSuppliers } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';

async function runCheck() {
  console.log('🧪 Simulando a query da API de cotações...');

  try {
    const results = await db
      .select({
        quotationSupplierId: quotationSuppliers.id,
        quotationId: quotations.id,
        title: quotations.title,
        startDate: quotations.startDate,
        endDate: quotations.endDate,
        closingTime: quotations.closingTime,
        status: quotationSuppliers.status,
        token: quotationSuppliers.token,
        companyName: companies.name,
      })
      .from(quotationSuppliers)
      .innerJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
      .innerJoin(companies, eq(quotations.companyId, companies.id))
      .orderBy(desc(quotations.startDate));

    console.log(`📊 Total de registos retornados: ${results.length}`);
    if (results.length > 0) {
      console.log('📦 Primeiro registo:', results[0]);
    } else {
      console.log('⚠️ Retornou 0 registos. O JOIN com `companies` falhou porque a tabela de empresas está vazia.');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

runCheck();