import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { supervisorRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, supervisorName } = body; // status esperado: 'APPROVED' ou 'REJECTED'

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID e status de resposta são obrigatórios." },
        { status: 400 },
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Use APPROVED ou REJECTED." },
        { status: 400 },
      );
    }

    // Atualiza o estado da solicitação na base de dados
    await db
      .update(supervisorRequests)
      .set({
        status: status,
        supervisorName: supervisorName
          ? String(supervisorName).toUpperCase()
          : "GESTOR / SUPERVISOR",
        updatedAt: new Date(),
      })
      .where(eq(supervisorRequests.id, id));

    return NextResponse.json({
      success: true,
      message: `Solicitação ${status === "APPROVED" ? "aprovada" : "rejeitada"} com sucesso!`,
    });
  } catch (error) {
    console.error("Erro ao atualizar solicitação de supervisão:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar solicitação." },
      { status: 500 },
    );
  }
}
