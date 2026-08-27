import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { ImportsService } from '@/modules/imports/imports.service';

describe('ImportsService - Processamento de Planilhas', () => {
  it('deve processar e validar corretamente um buffer de planilha simulado', () => {
    // Cria dados simulados em formato de tabela (como se viesse do Excel/CSV)
    const mockData = [
      {
        'Código Interno': 'P001',
        'EAN': '7891020304050',
        'Descrição': 'Arroz Integral 1kg',
        'Marca': 'Marca A',
        'Categoria': 'Grãos',
        'Unidade': 'UN',
        'Qtd Caixa': 10,
        'Preço Custo': '5.00',
        'Preço Venda': '8.50',
      },
      {
        'Código Interno': 'P002',
        'EAN': '',
        'Descrição': 'A', // Descrição inválida (muito curta, deve gerar erro)
        'Marca': 'Marca B',
        'Categoria': 'Limpeza',
        'Unidade': 'UN',
        'Qtd Caixa': 5,
        'Preço Custo': '2.00',
        'Preço Venda': '4.00',
      },
    ];

    // Converte os dados simulados para um buffer XLSX em memória
    const worksheet = XLSX.utils.json_to_sheet(mockData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Executa o serviço de importação
    const result = ImportsService.processSpreadsheet(excelBuffer);

    // Validações
    expect(result.totalProcessed).toBe(2);
    expect(result.successfulImports.length).toBe(1); // Apenas o primeiro é válido
    expect(result.successfulImports[0].description).toBe('Arroz Integral 1kg');
    
    expect(result.errors.length).toBe(1); // O segundo deve cair nos erros por causa da descrição curta
    expect(result.errors[0].row).toBe(3); // Linha 2 do array + cabeçalho (linha 1) = linha 3
  });
});