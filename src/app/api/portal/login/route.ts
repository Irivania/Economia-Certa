import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { suppliers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// 🛡️ Estrutura de Rate Limiting em memória para proteção contra Brute Force
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

const MAX_ATTEMPTS = 5; // Máximo de tentativas permitidas
const LOCK_TIME_MS = 15 * 60 * 1000; // Tempo de bloqueio: 15 minutos

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const password = body.password ? String(body.password) : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Por favor, preencha o e-mail e a senha.' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const attemptRecord = loginAttempts.get(email);

    // Verifica se o e-mail está temporariamente bloqueado por excesso de falhas
    if (attemptRecord && attemptRecord.lockUntil > now) {
      const minutesLeft = Math.ceil((attemptRecord.lockUntil - now) / 60000);
      return NextResponse.json(
        { 
          error: `Muitas tentativas falhadas. Conta temporariamente protegida. Tente novamente em ${minutesLeft} minuto(s).` 
        },
        { status: 429 }
      );
    }

    // Busca o representante na base de dados selecionando estritamente as colunas existentes
    const supplierList = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        email: suppliers.email,
        phone: suppliers.phone,
        passwordHash: suppliers.passwordHash,
      })
      .from(suppliers)
      .where(eq(suppliers.email, email));

    const supplier = supplierList[0];

    // 🔒 SEGURANÇA AVANÇADA: Mensagem genérica para evitar enumeração e Timing Attacks
    let passwordMatch = false;
    const dummyHash = '$2b$10$invalidhashdummyforexecutiontiming1234567890abcdef';

    if (supplier && supplier.passwordHash) {
      passwordMatch = await bcrypt.compare(password, supplier.passwordHash);
    } else {
      // Executa um compare falso para uniformizar o tempo de resposta
      await bcrypt.compare(password, dummyHash);
    }

    if (!supplier || !passwordMatch) {
      const currentAttempts = attemptRecord ? attemptRecord.count + 1 : 1;
      
      if (currentAttempts >= MAX_ATTEMPTS) {
        loginAttempts.set(email, {
          count: currentAttempts,
          lockUntil: now + LOCK_TIME_MS,
        });
        return NextResponse.json(
          { error: 'Limite de tentativas excedido. O acesso foi temporariamente bloqueado por segurança.' },
          { status: 429 }
        );
      } else {
        loginAttempts.set(email, {
          count: currentAttempts,
          lockUntil: 0,
        });
      }

      return NextResponse.json(
        { error: 'Credenciais inválidas ou acesso não autorizado.' },
        { status: 401 }
      );
    }

    // Se o login for bem-sucedido, limpa o registo de tentativas falhadas
    loginAttempts.delete(email);

    // Retorna os dados seguros da sessão do representante
    return NextResponse.json({
      success: true,
      supplier: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone || '',
      },
    });

  } catch (error) {
    console.error('[Security Auth Critical Error]:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno de segurança ao processar a autenticação.' },
      { status: 500 }
    );
  }
}