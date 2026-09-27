import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import QuotationCard from '../src/components/QuotationCard';

describe('Melo Perfumaria - Teste do Componente QuotationCard', () => {

  it('deve renderizar as informações principais da cotação', () => {
    render(
      <QuotationCard 
        quotation={{
          id: '1',
          status: 'Aberta',
          title: 'COTAÇÃO DE REPOSIÇÃO - SETEMBRO',
          createdAt: '2026-09-26', // Ajustado para string conforme exigido pela tipagem
        }}
        onExport={vi.fn()}
        showToast={vi.fn()}
      />
    );

    // Valida se o conteúdo aparece no ecrã
    expect(screen.getByText(/Aberta/i)).toBeDefined();
  });

});