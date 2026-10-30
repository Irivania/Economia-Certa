import { products as productsSchema } from '@/db/schema';

export type Product = typeof productsSchema.$inferSelect & {
  ean?: string | null;
};

export interface ItemPendente {
  codigoExterno?: string;
  ean?: string | null;
  descricao: string;
  descricaoPadronizada: string;
  precoVenda?: string | '';
  estoqueAtual?: number | '';
}

export interface ItemReconhecido {
  codigoExterno?: string;
  ean?: string | null;
  descricao: string;
  product: Product;
  matchType: 'EAN' | 'Exato' | 'Similar';
}

export interface QuotationItemPayload {
  id: string;
  productId: string;
  description: string;
  brand: string | null;
  ean: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
  requestedQuantity: number;
}

export interface ProductImportModalProps {
  products: Product[];
  onQuickRegister?: (itemPendente: ItemPendente) => Promise<void>;
  onImportComplete?: (itens: QuotationItemPayload[]) => void;
}