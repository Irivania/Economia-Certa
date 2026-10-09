import { describe, it, expect, vi } from 'vitest';
import { GET as getProducts } from '@/app/api/products/route';
import { NextRequest } from 'next/server';

// Mock do módulo de sessão do servidor para simular diferentes utilizadores/empresas
vi.mock('@/lib/authServer', () => ({
  requireCompanySession: (req: NextRequest) => {
    const tenant = req.headers.get('x-test-tenant');
    if (tenant === 'empresa-A-uuid') {
      return { userId: 'user-A', companyId: 'empresa-A-uuid', role: 'admin' };
    }
    if (tenant === 'empresa-B-uuid') {
      return { userId: 'user-B', companyId: 'empresa-B-uuid', role: 'admin' };
    }
    throw new Error('UNAUTHORIZED');
  },
}));

describe('Testes de Segurança e Isolamento Multi-Tenant (IDOR)', () => {
  it('Deve permitir que a Empresa A consulte apenas os seus próprios produtos', async () => {
    const request = new NextRequest('http://localhost:3000/api/products', {
      headers: {
        'x-test-tenant': 'empresa-A-uuid',
      },
    });

    const response = await getProducts(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    // Verifica se os dados retornados pertencem estritamente ao tenant A
    if (Array.isArray(data)) {
      data.forEach((product: { companyId: string }) => {
        expect(product.companyId).toBe('empresa-A-uuid');
      });
    }
  });

  it('Deve bloquear requisições sem sessão válida com status 401', async () => {
    const request = new NextRequest('http://localhost:3000/api/products', {
      headers: {
        // Sem header de tenant autenticado
      },
    });

    const response = await getProducts(request);
    expect(response.status).toBe(401);
  });
});