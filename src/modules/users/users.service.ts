import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema de validação para criação de usuários
export const createUserSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido.'),
  email: z.string().email('E-mail inválido.'),
  passwordHash: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  role: z.enum(['ADMIN', 'BUYER', 'OPERATOR', 'REPRESENTATIVE']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export class UsersService {
  /**
   * Cria um novo usuário vinculado a uma empresa.
   */
  static async create(data: CreateUserInput) {
    const validatedData = createUserSchema.parse(data);

    // Verifica se já existe um usuário com este e-mail
    const existing = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existing) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }

    const [newUser] = await db
      .insert(users)
      .values({
        companyId: validatedData.companyId,
        email: validatedData.email,
        passwordHash: validatedData.passwordHash,
        role: validatedData.role,
        active: true,
      })
      .returning();

    return newUser;
  }

  /**
   * Busca um usuário por ID garantindo o isolamento multi-tenant (companyId).
   */
  static async findByIdAndCompany(id: string, companyId: string) {
    const user = await db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.companyId, companyId)),
    });

    if (!user) {
      throw new Error('Usuário não encontrado ou sem permissão de acesso.');
    }

    return user;
  }
}