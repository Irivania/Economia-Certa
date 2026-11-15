import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { supervisorRequests } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET: Lista solicitações (geralmente filtradas por companyId e status pendente)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status"); // Ex: PENDING

    if (!companyId) {
      return NextResponse.json(
        { error: "O ID da empresa é obrigatório." },
        { status: 400 },
      );
    }

    const query = db
      .select()
      .from(supervisorRequests)
      .where(
        status
          ? and(
              eq(supervisorRequests.companyId, companyId),
              eq(supervisorRequests.status, status),
            )
          : eq(supervisorRequests.companyId, companyId),
      )
      .orderBy(desc(supervisorRequests.createdAt));

    const requests = await query;
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Erro ao buscar solicitações de supervisão:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar solicitações." },
      { status: 500 },
    );
  }
}

// POST: O Caixa/PDV cria uma nova solicitação de autorização remota
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, terminalId, operatorName, actionType, payload, reason } =
      body;

    if (!companyId || !terminalId || !actionType || !payload) {
      return NextResponse.json(
        { error: "Dados insuficientes para a solicitação." },
        { status: 400 },
      );
    }

    const newRequestId = crypto.randomUUID();

    await db.insert(supervisorRequests).values({
      id: newRequestId,
      companyId: String(companyId),
      terminalId: String(terminalId),
      operatorName: operatorName
        ? String(operatorName).toUpperCase()
        : "OPERADOR",
      actionType: String(actionType).toUpperCase(),
      payload: payload, // Objeto JSON com os detalhes (ex: { productId, quantity, itemName })
      status: "PENDING",
      reason: reason ? String(reason) : null,
    });

    return NextResponse.json(
      {
        success: true,
        requestId: newRequestId,
        message: "Solicitação enviada ao gestor com sucesso!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar solicitação de supervisão:", error);
    return NextResponse.json(
      { error: "Erro interno ao enviar solicitação." },
      { status: 500 },
    );
  }
}
