import { test, expect } from '@playwright/test';

test.describe('Testes de Segurança e Resiliência das APIs', () => {
  
  test('Deve rejeitar requisições de relatórios sem companyId ou quotationId', async ({ request }) => {
    // Tenta acessar a rota de economia sem passar os parâmetros obrigatórios
    const response = await request.get('http://localhost:3000/api/reports/savings');
    
    // Deve retornar erro 400 (Bad Request)
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('Deve retornar 404 ao buscar uma cotação inexistente', async ({ request }) => {
    const fakeCompanyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
    const fakeQuotationId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request.get(
      `http://localhost:3000/api/reports/savings?companyId=${fakeCompanyId}&quotationId=${fakeQuotationId}`
    );
    
    // Deve retornar 404 (Not Found) para evitar vazamento ou crash
    expect(response.status()).toBe(404);
  });

});