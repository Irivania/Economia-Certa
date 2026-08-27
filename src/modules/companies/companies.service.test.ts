import { describe, it, expect } from 'vitest';
import { createCompanySchema } from './companies.service';

describe('CompaniesService - Validações', () => {
  it('deve validar com sucesso dados corretos de uma empresa', () => {
    const validData = {
      name: 'Supermercado Exemplo LTDA',
      document: '12345678000199',
      type: 'STORE' as const,
    };

    const result = createCompanySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve falhar se o nome da empresa for muito curto', () => {
    const invalidData = {
      name: 'A',
      document: '12345678000199',
      type: 'STORE' as const,
    };

    const result = createCompanySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('deve falhar se o tipo da empresa for inválido', () => {
    const invalidData = {
      name: 'Supermercado Exemplo',
      document: '12345678000199',
      type: 'INVALID_TYPE',
    };

    const result = createCompanySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});