'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

interface Product {
  id: string;
  description: string;
  brand?: string | null;
  unit: string;
  boxQuantity: number;
  costPrice?: string | null;
}

interface ItemEntrada {
  productId: string;
  quantityEntered: number | '';
  unitType: 'UN' | 'CX' | 'PCT';
  unitCost: number | '';
}

interface DuplicataBoleto {
  numeroParcela: number;
  valor: number | '';
  vencimento: string;
}

export default function NotaManualPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [products, setProducts] = useState<Product[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierCnpj, setSupplierCnpj] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('BOLETO 30 DIAS');
  
  // Itens da Nota
  const [items, setItems] = useState<ItemEntrada[]>([
    { productId: '', quantityEntered: '', unitType: 'UN', unitCost: '' }
  ]);

  // Gestão de Boletos / Duplicatas
  const [duplicatas, setDuplicatas] = useState<DuplicataBoleto[]>([
    { numeroParcela: 1, valor: '', vencimento: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await apiFetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setProducts(data);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      }
    }
    loadProducts();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', quantityEntered: '', unitType: 'UN', unitCost: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemEntrada, value: unknown) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'productId') {
        const selectedProd = products.find((p) => p.id === value);
        if (selectedProd && selectedProd.costPrice) {
          updated[index].unitCost = Number(selectedProd.costPrice);
        }
      }
      return updated;
    });
  };

  const handleAddDuplicata = () => {
    setDuplicatas((prev) => [
      ...prev,
      { numeroParcela: prev.length + 1, valor: '', vencimento: '' }
    ]);
  };

  const handleRemoveDuplicata = (index: number) => {
    setDuplicatas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDuplicataChange = (index: number, field: keyof DuplicataBoleto, value: unknown) => {
    setDuplicatas((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Cálculo automático do valor total dos itens para sugerir nas parcelas
  const totalNotaCalculado = items.reduce((acc, curr) => {
    const qtd = Number(curr.quantityEntered || 0);
    const custo = Number(curr.unitCost || 0);
    return acc + (qtd * custo);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Informe o nome do fornecedor.');
      return;
    }
    if (items.some((i) => !i.productId || !i.quantityEntered)) {
      alert('Preencha o produto e a quantidade de todos os itens.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/api/notes/manual-entry', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          supplierName,
          supplierCnpj,
          invoiceNumber,
          paymentTerms,
          items,
          duplicatas,
          totalAmount: totalNotaCalculado,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar entrada.');

      setSuccessMsg('Nota fiscal, itens e títulos financeiros (boletos) registados com sucesso!');
      setSupplierName('');
      setSupplierCnpj('');
      setInvoiceNumber('');
      setItems([{ productId: '', quantityEntered: '', unitType: 'UN', unitCost: '' }]);
      setDuplicatas([{ numeroParcela: 1, valor: '', vencimento: '' }]);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erro ao salvar entrada.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Entrada Manual de Notas & Financeiro"
        subtitle="Registe documentos fiscais, confira itens item por item e controle os vencimentos de boletos."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/notas/entrada" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar para Entrada via XML
          </Link>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl space-y-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          {/* Seção 1: Dados do Fornecedor e Empresa */}
          <div className="space-y-4">
            <div className="border-b pb-3 border-slate-500/10">
              <h2 className="text-sm font-black uppercase tracking-wider">1. Dados do Fornecedor & Documento</h2>
              <p className="text-xs opacity-60 mt-0.5">Identificação da empresa emissora e condições comerciais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Fornecedor / Distribuidora *</label>
                <input
                  type="text"
                  placeholder="Ex: Solfarma Distribuidora"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">CNPJ do Fornecedor</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={supplierCnpj}
                  onChange={(e) => setSupplierCnpj(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Número da Nota Fiscal</label>
                <input
                  type="text"
                  placeholder="Ex: 000123456"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Condição de Pagamento</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-bold"
                >
                  <option value="BOLETO À VISTA">Boleto À Vista</option>
                  <option value="BOLETO 14 DIAS">Boleto 14 Dias</option>
                  <option value="BOLETO 21 DIAS">Boleto 21 Dias</option>
                  <option value="BOLETO 28 DIAS">Boleto 28 Dias</option>
                  <option value="BOLETO 14/21/28">Boleto 14/21/28 Dias (Parcelado)</option>
                  <option value="PIX">PIX</option>
                  <option value="TRANSFERENCIA">Transferência Bancária</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Entrada de Produtos Item por Item */}
          <div className="space-y-4 border-t pt-6 border-slate-500/10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">2. Conferência de Itens Item por Item</h3>
                <p className="text-xs opacity-60">Adicione os produtos recebidos e informe se a compra foi em Caixa ou Unidade.</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition cursor-pointer"
              >
                + Adicionar Item na Nota
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-2xl border border-slate-500/15 bg-slate-500/5">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold mb-1">Produto *</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950"
                      required
                    >
                      <option value="">Selecione o produto no catálogo...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.description} ({p.brand || 'Geral'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold mb-1">Quantidade *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qtd"
                      value={item.quantityEntered}
                      onChange={(e) => handleItemChange(index, 'quantityEntered', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold mb-1">Unidade da Nota</label>
                    <select
                      value={item.unitType}
                      onChange={(e) => handleItemChange(index, 'unitType', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-bold text-indigo-600 dark:text-indigo-400"
                    >
                      <option value="UN">Unidade (UN)</option>
                      <option value="CX">Caixa (CX)</option>
                      <option value="PCT">Pacote (PCT)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold mb-1">Custo Unit. (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(index, 'unitCost', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 transition cursor-pointer"
                        title="Remover"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right font-mono text-xs bg-slate-500/10 px-4 py-2 rounded-xl">
                Valor Total Calculado dos Itens: <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">R$ {totalNotaCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>

          {/* Seção 3: Contas a Pagar / Gestão de Boletos */}
          <div className="space-y-4 border-t pt-6 border-slate-500/10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">3. Contas a Pagar & Vencimento de Boletos</h3>
                <p className="text-xs opacity-60">Registe os valores e as datas de vencimento das parcelas/boletos desta nota.</p>
              </div>
              <button
                type="button"
                onClick={handleAddDuplicata}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer"
              >
                + Adicionar Parcela / Boleto
              </button>
            </div>

            <div className="space-y-3">
              {duplicatas.map((duplicata, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-2xl border border-slate-500/15 bg-slate-500/5">
                  
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold mb-1">Identificação</label>
                    <div className="px-3 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 rounded-xl">
                      Parcela Nº {duplicata.numeroParcela}
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold mb-1">Valor da Parcela (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={duplicata.valor}
                      onChange={(e) => handleDuplicataChange(index, 'valor', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold mb-1">Data de Vencimento *</label>
                    <input
                      type="date"
                      value={duplicata.vencimento}
                      onChange={(e) => handleDuplicataChange(index, 'vencimento', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {duplicatas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDuplicata(index)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 transition cursor-pointer"
                        title="Remover parcela"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'A registar entrada e financeiro...' : '✅ Efetivar Entrada da Nota e Gerar Contas a Pagar'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}