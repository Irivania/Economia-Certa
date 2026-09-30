import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Register Payload Received]:', body);

    const name = body.name ? String(body.name).trim() : '';
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const phone = body.phone ? String(body.phone).trim() : '';
    const password = body.password ? String(body.password) : '';

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    const existingSupplier = await db.select().from(suppliers).where(eq(suppliers.email, email));
    if (existingSupplier.length > 0) {
      return NextResponse.json(
        { error: 'Este e-mail já está associado a uma conta de representante.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newSupplierList = await db.insert(suppliers).values({
      companyId: 'portal-representante-independente',
      name: name,
      email: email,
      phone: phone,
      passwordHash: passwordHash,
    }).returning();

    const createdSupplier = newSupplierList[0];

    return NextResponse.json({
      success: true,
      message: 'Conta de representante criada com sucesso!',
      supplier: {
        id: createdSupplier.id,
        name: createdSupplier.name,
        email: createdSupplier.email,
        phone: createdSupplier.phone || '',
      },
    });

  } catch (error) {
    console.error('[Portal Register Critical Error Details]:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor ao processar o registo.' },
      { status: 500 }
    );
  }
}