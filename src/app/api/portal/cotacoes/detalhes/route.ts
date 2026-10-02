import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import {
  quotations,
  companies,
  quotationSuppliers,
  quotationItems,
  products,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { recordAuditLog } from "@/modules/audit/auditService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido." },
        { status: 400 },
      );
    }

    // 1. Localiza o registo do fornecedor pelo token
    const supplierRecords = await db
      .select()
      .from(quotationSuppliers)
      .where(eq(quotationSuppliers.token, token));

    const supplierRecord = supplierRecords?.[0];
    const targetQuotationId = supplierRecord
      ? supplierRecord.quotationId
      : token;

    const quotationRows = await db
      .select()
      .from(quotations)
      .leftJoin(companies, eq(quotations.companyId, companies.id))
      .where(eq(quotations.id, targetQuotationId));

    const quotationRow = quotationRows?.[0] as
      Record<string, unknown> | undefined;

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

    // 3. Registo de Auditoria: Grava a abertura da cotação pelo fornecedor
    await recordAuditLog({
      quotationId: (quotData.id as string) ?? targetQuotationId,
      supplierId: supplierRecord?.supplierId,
      action: "PORTAL_QUOTATION_OPENED",
      details: `Fornecedor acedeu aos detalhes da cotação via token único.`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    // 4. Busca os itens da cotação
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

        const savedPrice = item.unitPrice ?? item.price ?? 0;
        const isOutOfStock = item.outOfStock ?? false;

        formattedItems.push({
          id: (item.id as string) ?? productId,
          productId,
          productName,
          barcode,
          description: (prod.brand as string) ? `Marca: ${prod.brand}` : "",
          imageUrl: (prod.imageUrl as string) || (prod.image as string) || null,
          quantity,
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

    return NextResponse.json({
      quotationId: (quotData.id as string) ?? targetQuotationId,
      title:
        (quotData.title as string) ||
        (quotData.name as string) ||
        "Cotação de Reposição",
      companyName: (compData.name as string) || "Melo Perfumaria",
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
