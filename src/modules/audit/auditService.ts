import { db } from "@/db/db";
import { auditLogs } from "@/db/schema";

interface LogAuditParams {
  companyId?: string;
  quotationId?: string;
  supplierId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
}

export async function recordAuditLog({
  companyId,
  quotationId,
  supplierId,
  action,
  details,
  ipAddress,
}: LogAuditParams) {
  try {
    await db.insert(auditLogs).values({
      companyId: companyId || null,
      quotationId: quotationId || null,
      supplierId: supplierId || null,
      action,
      details: details || null,
      ipAddress: ipAddress || null,
    });
  } catch (error) {
    console.error(
      "❌ [Audit Trail] Falha ao registar log de auditoria:",
      error,
    );
    // O erro de audit log não deve quebrar a requisição principal do utilizador
  }
}
