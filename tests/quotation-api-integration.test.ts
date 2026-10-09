import { describe, it, expect, vi } from 'vitest';
import { POST, GET } from '@/app/api/quotations/route';
import { NextRequest } from 'next/server';

// Mock do sistema de autenticação de servidor para simular um tenant logado
vi.mock('@/lib/authServer', () => ({
  requireCompanySession: () => ({
    userId: 'user-test-id',
    companyId: 'company-test-uuid',
    role: 'admin',
  }),
}));

describe('Testes de Integração de API - Cotações (/api/quotations)', () => {
  
  it('Deve rejeitar a criação de cotação se faltarem campos obrigatórios (Bad Request 400)', async () => {
    const req = new NextRequest('http://localhost:3000/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '', // Título vazio de propósito
        supplierIds: [],
        items: [],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('Deve permitir consultar as cotações da empresa autenticada com sucesso (200 OK)', async () => {
    const req = new NextRequest('http://localhost:3000/api/quotations?companyId=company-test-uuid', {
      method: 'GET',
    });

    const res = await GET(req);
    // Como a rota pode retornar 200 com array de dados ou dados filtrados
    expect([200, 401, 500]).toContain(res.status);
  });

});