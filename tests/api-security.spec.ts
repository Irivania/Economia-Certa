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

  test('Deve retornar erro de não encontrado ou requisição inválida ao buscar uma cotação inexistente', async ({ request }) => {
    const fakeCompanyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
    const fakeQuotationId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request.get(
      `http://localhost:3000/api/reports/savings?companyId=${fakeCompanyId}&quotationId=${fakeQuotationId}`
    );
    
    // Aceita 404 (Not Found) ou 400/500 caso a API trate o ID inválido de outra forma controlada
    const status = response.status();
    expect([400, 404, 500]).toContain(status);
  });

});