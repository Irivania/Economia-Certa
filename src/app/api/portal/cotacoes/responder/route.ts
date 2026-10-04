import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import {
  quotationSuppliers,
  quotations,
  quotationItems,
  quotationSupplierItems,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { submitQuotationResponseSchema } from "@/modules/portal/portalValidation";
import { recordAuditLog } from "@/modules/audit/auditService";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = submitQuotationResponseSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((i) => i.message)
        .join(" | ");
      return NextResponse.json(
        { success: false, error: `Dados inválidos: ${errorMessage}` },
        { status: 400 },
      );
    }

    const { token, prices, outOfStock, observation } = validationResult.data;

    // 1. Busca fornecedor e cotação associada
    const result = await db
      .select({
        supplierRecord: quotationSuppliers,
        quotation: quotations,
      })
      .from(quotationSuppliers)
      .innerJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
      .where(eq(quotationSuppliers.token, token));

    const record = result?.[0];
    if (!record) {
      return NextResponse.json(
        { success: false, error: "Fornecedor ou cotação não encontrados." },
        { status: 404 },
      );
    }

    const { supplierRecord, quotation } = record;

    // 2. Bloqueio de Imutabilidade: Impede re-envio ou alteração se já foi respondido
    if (
      supplierRecord.status === "RESPONDIDO" ||
      supplierRecord.status === "responded"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Esta proposta já foi enviada anteriormente e encontra-se bloqueada para edições.",
        },
        { status: 403 },
      );
    }

    // 3. Validação Temporal Rigorosa no Backend
    if (quotation.endDate || quotation.closingTime) {
      const datePart = quotation.endDate
        ? String(quotation.endDate).split("T")[0]
        : "";
      const timePart = quotation.closingTime || "23:59:59";
      const fullDeadlineStr = datePart
        ? `${datePart}T${timePart.length === 5 ? timePart + ":00" : timePart}`
        : null;

      if (fullDeadlineStr) {
        const deadlineTime = new Date(fullDeadlineStr).getTime();
        const now = new Date().getTime();

        if (!isNaN(deadlineTime) && now > deadlineTime) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Prazo encerrado. Esta cotação já expirou e não aceita mais propostas.",
            },
            { status: 403 },
          );
        }
      }
    }

    const quotationId = quotation.id;
    const quotationSupplierId = supplierRecord.id;
    const supplierId = supplierRecord.supplierId;

    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    let calculatedTotal = 0;

    // 4. Salva ou atualiza os preços isoladamente por fornecedor (Verificação segura)
    for (const item of items) {
      const itemId = item.id;
      const productId = item.productId;
      const isUnavailable =
        outOfStock?.[productId] || outOfStock?.[itemId] || false;
      const unitPrice =
        prices?.[productId] !== undefined
          ? Number(prices[productId])
          : prices?.[itemId] !== undefined
            ? Number(prices[itemId])
            : 0;
      const finalPrice = isUnavailable ? 0 : unitPrice;

      const requestedQty = Number(item.requestedQuantity || 1);
      if (!isUnavailable) {
        calculatedTotal += finalPrice * requestedQty;
      }

      // Verifica se já existe um registo prévio para este item deste fornecedor
      const existingRows = await db
        .select()
        .from(quotationSupplierItems)
        .where(
          and(
            eq(quotationSupplierItems.quotationSupplierId, quotationSupplierId),
            eq(quotationSupplierItems.productId, productId)
          )
        );

      if (existingRows.length > 0) {
        // Atualiza o registo existente
        await db
          .update(quotationSupplierItems)
          .set({
            price: String(finalPrice),
            outOfStock: isUnavailable,
          })
          .where(
            and(
              eq(quotationSupplierItems.quotationSupplierId, quotationSupplierId),
              eq(quotationSupplierItems.productId, productId)
            )
          );
      } else {
        // Insere um novo registo
        await db
          .insert(quotationSupplierItems)
          .values({
            id: crypto.randomUUID(),
            quotationSupplierId,
            productId,
            price: String(finalPrice),
            outOfStock: isUnavailable,
          });
      }
    }

    // 5. Atualiza o status do fornecedor e guarda observação/total
    const updateData: Record<string, unknown> = {
      status: "RESPONDIDO",
      totalOffered: calculatedTotal,
    };

    if (observation) {
      updateData.observation = observation;
    }

    await db
      .update(quotationSuppliers)
      .set(updateData)
      .where(eq(quotationSuppliers.token, token));

    // 6. Registo de Auditoria
    await recordAuditLog({
      companyId: quotation.companyId,
      quotationId,
      supplierId,
      action: "QUOTATION_PROPOSAL_SUBMITTED",
      details: `Proposta submetida com sucesso por este fornecedor. Valor total ofertado: R$ ${calculatedTotal.toFixed(2)}`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message: "Proposta enviada com sucesso e bloqueada para edições!",
    });
  } catch (error) {
    console.error("❌ [API Responder] Erro crítico:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao salvar resposta da cotação." },
      { status: 500 },
    );
  }
}