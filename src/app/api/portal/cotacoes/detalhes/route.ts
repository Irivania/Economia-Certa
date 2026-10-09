import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import {
  quotations,
  companies,
  quotationSuppliers,
  quotationItems,
  quotationSupplierItems,
  products,
  supplierBrands,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { recordAuditLog } from "@/modules/audit/auditService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const requestedBrandId = searchParams.get("brandId");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido." },
        { status: 400 },
      );
    }

    // 1. Localiza estritamente o registo do fornecedor pelo token único desta cotação específica
    const supplierRecords = await db
      .select()
      .from(quotationSuppliers)
      .where(eq(quotationSuppliers.token, token));

    const supplierRecord = supplierRecords?.[0];

    if (!supplierRecord) {
      return NextResponse.json(
        { error: "Link de acesso ou fornecedor inválido para este token." },
        { status: 404 },
      );
    }

    const targetQuotationId = supplierRecord.quotationId;
    const quotationSupplierId = supplierRecord.id;
    // O bloqueio (isLocked) baseia-se exclusivamente no status deste quotationSupplier específico!
    const isLocked =
      supplierRecord.status === "RESPONDIDO" ||
      supplierRecord.status === "responded";

    const quotationRows = await db
      .select()
      .from(quotations)
      .leftJoin(companies, eq(quotations.companyId, companies.id))
      .where(eq(quotations.id, targetQuotationId));

    const quotationRow = quotationRows?.[0] as
      | Record<string, unknown>
      | undefined;

    if (!quotationRow) {
      return NextResponse.json(
        { error: "Cotação não encontrada." },
        { status: 404 },
      );
    }

    const quotData =
      (quotationRow.quotations as Record<string, unknown>) || quotationRow;
    const compData =
      (quotationRow.companies as Record<string, unknown>) || quotationRow;

    // 2. Validação Temporal: Verifica se a cotação já expirou
    const endDateStr = quotData.endDate as string | null | undefined;
    const closingTimeStr = quotData.closingTime as string | null | undefined;

    if (endDateStr || closingTimeStr) {
      const datePart = endDateStr ? String(endDateStr).split("T")[0] : "";
      const timePart = closingTimeStr || "23:59:59";

      const fullDeadlineStr = datePart
        ? `${datePart}T${timePart.length === 5 ? timePart + ":00" : timePart}`
        : null;

      if (fullDeadlineStr) {
        const deadlineTime = new Date(fullDeadlineStr).getTime();
        const now = new Date().getTime();

        if (!isNaN(deadlineTime) && now > deadlineTime) {
          return NextResponse.json(
            {
              error:
                "Esta cotação já expirou e não aceita mais visualizações ou alterações.",
            },
            { status: 403 },
          );
        }
      }
    }

    // 3. Registo de Auditoria
    await recordAuditLog({
      companyId: quotData.companyId as string,
      quotationId: targetQuotationId,
      supplierId: supplierRecord.supplierId,
      action: "PORTAL_QUOTATION_OPENED",
      details: `Fornecedor acedeu aos detalhes da cotação via token único. Status individual: ${supplierRecord.status}`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    // 4. Busca os preços salvos anteriormente ESPECÍFICOS deste quotationSupplierId
    const savedSupplierItems = await db
      .select()
      .from(quotationSupplierItems)
      .where(eq(quotationSupplierItems.quotationSupplierId, quotationSupplierId));

    const priceMap = new Map(
      savedSupplierItems.map((si) => [
        si.productId,
        { price: si.price, outOfStock: si.outOfStock },
      ])
    );

    // 5. Busca os itens globais da cotação com join nos produtos
    const rawItems = await db
      .select()
      .from(quotationItems)
      .leftJoin(products, eq(quotationItems.productId, products.id))
      .where(eq(quotationItems.quotationId, targetQuotationId));

    const items = rawItems ?? [];
    const formattedItems: Record<string, unknown>[] = [];
    const seenIds = new Set<string>();

    for (const row of items) {
      const typedRow = row as Record<string, unknown>;
      const item = (typedRow.quotation_items ||
        typedRow.quotationItems ||
        {}) as Record<string, unknown>;
      const prod = (typedRow.products || typedRow) as Record<string, unknown>;

      const productId =
        (item.productId as string) ||
        (prod.id as string) ||
        (item.id as string) ||
        Math.random().toString();

      if (!seenIds.has(productId)) {
        seenIds.add(productId);

        const rawQty = item.requestedQuantity ?? item.quantity ?? 1;
        const quantity = Number(String(rawQty).replace(",", ".")) || 1;
        const showQuantity = quotData.showQuantities !== false;
        const productName =
          (prod.description as string) ||
          (prod.name as string) ||
          (prod.title as string) ||
          "Produto de Reposição";

        let barcode = String(
          prod.ean || prod.barcode || prod.code || prod.sku || "-",
        ).trim();
        if (barcode.length > 14) barcode = barcode.slice(0, 13);

        let unit = String(prod.unit || item.unit || "UN").trim();
        if (unit.length > 4) unit = "UN";

        // Obtém o preço específico salvo por este fornecedor específico
        const savedInfo = priceMap.get(productId);
        const savedPrice = savedInfo?.price ?? 0;
        const isOutOfStock = savedInfo?.outOfStock ?? false;

        formattedItems.push({
          id: (item.id as string) ?? productId,
          productId,
          productName,
          barcode,
          description: (prod.brand as string) ? `Marca: ${prod.brand}` : "",
          imageUrl: (prod.imageUrl as string) || (prod.image as string) || null,
          quantity: showQuantity ? quantity : null,
          showQuantity,
          unit,
          price: Number(savedPrice) || 0,
          outOfStock: Boolean(isOutOfStock),
        });
      }
    }

    // Ordena alfabeticamente
    formattedItems.sort((a, b) => {
      const nameA = String(a.productName || "").toLowerCase();
      const nameB = String(b.productName || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const quotationBrandId =
      (supplierRecord.brandId as string | null | undefined) ||
      (quotData.brandId as string | null | undefined);
    let brandId = quotationBrandId;

    if (!brandId && requestedBrandId) {
      const [requestedBrand] = await db
        .select({
          id: supplierBrands.id,
          tradeName: supplierBrands.tradeName,
          corporateName: supplierBrands.corporateName,
        })
        .from(supplierBrands)
        .where(
          and(
            eq(supplierBrands.id, requestedBrandId),
            eq(supplierBrands.supplierId, supplierRecord.supplierId),
          ),
        )
        .limit(1);

      if (!requestedBrand) {
        return NextResponse.json(
          { error: "Distribuidora selecionada não pertence a este representante." },
          { status: 400 },
        );
      }

      brandId = requestedBrand.id;
    }

    let resolvedSupplierName: string | null = null;

    if (brandId) {
      const [brand] = await db
        .select({
          tradeName: supplierBrands.tradeName,
          corporateName: supplierBrands.corporateName,
        })
        .from(supplierBrands)
        .where(
          and(
            eq(supplierBrands.id, brandId),
            eq(supplierBrands.supplierId, supplierRecord.supplierId),
          ),
        )
        .limit(1);

      resolvedSupplierName = brand?.tradeName || brand?.corporateName || null;
    }

    if (!resolvedSupplierName) {
      const supplierBrandRows = await db
        .select({
          tradeName: supplierBrands.tradeName,
          corporateName: supplierBrands.corporateName,
        })
        .from(supplierBrands)
        .where(eq(supplierBrands.supplierId, supplierRecord.supplierId));

      if (supplierBrandRows.length === 1) {
        resolvedSupplierName =
          supplierBrandRows[0].tradeName ||
          supplierBrandRows[0].corporateName ||
          null;
      }
    }

    return NextResponse.json({
      quotationId: targetQuotationId,
      title:
        (quotData.title as string) ||
        (quotData.name as string) ||
        "Cotação de Reposição",
      companyName: (compData.name as string) || "Melo Perfumaria",
      supplierName: resolvedSupplierName || "DISTRIBUIDORA PARCEIRA",
      status: supplierRecord.status,
      isLocked, // Isolado por fornecedor: True apenas se este fornecedor específico já respondeu
      observation: supplierRecord.observation || "",
      startDate: quotData.startDate ?? null,
      endDate: quotData.endDate ?? null,
      closingTime: quotData.closingTime ?? null,
      paymentTerms: quotData.paymentTerms ?? null,
      items: formattedItems,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes da cotação:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar detalhes." },
      { status: 500 },
    );
  }
}