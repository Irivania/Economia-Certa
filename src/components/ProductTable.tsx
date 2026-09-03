'use client';

interface Product {
  id: string;
  description: string;
  ean?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  unit: string;
  boxQuantity: number;
  costPrice?: string | null;
  lastPurchasePrice?: string | null;
  salePrice?: string | null;
  stockCurrent: number;
  stockMin: number;
  stockIdeal: number;
  stockMax: number;
  ncm?: string | null;
  cest?: string | null;
}

interface ProductTableProps {
  products: Product[];
  brands: string[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({
  products,
  brands,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const desc = p.description?.toLowerCase() || '';
    const brandName = p.brand?.toLowerCase() || '';
    const barcode = p.ean?.toLowerCase() || '';

    const matchesSearch = desc.includes(term) || brandName.includes(term) || barcode.includes(term);
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;

    return matchesSearch && matchesBrand;
  });

  const calculateMargin = (cost?: string | null, sale?: string | null) => {
    const c = parseFloat(cost || '0');
    const s = parseFloat(sale || '0');
    if (c > 0 && s >= c) {
      return (((s - c) / c) * 100).toFixed(0);
    }
    return '0';
  };

  return (
    <div>
      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Pesquise por descrição, marca ou código de barras (EAN)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Marcas</option>
            {brands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listagem */}
      {loading ? (
        <p className="text-xs text-slate-500 text-center py-12">Carregando catálogo de produtos...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-xs text-slate-400">Nenhum produto encontrado com os filtros informados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3 w-12 text-center">Foto</th>
                <th className="p-3 font-semibold">Produto / Marca / EAN</th>
                <th className="p-3 font-semibold text-right">Custo</th>
                <th className="p-3 font-semibold text-right">Venda (R$) / Margem</th>
                <th className="p-3 font-semibold text-center">Estoque Atual</th>
                <th className="p-3 font-semibold text-center">Mín / Ideal / Máx</th>
                <th className="p-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const margin = calculateMargin(p.costPrice, p.salePrice);
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center">
                      <div className="w-9 h-9 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden mx-auto">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.description} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs">📷</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{p.description}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        EAN: {p.ean || 'N/A'} {p.brand ? `| Marca: ${p.brand}` : ''} | Unid: {p.unit}
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700">
                      R$ {Number(p.costPrice || 0).toFixed(2)}
                      {p.lastPurchasePrice && (
                        <span className="block text-[10px] text-slate-400">Últ: R$ {Number(p.lastPurchasePrice).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-600">
                      {p.salePrice ? `R$ ${Number(p.salePrice).toFixed(2)}` : '-'}
                      <span className="block text-[11px] text-amber-700 font-bold">
                        Margem: {margin}%
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">
                      {p.stockCurrent ?? 0}
                    </td>
                    <td className="p-3 text-center text-slate-600 font-mono text-[11px]">
                      <span className="text-amber-600" title="Estoque Mínimo">{p.stockMin ?? 0}</span> /{' '}
                      <span className="text-blue-600" title="Estoque Ideal">{p.stockIdeal ?? 0}</span> /{' '}
                      <span className="text-slate-500" title="Estoque Máximo">{p.stockMax ?? 0}</span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}