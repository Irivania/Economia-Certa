import { z } from 'zod';
import * as XLSX from 'xlsx';

export const importRowSchema = z.object({
  ean: z.string().optional(),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  brand: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().default('UN'),
  boxQuantity: z.number().int().positive().default(1),
  costPrice: z.string().optional(),
  salePrice: z.string().optional(),
});

export type ImportRowInput = z.infer<typeof importRowSchema>;

export interface ImportErrorResult {
  row: number;
  data: Record<string, unknown>;
  error: string;
}

export interface ImportResult {
  totalProcessed: number;
  successfulImports: ImportRowInput[];
  errors: ImportErrorResult[];
}

export class ImportsService {
  static processSpreadsheet(buffer: Buffer): ImportResult {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    const successfulImports: ImportRowInput[] = [];
    const errors: ImportErrorResult[] = [];

    rawData.forEach((row, index) => {
      const rowNumber = index + 2;
      const rowKeys = Object.keys(row);

      // Se não achar pelas chaves específicas, pega a primeira coluna como descrição e a segunda como unidade (fallback total)
      const firstColValue = rowKeys.length > 0 ? row[rowKeys[0]] : undefined;
      const secondColValue = rowKeys.length > 1 ? row[rowKeys[1]] : undefined;

      const findVal = (keys: string[]): unknown => {
        for (const k of keys) {
          const foundKey = rowKeys.find(
            (rk) => rk.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
                    k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          );
          if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== '') {
            return row[foundKey];
          }
        }
        return undefined;
      };

      const descVal = findVal(['Descrição', 'Descricao', 'Produto', 'Nome', 'description', 'name', 'title']) || firstColValue;
      const unitVal = findVal(['Unidade', 'Un', 'Medida', 'unit', 'uom']) || secondColValue;
      const eanVal = findVal(['EAN', 'Cod Barras', 'Código de Barras', 'Barras', 'barcode']);
      const brandVal = findVal(['Marca', 'Fabricante', 'brand']);
      const catVal = findVal(['Categoria', 'Grupo', 'Seção', 'category', 'group']);
      const boxVal = findVal(['Qtd Caixa', 'Quantidade Caixa', 'Cx', 'Fardo', 'boxquantity', 'box']);
      const costVal = findVal(['Preço Custo', 'Preco Custo', 'Custo', 'costprice', 'cost']);
      const saleVal = findVal(['Preço Venda', 'Preco Venda', 'Venda', 'Preço', 'saleprice', 'price']);

      const normalizedRow = {
        ean: eanVal !== undefined ? String(eanVal).trim() : undefined,
        description: descVal !== undefined ? String(descVal).trim().toUpperCase() : 'PRODUTO SEM DESCRIÇÃO',
        brand: brandVal !== undefined ? String(brandVal).trim().toUpperCase() : undefined,
        category: catVal !== undefined ? String(catVal).trim().toUpperCase() : undefined,
        unit: unitVal !== undefined ? String(unitVal).trim().toUpperCase() : 'UN',
        boxQuantity: boxVal !== undefined ? Number(boxVal) : 1,
        costPrice: costVal !== undefined ? String(costVal) : undefined,
        salePrice: saleVal !== undefined ? String(saleVal) : undefined,
      };

      const validationResult = importRowSchema.safeParse(normalizedRow);

      if (!validationResult.success) {
        errors.push({
          row: rowNumber,
          data: row,
          error: validationResult.error.issues.map((e: z.ZodIssue) => e.message).join(', '),
        });
      } else {
        successfulImports.push(validationResult.data);
      }
    });

    return {
      totalProcessed: rawData.length,
      successfulImports,
      errors,
    };
  }
}