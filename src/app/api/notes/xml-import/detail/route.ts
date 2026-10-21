import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { importedInvoices, productCostHistory, products, accountsPayable } from '@/db/schema';
import { eq, and, or, like } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const invoiceNumber = searchParams.get('invoiceNumber');

    if (!companyId || !invoiceNumber) {
      return NextResponse.json({ error: 'Parâmetros insuficientes.' }, { status: 400 });
    }

    const [invoice] = await db
      .select()
      .from(importedInvoices)
      .where(and(eq(importedInvoices.companyId, companyId), eq(importedInvoices.invoiceNumber, invoiceNumber)))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: 'Nota fiscal não encontrada no histórico.' }, { status: 404 });
    }

    const itemsHistory = await db
      .select({
        id: productCostHistory.id,
        unitCost: productCostHistory.unitCost,
        quantity: productCostHistory.quantity,
        productDescription: products.description,
        productEan: products.ean,
      })
      .from(productCostHistory)
      .innerJoin(products, eq(productCostHistory.productId, products.id))
      .where(and(eq(productCostHistory.companyId, companyId), eq(productCostHistory.invoiceNumber, invoiceNumber)));

    // Buscar boletos / contas a pagar associadas a esta fatura ou emitente
    const payables = await db
      .select()
      .from(accountsPayable)
      .where(
        and(
          eq(accountsPayable.companyId, companyId),
          or(
            like(accountsPayable.invoiceNumber, `${invoiceNumber}%`),
            eq(accountsPayable.supplierName, invoice.issuerName)
          )
        )
      );

    return NextResponse.json({
      success: true,
      invoice,
      items: itemsHistory,
      payables,
    });
  } catch (error) {
    console.error('Erro ao buscar detalhe da nota:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar detalhe da nota.' }, { status: 500 });
  }
}