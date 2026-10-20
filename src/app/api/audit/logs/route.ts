import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { auditLogs, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    // Buscar logs de auditoria ordenados do mais recente para o mais antigo
    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        details: auditLogs.details,
        userId: auditLogs.userId,
        userName: users.name,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.companyId, companyId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100); // Exibir os últimos 100 eventos críticos

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar auditoria.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, userId, action, details } = body;

    if (!companyId || !action) {
      return NextResponse.json({ error: 'Dados insuficientes para registar log.' }, { status: 400 });
    }

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      companyId,
      userId: userId || null,
      action,
      details: details || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    return NextResponse.json({ error: 'Erro interno ao gravar auditoria.' }, { status: 500 });
  }
}