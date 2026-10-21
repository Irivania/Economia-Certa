'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { ManualSupplierForm } from '@/components/notas/manual/ManualSupplierForm';
import { ManualItemsTable } from '@/components/notas/manual/ManualItemsTable';
import { ManualBoletosTable } from '@/components/notas/manual/ManualBoletosTable';

interface ProductItem {
  id: string;
  description: string;
  ean: string | null;
  unit: string;
  costPrice: string | number;
}

interface ItemManual {
  productId: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

interface BoletoManual {
  identifier: string;
  amount: number;
  dueDate: string;
}

export default function NotaEntradaManualPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [supplierName, setSupplierName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto 14 Dias');

  const [productsList, setProductsList] = useState<ProductItem[]>([]);

  // Quantidade inicia a 0 e custo unitário a 0 (para o lojista preencher livremente)
  const [items, setItems] = useState<ItemManual[]>([
    { productId: '', description: '', quantity: 0, unit: 'UN', unitCost: 0 }
  ]);

  const [boletos, setBoletos] = useState<BoletoManual[]>([
    { identifier: 'Parcela Nº 1', amount: 0, dueDate: new Date().toISOString().split('T')[0] }
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      if (!companyId) return;
      try {
        const res = await apiFetch(`/api/products?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setProductsList(data);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      }
    }
    fetchProducts();
  }, [companyId]);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    
    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{3})/, '$1.$2');
    }

    setCnpj(value);
  };

  const handleCnpjBlur = async () => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    try {
      setLoadingCnpj(true);
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        const nomeEmpresa = data.razao_social || data.nome_fantasia;
        if (nomeEmpresa) {
          setSupplierName(nomeEmpresa);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar CNPJ:', err);
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleSelectProduct = (index: number, selectedId: string) => {
    if (selectedId === 'NEW') {
      router.push('/produtos?returnTo=/notas/manual');
      return;
    }

    const prod = productsList.find((p) => p.id === selectedId);
    if (prod) {
      const updated = [...items];
      updated[index] = {
        productId: prod.id,
        description: prod.description,
        quantity: 0, // Inicia zerado para o lojista digitar a quantidade real recebida
        unit: prod.unit || 'UN',
        unitCost: 0, // Inicia zerado para o lojista preencher com o custo exato desta nova nota
      };
      setItems(updated);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', description: '', quantity: 0, unit: 'UN', unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddBoleto = () => {
    setBoletos([...boletos, { identifier: `Parcela Nº ${boletos.length + 1}`, amount: 0, dueDate: new Date().toISOString().split('T')[0] }]);
  };

  const handleRemoveBoleto = (index: number) => {
    setBoletos(boletos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !invoiceNumber || items.length === 0) {
      alert('Preencha o fornecedor, o número da nota e adicione pelo menos um item.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/api/notes/manual', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          supplierName,
          cnpj,
          invoiceNumber,
          paymentTerms,
          items,
          boletos,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registar nota.');

      alert('Entrada manual e títulos no Contas a Pagar registados com sucesso!');
      setSupplierName('');
      setCnpj('');
      setInvoiceNumber('');
      setItems([{ productId: '', description: '', quantity: 0, unit: 'UN', unitCost: 0 }]);
      setBoletos([{ identifier: 'Parcela Nº 1', amount: 0, dueDate: new Date().toISOString().split('T')[0] }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar registo.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Entrada Manual de Notas & Financeiro"
        subtitle="Registe documentos fiscais, confira itens e controle os vencimentos de boletos."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/notas/entrada" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar para Entrada via XML
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ManualSupplierForm
            cnpj={cnpj}
            onCnpjChange={handleCnpjChange}
            onCnpjBlur={handleCnpjBlur}
            loadingCnpj={loadingCnpj}
            supplierName={supplierName}
            setSupplierName={setSupplierName}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            paymentTerms={paymentTerms}
            setPaymentTerms={setPaymentTerms}
            isDarkMode={isDarkMode}
          />

          <ManualItemsTable
            items={items}
            productsList={productsList}
            onSelectProduct={handleSelectProduct}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={(idx: number, field: keyof ItemManual, val: string | number) => {
              const updated = [...items];
              updated[idx] = { ...updated[idx], [field]: val };
              setItems(updated);
            }}
            isDarkMode={isDarkMode}
          />

          <ManualBoletosTable
            boletos={boletos}
            onAddBoleto={handleAddBoleto}
            onRemoveBoleto={handleRemoveBoleto}
            onBoletoChange={(bIdx: number, field: keyof BoletoManual, val: string | number) => {
              const updated = [...boletos];
              updated[bIdx] = { ...updated[bIdx], [field]: val };
              setBoletos(updated);
            }}
            isDarkMode={isDarkMode}
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'A processar entrada...' : '✅ Efetivar Entrada da Nota e Gerar Contas a Pagar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}