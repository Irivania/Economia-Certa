import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { suppliers, supplierPasswordResets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email ? String(body.email).trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json(
        { error: 'Por favor, informe o e-mail de acesso.' },
        { status: 400 }
      );
    }

    const supplierList = await db.select().from(suppliers).where(eq(suppliers.email, email));
    const supplier = supplierList[0];

    // 🔒 Proteção avançada contra enumeração: resposta sempre genérica
    if (supplier) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutos de validade

      // Insere o token na tabela dedicada de recuperação
      await db.insert(supplierPasswordResets).values({
        supplierId: supplier.id,
        token: resetToken,
        expiresAt: expiresAt,
      });

      console.log(`[Secure Reset Token for ${email}]: ${resetToken}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver associado a uma conta, as instruções de recuperação foram enviadas.',
    });

  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar a recuperação.' },
      { status: 500 }
    );
  }
}