import { describe, it, expect } from 'vitest';
import { createProductSchema } from './products.service';

describe('ProductsService - Validações', () => {
  it('deve validar com sucesso um produto correto', () => {
    const validData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Shampoo Anticaspa 400ml',
      unit: 'UN',
      boxQuantity: 12,
      costPrice: '15.50',
      salePrice: '25.90',
    };

    const result = createProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve falhar se a descrição for muito curta', () => {
    const invalidData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      description: 'A',
      unit: 'UN',
    };

    const result = createProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});