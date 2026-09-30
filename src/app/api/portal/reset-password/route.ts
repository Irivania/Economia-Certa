import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { suppliers, supplierPasswordResets } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token ? String(body.token).trim() : '';
    const newPassword = body.newPassword ? String(body.newPassword) : '';

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token ou nova senha inválidos.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const resetRecordList = await db.select().from(supplierPasswordResets).where(
      and(
        eq(supplierPasswordResets.token, token),
        gt(supplierPasswordResets.expiresAt, now)
      )
    );

    const resetRecord = resetRecordList[0];

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'O link de recuperação é inválido ou expirou.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha do representante
    await db.update(suppliers)
      .set({ passwordHash: passwordHash })
      .where(eq(suppliers.id, resetRecord.supplierId));

    // Remove o token utilizado (uso único / Single-Use)
    await db.delete(supplierPasswordResets).where(eq(supplierPasswordResets.id, resetRecord.id));

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso!',
    });

  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao redefinir a senha.' },
      { status: 500 }
    );
  }
}