"use server";

import { db } from "@/db/db";
import { quotationSuppliers, quotations, quotationItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { submitQuotationResponseSchema } from "@/modules/portal/portalValidation";
import { recordAuditLog } from "@/modules/audit/auditService";
import { revalidatePath } from "next/cache";

interface QuotationActionState {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function submitQuotationServerAction(
  prevState: QuotationActionState,
  formDataObj: {
    token: string;
    prices: Record<string, number>;
    outOfStock: Record<string, boolean>;
    observation?: string;
  },
): Promise<QuotationActionState> {
  try {
    // 1. Validação estrita com Zod
    const validationResult =
      submitQuotationResponseSchema.safeParse(formDataObj);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((i) => i.message)
        .join(" | ");
      return { success: false, error: `Dados inválidos: ${errorMessage}` };
    }

    const { token, prices, outOfStock, observation } = validationResult.data;

    // 2. Busca fornecedor e cotação associada
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
      return {
        success: false,
        error: "Fornecedor ou cotação não encontrados.",
      };
    }

    const { supplierRecord, quotation } = record;

    // 3. Validação Temporal Rigorosa
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
          return {
            success: false,
            error: "Prazo encerrado. Esta cotação já expirou.",
          };
        }
      }
    }

    const quotationId = quotation.id;
    const supplierId = supplierRecord.supplierId;

    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    let calculatedTotal = 0;

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

      await db
        .update(quotationItems)
        .set({
          price: String(finalPrice),
          supplierId: supplierId,
          outOfStock: isUnavailable,
        } as Record<string, unknown>)
        .where(
          and(
            eq(quotationItems.quotationId, quotationId),
            eq(quotationItems.productId, productId),
          ),
        );
    }

    const updateData: Record<string, unknown> = {
      status: "responded",
      totalOffered: calculatedTotal,
    };

    if (observation) {
      updateData.observation = observation;
    }

    await db
      .update(quotationSuppliers)
      .set(updateData)
      .where(eq(quotationSuppliers.token, token));

    // 4. Auditoria
    await recordAuditLog({
      companyId: quotation.companyId,
      quotationId,
      supplierId,
      action: "QUOTATION_PROPOSAL_SUBMITTED_ACTION",
      details: `Proposta submetida via Server Action. Total: R$ ${calculatedTotal.toFixed(2)}`,
    });

    // 5. Invalidação inteligente de cache do Next.js
    revalidatePath(`/portal/cotacao/${token}`);

    return {
      success: true,
      message: "Proposta enviada com sucesso via Server Action!",
    };
  } catch (error) {
    console.error("❌ [Server Action] Erro crítico:", error);
    return {
      success: false,
      error: "Erro interno ao processar a Server Action.",
    };
  }
}
