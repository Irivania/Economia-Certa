'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductSelectionModal from '@/components/ProductSelectionModal';
import QuotationFormHeader from '@/components/QuotationFormHeader';
import QuotationBasicInfo from '@/components/QuotationBasicInfo';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import QuotationSuppliersSection from '@/components/QuotationSuppliersSection';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
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

interface QuotationItem {
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

const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 🛡️ Função de sanitização para limpar strings importadas de ficheiros externos
function sanitizeText(input: string): string {
  if (!input) return '';
  let clean = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  // Neutraliza tentativas de injeção de fórmulas (CSV Injection)
  if (/^[=+\-@\t\r]/.test(clean)) {
    clean = `'${clean}`;
  }
  // Remove tags HTML acidentais ou maliciosas (previne XSS)
  clean = clean.replace(/<[^>]*>?/gm, '');
  return clean;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductFromDb[]>([]);

  const [title, setTitle] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto 28 Dias');
  
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [supRes, prodRes] = await Promise.all([
          fetch(`/api/suppliers?companyId=${companyId}`),
          fetch(`/api/products?companyId=${companyId}`)
        ]);

        if (supRes.ok) {
          const supData = await supRes.json();
          setSuppliers(Array.isArray(supData) ? supData : []);
        }

        let prodData = [];
        if (prodRes.ok) {
          prodData = await prodRes.json();
        }
        if (!Array.isArray(prodData) || prodData.length === 0) {
          const fallbackRes = await fetch('/api/products');
          if (fallbackRes.ok) prodData = await fallbackRes.json();
        }

        const productList = Array.isArray(prodData) ? prodData : prodData.products || prodData.data || [];
        setCatalogProducts(productList);
      } catch (loadError) {
        console.error(loadError);
        setError('Não foi possível carregar os dados iniciais.');
      } finally {
        setLoadingSuppliers(false);
      }
    }

    loadInitialData();
  }, []);

  const toggleSupplier = (supplierId: string) => {
    setSelectedSupplierIds((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId],
    );
  };

  const handleSelectAllSuppliers = () => {
    const allIds = suppliers.map((sup) => sup.id);
    setSelectedSupplierIds(allIds);
  };

  const handleDeselectAllSuppliers = () => {
    setSelectedSupplierIds([]);
  };

  const handleRemoveItem = (id: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== id && item.productId !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setQuotationItems(prev => prev.map(i => (i.id === id || i.productId === id) ? { ...i, requestedQuantity: qty } : i));
  };

  const handleAddSelectedProducts = (selectedProductIds: string[]) => {
    const productsToAdd = catalogProducts.filter(p => selectedProductIds.includes(p.id));

    const newItems: QuotationItem[] = productsToAdd
      .filter(p => !quotationItems.some(existing => existing.productId === p.id))
      .map(p => {
        return {
          id: p.id,
          productId: p.id,
          description: p.description,
          brand: p.brand || null,
          ean: p.ean || null,
          imageUrl: p.imageUrl || null,
          stockCurrent: p.stockCurrent || 0,
          stockIdeal: p.stockIdeal || 0,
          requestedQuantity: 0,
        };
      });

    setQuotationItems(prev => [...prev, ...newItems]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛡️ Validação de tamanho máximo (Exemplo: 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
      e.target.value = '';
      return;
    }

    setAttachedFile(file);

    try {
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.csv')) {
        const text = await file.text();
        const lines = text
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().includes('produto') && !l.toLowerCase().includes('descricao'));

        if (lines.length === 0) {
          alert('O arquivo parece estar vazio ou em um formato inválido.');
          return;
        }

        processImportedLines(lines.map(line => {
          const parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(Boolean);
          return {
            ean: sanitizeText(parts.length >= 3 ? parts[0] : parts.length === 2 ? parts[0] : ''),
            description: sanitizeText(parts.length >= 3 ? parts[1] : parts.length === 2 ? parts[1] : line),
            brand: sanitizeText(parts.length >= 3 ? parts[2] : '')
          };
        }));
      } 
      else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const formattedRows = rows
          .map(row => row.map(cell => (cell !== undefined && cell !== null ? sanitizeText(String(cell)) : '')))
          .filter((row): row is string[] => row.some(cell => cell !== ''))
          .filter((_, index) => {
            if (index > 0) return true;
            const firstCell = String(rows[0]?.[0] || '').toLowerCase();
            return !firstCell.includes('produto') && !firstCell.includes('ean');
          });

        if (formattedRows.length === 0) {
          alert('A planilha parece estar vazia ou em um formato inválido.');
          return;
        }

        processImportedLines(formattedRows.map(cols => ({
          ean: cols[0] || '',
          description: cols[1] || cols[0] || '',
          brand: cols[2] || ''
        })));
      } 
      else {
        alert(`Arquivo "${file.name}" anexado com sucesso para envio ao representante!`);
      }
    } catch (err) {
      console.error('Erro ao ler arquivo:', err);
      alert('Não foi possível processar o conteúdo do arquivo.');
    }
  };

  const processImportedLines = (rawItems: { ean: string; description: string; brand: string }[]) => {
    setQuotationItems(prevCurrentItems => {
      const parsedItems: QuotationItem[] = [...prevCurrentItems];
      let addedCount = 0;

      for (const item of rawItems) {
        const cleanDesc = item.description.replace(/^["']|["']$/g, '');
        if (!cleanDesc) continue;

        const foundProduct = catalogProducts.find(
          p => (item.ean && p.ean === item.ean) || p.description.toLowerCase().includes(cleanDesc.toLowerCase())
        );

        if (foundProduct) {
          const alreadyExists = parsedItems.some(existing => existing.productId === foundProduct.id);
          if (!alreadyExists) {
            parsedItems.push({
              id: foundProduct.id,
              productId: foundProduct.id,
              description: foundProduct.description,
              brand: foundProduct.brand || item.brand || null,
              ean: foundProduct.ean || item.ean || null,
              imageUrl: foundProduct.imageUrl || null,
              stockCurrent: foundProduct.stockCurrent || 0,
              stockIdeal: foundProduct.stockIdeal || 0,
              requestedQuantity: 0,
            });
            addedCount++;
          }
        } else {
          const customId = `file-item-${Math.random().toString(36).substring(2, 9)}`;
          const alreadyExistsByName = parsedItems.some(
            i => i.description.toLowerCase() === cleanDesc.toLowerCase()
          );
          if (!alreadyExistsByName) {
            parsedItems.push({
              id: customId,
              productId: customId,
              description: cleanDesc,
              brand: item.brand || 'Importado de Arquivo',
              ean: item.ean || null,
              imageUrl: null,
              stockCurrent: 0,
              stockIdeal: 0,
              requestedQuantity: 0,
            });
            addedCount++;
          }
        }
      }

      if (addedCount > 0) {
        alert(`${addedCount} item(ns) importado(s) e formatado(s) com sucesso!`);
      } else {
        alert('Todos os itens do arquivo já constavam na lista.');
      }

      return parsedItems;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Informe um título para a cotação.');
      return;
    }

    if (!paymentTerms.trim()) {
      setError('Informe a condição de pagamento.');
      return;
    }

    if (selectedSupplierIds.length === 0) {
      setError('Selecione ao menos um fornecedor.');
      return;
    }

    if (quotationItems.length === 0) {
      setError('Adicione pelo menos um item à cotação.');
      return;
    }

    const todayStr = getTodayDateString();
    if (startDate && startDate < todayStr) {
      setError('A data de início não pode ser anterior ao dia de hoje.');
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('A data de término deve ser posterior ou igual à data de início.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          title: title.trim(),
          paymentTerms: paymentTerms.trim(),
          supplierIds: selectedSupplierIds,
          startDate: startDate || null,
          endDate: endDate || null,
          closingTime: closingTime || null,
          items: quotationItems,
          fileName: attachedFile ? attachedFile.name : null,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar a cotação.');

      router.push('/cotacoes');
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível criar a cotação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <QuotationFormHeader onOpenModal={() => setIsModalOpen(true)} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <QuotationBasicInfo
            title={title}
            setTitle={setTitle}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            closingTime={closingTime}
            setClosingTime={setClosingTime}
            paymentTerms={paymentTerms}
            setPaymentTerms={setPaymentTerms}
            attachedFile={attachedFile}
            onFileChange={handleFileChange}
            onRemoveFile={() => setAttachedFile(null)}
          />

          <QuotationItemsTable
            items={quotationItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Distribuidores / Fornecedores Convidados</h2>
              
              <div className="flex items-center gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleSelectAllSuppliers}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  Marcar todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllSuppliers}
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            <QuotationSuppliersSection
              suppliers={suppliers}
              selectedSupplierIds={selectedSupplierIds}
              onToggleSupplier={toggleSupplier}
              loading={loadingSuppliers}
            />
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link href="/cotacoes" className="rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-100 border border-slate-200 bg-white">Cancelar</Link>
            <button type="submit" disabled={submitting || loadingSuppliers || suppliers.length === 0} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? 'Criando...' : 'Criar cotação'}
            </button>
          </div>
        </form>

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
    </main>
  );
}