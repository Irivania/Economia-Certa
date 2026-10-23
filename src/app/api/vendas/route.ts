import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { sales, saleItems, cashRegisters } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allSales = await db
      .select()
      .from(sales)
      .orderBy(desc(sales.createdAt));

    const allItems = await db.select().from(saleItems);
    const allRegisters = await db.select().from(cashRegisters);

    // Mapeia as vendas juntando itens e nome do caixa correspondente de forma segura
    const salesWithItems = allSales.map((sale) => {
      const reg = allRegisters.find((r) => r.id === sale.cashRegisterId);
      const regObj = reg as Record<string, unknown> | undefined;
      
      const registerName = regObj 
        ? (typeof regObj.name === 'string' ? regObj.name : null) || 
          (typeof regObj.registerName === 'string' ? regObj.registerName : null) || 
          'Caixa PDV' 
        : 'Caixa Padrão';

      return {
        ...sale,
        registerName,
        items: allItems.filter((item) => item.saleId === sale.id),
      };
    });

    return NextResponse.json({ success: true, sales: salesWithItems });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro ao carregar histórico de vendas.' }, { status: 500 });
  }
}