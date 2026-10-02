import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "ID da empresa não fornecido." }, { status: 400 });
    }

    let [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));

    // Se a empresa não existir com esse ID específico, busca a primeira empresa cadastrada (fallback de segurança)
    if (!company) {
      const allCompanies = await db.select().from(companies).limit(1);
      company = allCompanies[0];
    }

    // Se ainda assim não existir nenhuma empresa na base de dados, cria uma padrão automaticamente!
    if (!company) {
      const newId = companyId || crypto.randomUUID();
      await db.insert(companies).values({
        id: newId,
        name: "Melo Perfumaria",
        type: "Matriz",
      });
      const [createdCompany] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, newId));
      company = createdCompany;
    }

    return NextResponse.json({
      id: company.id,
      name: company.name,
      tradeName: company.tradeName || "",
      document: company.document || "",
      email: company.email || "",
      phone: company.phone || "",
      cep: company.cep || "",
      address: company.address || "",
      number: company.number || "",
      neighborhood: company.neighborhood || "",
      city: company.city || "",
      state: company.state || "",
      type: company.type || "Matriz",
    });
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return NextResponse.json({ error: "Erro interno ao buscar dados." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyId, 
      name, 
      tradeName, 
      document, 
      email, 
      phone, 
      cep, 
      address, 
      number, 
      neighborhood, 
      city, 
      state, 
      type 
    } = body;

    if (!companyId) {
      return NextResponse.json({ error: "ID da empresa não fornecido." }, { status: 400 });
    }

    // Garante que a empresa existe antes de atualizar (upsert seguro)
    const [existing] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!existing) {
      await db.insert(companies).values({
        id: companyId,
        name: name || "Melo Perfumaria",
        tradeName: tradeName || null,
        document: document || null,
        email: email || null,
        phone: phone || null,
        cep: cep || null,
        address: address || null,
        number: number || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        type: type || "Matriz",
      });
    } else {
      await db
        .update(companies)
        .set({
          name: name || "Melo Perfumaria",
          tradeName: tradeName || null,
          document: document || null,
          email: email || null,
          phone: phone || null,
          cep: cep || null,
          address: address || null,
          number: number || null,
          neighborhood: neighborhood || null,
          city: city || null,
          state: state || null,
          type: type || null,
        })
        .where(eq(companies.id, companyId));
    }

    return NextResponse.json({ success: true, message: "Dados da empresa atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar dados." }, { status: 500 });
  }
}