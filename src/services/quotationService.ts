import { db } from '@/db/db';
import { supplierConnections, quotationItems, quotationSuppliers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function getActiveB2BSuppliers(companyId: string) {
  const acceptedConnections = await db
    .select({ supplierId: supplierConnections.supplierId })
    .from(supplierConnections)
    .where(
      and(
        eq(supplierConnections.companyId, companyId),
        eq(supplierConnections.status, 'ACCEPTED')
      )
    );

  return acceptedConnections.map((c) => c.supplierId);
}

export async function saveQuotationItems(quotationId: string, items: unknown[]) {
  if (!Array.isArray(items)) return;

  for (const item of items) {
    const itemObj = item as Record<string, unknown>;
    const pId = String(itemObj.productId || itemObj.id || '');
    const qQty = Number(itemObj.requestedQuantity || itemObj.quantity || 0);

    if (!pId) continue;

    // Removido o campo 'price' pois ele não pertence à tabela quotationItems no schema atual
    await db.insert(quotationItems).values({
      id: crypto.randomUUID(),
      quotationId,
      productId: pId,
      requestedQuantity: String(qQty),
    });
  }
}

export async function linkQuotationSuppliers(quotationId: string, supplierIds: string[]) {
  const createdQuotations = [];
  for (const supplierId of supplierIds) {
    const supplierToken = crypto.randomUUID();
    await db.insert(quotationSuppliers).values({
      id: crypto.randomUUID(),
      quotationId,
      supplierId: String(supplierId),
      token: supplierToken,
      status: 'PENDING',
    });
    createdQuotations.push({ supplierId, token: supplierToken });
  }
  return createdQuotations;
}