import { describe, it, expect } from 'vitest';
import { calculateProductMargin, formatCentsToCurrency } from '../src/utils/pricing';

describe('Melo Perfumaria - Testes Unitários de Precificação e Finanças', () => {
  
  it('deve calcular corretamente a margem de lucro de um produto', () => {
    const cost = 50.00;
    const sale = 100.00;
    const margin = calculateProductMargin(cost, sale);
    
    expect(margin).toBe(50.00); // 50% de margem
  });

  it('deve formatar valores em centavos para a moeda Real brasileiro sem erros', () => {
    const cents = 155075; // R$ 1.550,75
    const formatted = formatCentsToCurrency(cents);
    
    expect(formatted).toContain('1.550,75');
  });

});