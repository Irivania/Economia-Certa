import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { companies, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  tradeName: z.string().trim().optional().default(''),
  document: z.string().trim().optional().default(''),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().optional().default(''),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Este e-mail já possui uma conta.' }, { status: 409 });
    }

    const companyId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await db.transaction(async (tx) => {
      const [company] = await tx.insert(companies).values({
        id: companyId,
        name: input.name,
        tradeName: input.tradeName || null,
        document: input.document || null,
        email: input.email,
        phone: input.phone || null,
        type: 'Matriz',
      }).returning({ id: companies.id, name: companies.name, tradeName: companies.tradeName });

      const [user] = await tx.insert(users).values({
        companyId,
        name: input.name,
        email: input.email,
        passwordHash,
        role: 'ADMIN',
        active: true,
      }).returning({ id: users.id, name: users.name, email: users.email, companyId: users.companyId, role: users.role });

      return { company, user };
    });

    const session = {
      ...result.user,
      name: result.company.name,
      tradeName: result.company.tradeName || '',
    };
    const response = NextResponse.json(
      { success: true, company: result.company, user: result.user },
      { status: 201 },
    );

    response.cookies.set('melo_company_session', JSON.stringify(session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Preencha os dados obrigatórios correctamente.' }, { status: 400 });
    }
    console.error('[Company Register Error]:', error);
    return NextResponse.json({ error: 'Não foi possível criar a empresa.' }, { status: 500 });
  }
}
