'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductSelectionModal from '@/components/ProductSelectionModal';

interface QuotationItem {
  id: string;
  description: string;
  brand: string | null;
  ean: string | null;
  stockCurrent: number;
  stockIdeal: number;
  requestedQuantity: number;
}

interface ProductFromDb {
  id: string;
  description: string;
  brand?: string | null;
  ean?: string | null;
  imageUrl?: string | null;
  stockCurrent: number;
  stockIdeal: number;
}

export default function QuotationPage() {
  const router = useRouter();

  // Estados do Cabeçalho da Cotação
  const [title, setTitle] = useState('Cotação Reposição Semanal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [closingTime, setClosingTime] = useState('18:00');

  // Estados de Filtro e Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<ProductFromDb[]>([]);

  // Lista de itens selecionados para a cotação
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);

  // Buscar produtos do catálogo ao carregar a página
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/produtos');
        if (res.ok) {
          const data = await res.json();
          setCatalogProducts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos do catálogo', error);
      }
    }
    fetchProducts();
  }, []);

  const handleRemoveItem = (id: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== id));
  };

  // Função disparada quando você confirma a seleção múltipla no modal
  const handleAddSelectedProducts = (selectedProductIds: string[]) => {
    const productsToAdd = catalogProducts.filter(p => selectedProductIds.includes(p.id));

    const newItems: QuotationItem[] = productsToAdd
      .filter(p => !quotationItems.some(existing => existing.id === p.id))
      .map(p => ({
        id: p.id,
        description: p.description,
        brand: p.brand || null,
        ean: p.ean || null,
        stockCurrent: p.stockCurrent || 0,
        stockIdeal: p.stockIdeal || 0,
        requestedQuantity: Math.max(1, (p.stockIdeal || 0) - (p.stockCurrent || 0)),
      }));

    setQuotationItems(prev => [...prev, ...newItems]);
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cotação configurada e salva com sucesso!');
    router.push('/cotacoes');
  };

  const filteredQuotationItems = quotationItems.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between text-sm text-slate-500 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Link href="/cotacoes" className="hover:text-indigo-600 font-medium transition flex items-center gap-1">
            ← Voltar para Cotações
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/" className="hover:text-indigo-600 transition">
            🏠 Página Principal
          </Link>
        </div>
        <div>
          <Link href="/importar" className="text-indigo-600 hover:underline font-medium">
            📥 Importar Planilha de Fornecedor
          </Link>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Cotação de Compras</h1>
          <p className="text-sm text-slate-500">Configure os prazos, o horário de encerramento e selecione os itens desejados.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition shadow-sm text-sm"
          >
            + Adicionar do Catálogo
          </button>
          <button
            onClick={handleSaveQuotation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition shadow-sm text-sm"
          >
            Salvar e Abrir Cotação
          </button>
        </div>
      </div>

      {/* Formulário de Configuração de Prazos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Título da Cotação</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: Reposição Quinzenal"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Data de Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Data Término / Limite</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Horário de Encerramento</label>
          <input
            type="time"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Seção de Listagem de Itens */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-sm">Itens Incluídos na Cotação ({quotationItems.length})</h2>
          <div className="w-72">
            <input
              type="text"
              placeholder="Buscar na lista adicionada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <th className="p-3 font-semibold">Produto / Descrição</th>
                <th className="p-3 font-semibold">Marca / EAN</th>
                <th className="p-3 font-semibold text-center">Estoque Atual</th>
                <th className="p-3 font-semibold text-center">Estoque Ideal</th>
                <th className="p-3 font-semibold text-center">Qtd. Solicitada</th>
                <th className="p-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotationItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Nenhum item adicionado. Clique em &quot;+ Adicionar do Catálogo&quot; para selecionar produtos.
                  </td>
                </tr>
              ) : (
                filteredQuotationItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">{item.description}</td>
                    <td className="p-3 text-slate-500 text-xs font-mono">
                      {item.brand || 'Geral'} {item.ean ? `| ${item.ean}` : ''}
                    </td>
                    <td className="p-3 text-center text-amber-600 font-medium">{item.stockCurrent}</td>
                    <td className="p-3 text-center text-slate-600">{item.stockIdeal}</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        defaultValue={item.requestedQuantity}
                        className="w-20 text-center border border-slate-200 rounded-md py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Avançado de Seleção */}
      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={catalogProducts.map(p => ({
          ...p,
          brand: p.brand || undefined,
          ean: p.ean || undefined,
          imageUrl: p.imageUrl || undefined,
        }))}
        onAddSelectedProducts={handleAddSelectedProducts}
      />
    </div>
  );
}