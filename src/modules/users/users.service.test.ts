import { describe, it, expect } from 'vitest';
import { createUserSchema } from './users.service';

describe('UsersService - Validações', () => {
  it('deve validar com sucesso um usuário correto', () => {
    const validData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'comprador@lojaexemplo.com',
      passwordHash: 'senhaSegura123',
      role: 'BUYER' as const,
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve falhar se o e-mail for inválido', () => {
    const invalidData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'email-invalido',
      passwordHash: 'senhaSegura123',
      role: 'BUYER' as const,
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('deve falhar se o papel (role) for inválido', () => {
    const invalidData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'teste@exemplo.com',
      passwordHash: 'senhaSegura123',
      role: 'SUPERADMIN_INVALIDO',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});