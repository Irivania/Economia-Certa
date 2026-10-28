import { Quotation, QuotationSupplier, QuotationItem, QuotationSupplierItem, MappedProduct } from '../types/quotation-response.types';

export function mapQuotationData(data: unknown): Quotation {
  const rawData = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const rawSuppliers = Array.isArray(rawData.suppliers) ? rawData.suppliers : [];

  const suppliers: QuotationSupplier[] = rawSuppliers.map((sup: unknown) => {
    const s = (sup && typeof sup === 'object' ? sup : {}) as Record<string, unknown>;
    const quotationSupplierId = typeof s.quotationSupplierId === 'string' ? s.quotationSupplierId : undefined;
    const id = typeof s.id === 'string' ? s.id : '';
    const brandName = typeof s.brandName === 'string' ? s.brandName : undefined;
    const name = typeof s.name === 'string' ? s.name : undefined;

    return {
      ...s,
      id: quotationSupplierId || id,
      name: brandName || name,
    } as QuotationSupplier;
  });

  return {
    ...(rawData as unknown as Quotation),
    suppliers,
  };
}

export function buildProductsMap(
  rawItems: QuotationItem[],
  suppliers: QuotationSupplier[],
  supplierItems: QuotationSupplierItem[]
): { productsList: MappedProduct[]; supplierMapping: Record<string, string> } {
  const supplierMapping: Record<string, string> = {};
  suppliers.forEach((sup) => {
    supplierMapping[sup.id] = sup.id;
  });

  const productsMap: Record<string, MappedProduct> = {};
  rawItems.forEach((item) => {
    if (!productsMap[item.productId]) {
      productsMap[item.productId] = {
        productId: item.productId,
        description: item.description || 'Produto sem descrição',
        ean: item.ean,
        brand: item.brand,
        imageUrl: item.imageUrl,
        requestedQuantity: Number(item.requestedQuantity || 1),
        sellingPrice: Number(item.sellingPrice || 34.99),
        responses: {},
      };
    }
  });

  supplierItems.forEach((si) => {
    const supId = supplierMapping[si.quotationSupplierId];
    if (supId && productsMap[si.productId]) {
      productsMap[si.productId].responses[supId] = {
        price: Number(si.price || 0),
        outOfStock: Boolean(si.outOfStock),
      };
    }
  });

  return {
    productsList: Object.values(productsMap),
    supplierMapping,
  };
}