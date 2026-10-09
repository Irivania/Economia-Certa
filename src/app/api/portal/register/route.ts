import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    // Verifica se o fornecedor/representante já existe
    const [existingSupplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.email, email));

    const passwordHash = await bcrypt.hash(password, 10);

    if (existingSupplier) {
      // Se já existe (talvez convidado por uma loja), apenas atualiza a senha e dados de acesso
      await db
        .update(suppliers)
        .set({
          name: name,
          phone: phone || existingSupplier.phone,
          passwordHash: passwordHash,
        })
        .where(eq(suppliers.id, existingSupplier.id));

      return NextResponse.json({ success: true, message: "Registo concluído com sucesso!" }, { status: 201 });
    } else {
      // Se NÃO existe, permite o auto-registo autónomo imediatamente!
      // Atribuímos um companyId temporário padrão ou nulo para representar o registo independente
      await db.insert(suppliers).values({
        companyId: "independente", // ou um ID genérico para contas criadas autonomamente
        name: name,
        email: email,
        phone: phone || null,
        passwordHash: passwordHash,
      });

      return NextResponse.json({ success: true, message: "Conta de representante criada com sucesso!" }, { status: 201 });
    }
  } catch (error) {
    console.error("Erro no registo do portal:", error);
    return NextResponse.json({ error: "Erro interno ao processar registo." }, { status: 500 });
  }
}