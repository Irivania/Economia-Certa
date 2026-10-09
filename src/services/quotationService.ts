import { db } from '@/db/db';
import {
  supplierConnections,
  quotationItems,
  quotationSuppliers,
  supplierBrands,
  suppliers,
} from '@/db/schema';
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

export async function resolvePortalSupplierId(supplierId: string) {
  const [sourceSupplier] = await db
    .select({ email: suppliers.email, name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!sourceSupplier?.email) return supplierId;

  const [portalSupplier] = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(
      and(
        eq(suppliers.email, sourceSupplier.email),
        eq(suppliers.companyId, 'independente'),
      ),
    )
    .limit(1);

  return portalSupplier?.id || supplierId;
}

export async function resolveQuotationBrandId(supplierId: string) {
  const [sourceSupplier] = await db
    .select({ email: suppliers.email, name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!sourceSupplier?.email) return null;

  const representedBrands = await db
    .select({
      id: supplierBrands.id,
      tradeName: supplierBrands.tradeName,
      corporateName: supplierBrands.corporateName,
    })
    .from(supplierBrands)
    .innerJoin(suppliers, eq(supplierBrands.supplierId, suppliers.id))
    .where(eq(suppliers.email, sourceSupplier.email));

  if (representedBrands.length === 1) return representedBrands[0].id;

  const normalizedName = sourceSupplier.name?.trim();
  if (!normalizedName) return null;

  const matchingBrand = representedBrands.find((brand) =>
    [brand.tradeName, brand.corporateName]
      .filter(Boolean)
      .some((name) => name?.trim().toUpperCase() === normalizedName.toUpperCase()),
  );

  return matchingBrand?.id || null;
}

export async function linkQuotationSuppliers(quotationId: string, supplierIds: string[]) {
  const createdQuotations = [];
  for (const supplierId of supplierIds) {
    const supplierToken = crypto.randomUUID();
    const resolvedSupplierId = await resolvePortalSupplierId(String(supplierId));
    const brandId = await resolveQuotationBrandId(String(supplierId));
    await db.insert(quotationSuppliers).values({
      id: crypto.randomUUID(),
      quotationId,
      supplierId: resolvedSupplierId,
      brandId,
      token: supplierToken,
      status: 'PENDING',
    });
    createdQuotations.push({ supplierId, token: supplierToken });
  }
  return createdQuotations;
}