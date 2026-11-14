import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { productCompositions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: Retorna os componentes de um produto kit específico (passando ?productId=...)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "ID do produto kit não informado." }, { status: 400 });
  }

  try {
    const items = await db
      .select()
      .from(productCompositions)
      .where(eq(productCompositions.productId, productId));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Erro ao buscar composição do kit:", error);
    return NextResponse.json({ error: "Erro interno ao buscar composição." }, { status: 500 });
  }
}

// POST: Salva ou substitui os componentes de um kit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, components } = body; 
    // components: Array de { componentProductId, quantity }

    if (!productId || !Array.isArray(components)) {
      return NextResponse.json({ error: "Dados incompletos para salvar a composição." }, { status: 400 });
    }

    // 1. Remove composições antigas deste kit
    await db
      .delete(productCompositions)
      .where(eq(productCompositions.productId, productId));

    // 2. Insere as novas composições se houver itens
    if (components.length > 0) {
      const insertData = components.map((c: { componentProductId: string; quantity: number | string }) => ({
        productId,
        componentProductId: c.componentProductId,
        quantity: String(c.quantity || 1), // Mapeado como numeric no schema
      }));

      await db.insert(productCompositions).values(insertData);
    }

    return NextResponse.json({ success: true, message: "Composição do kit salva com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar composição do kit:", error);
    return NextResponse.json({ error: "Erro interno ao salvar composição." }, { status: 500 });
  }
}