'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ManagerAuthModal } from '@/components/pdv/ManagerAuthModal';
import { PDVProductSearch } from '@/components/pdv/PDVProductSearch';
import { PDVCartList } from '@/components/pdv/PDVCartList';
import { PDVCheckoutPanel } from '@/components/pdv/PDVCheckoutPanel';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

interface ProductItem {
  id: string;
  description: string;
  ean: string | null;
  salePrice: string | null;
  stockCurrent: number;
  imageUrl: string | null;
}

interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

interface PartnerItem {
  id: string;
  type: 'EMPLOYEE' | 'COMPANY_PARTNER';
  name: string;
  document: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  active: boolean;
}

type PaymentMethodType = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CONVENIO';

export default function PDVPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'REMOVE' | 'EDIT'; productId: string } | null>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    try {
      const [prodRes, partRes] = await Promise.all([
        apiFetch(`/api/products?companyId=${companyId}`),
        apiFetch(`/api/partners?companyId=${companyId}`)
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) setProducts(prodData);
      }

      if (partRes.ok) {
        const partData = await partRes.json();
        if (Array.isArray(partData)) setPartners(partData.filter((p: PartnerItem) => p.active));
      }
    } catch (err) {
      console.error('Erro ao carregar dados do PDV:', err);
    }
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!companyId) return;
      try {
        const [prodRes, partRes] = await Promise.all([
          apiFetch(`/api/products?companyId=${companyId}`),
          apiFetch(`/api/partners?companyId=${companyId}`)
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (isMounted && Array.isArray(prodData)) setProducts(prodData);
        }

        if (partRes.ok) {
          const partData = await partRes.json();
          if (isMounted && Array.isArray(partData)) setPartners(partData.filter((p: PartnerItem) => p.active));
        }
      } catch (err) {
        console.error('Erro ao carregar dados do PDV:', err);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleAddToCart = (product: ProductItem, customQty?: number) => {
    const price = Number(product.salePrice || 0);
    let qtyToAdd = customQty && customQty > 0 ? customQty : 1;

    if (!customQty && searchTerm.includes('*')) {
      const parts = searchTerm.split('*');
      const parsedQty = parseInt(parts[0], 10);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        qtyToAdd = parsedQty;
      }
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          description: product.description,
          unitPrice: price,
          quantity: qtyToAdd,
          subtotal: price * qtyToAdd,
          imageUrl: product.imageUrl,
        },
      ];
    });
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const requestManagerAction = (type: 'REMOVE' | 'EDIT', productId: string) => {
    setPendingAction({ type, productId });
    setIsAuthModalOpen(true);
  };

  const handleManagerAuthorized = () => {
    if (!pendingAction) return;

    const { type, productId } = pendingAction;
    if (type === 'REMOVE') {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else if (type === 'EDIT') {
      const item = cart.find((i) => i.productId === productId);
      if (item) {
        setEditingProductId(productId);
        setEditPrice(item.unitPrice.toString());
        setEditQty(item.quantity.toString());
      }
    }
    setPendingAction(null);
  };

  const handleSaveItemEdit = (productId: string) => {
    const newPrice = parseFloat(editPrice);
    const newQty = parseInt(editQty, 10);

    if (isNaN(newPrice) || newPrice < 0 || isNaN(newQty) || newQty <= 0) {
      alert('Valores inválidos para preço ou quantidade.');
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              unitPrice: newPrice,
              quantity: newQty,
              subtotal: newPrice * newQty,
            }
          : item
      )
    );
    setEditingProductId(null);
  };

  const totalCart = cart.reduce((acc, curr) => acc + curr.subtotal, 0);

  const filteredProducts = searchTerm.trim()
    ? products.filter((p) => {
        const cleanTerm = searchTerm.includes('*') ? searchTerm.split('*')[1] || '' : searchTerm;
        return (
          p.description.toLowerCase().includes(cleanTerm.toLowerCase()) ||
          (p.ean && p.ean.includes(cleanTerm))
        );
      })
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        let customQty = 0;
        let queryToMatch = searchTerm;

        if (searchTerm.includes('*')) {
          const parts = searchTerm.split('*');
          customQty = parseInt(parts[0], 10) || 1;
          queryToMatch = parts[1] || '';
        }

        const exactMatch = filteredProducts.find(
          (p) => p.ean && p.ean.toLowerCase() === queryToMatch.trim().toLowerCase()
        );
        handleAddToCart(exactMatch || filteredProducts[0], customQty);
      }
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('O carrinho está vazio.');
      return;
    }

    let finalCustomerName = customerName || 'Cliente Balcão';

    if (paymentMethod === 'CONVENIO') {
      if (!selectedPartnerId) {
        alert('Selecione o funcionário ou empresa parceira para faturamento no convênio.');
        return;
      }
      const partner = partners.find(p => p.id === selectedPartnerId);
      if (partner) {
        const limit = Number(partner.creditLimit || 0);
        const currentDebt = Number(partner.currentBalance || 0);
        if (currentDebt + totalCart > limit) {
          alert(`Limite de crédito excedido para ${partner.name}!\nLimite: R$ ${limit.toFixed(2)} | Saldo Devedor: R$ ${currentDebt.toFixed(2)}`);
          return;
        }
        finalCustomerName = `CONVÊNIO: ${partner.name}`;
      }
    }

    try {
      setLoading(true);
      setSuccessMsg('');

      const res = await apiFetch('/api/pdv/checkout', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          mode: 'CASHIER',
          operatorName: 'Operador de Caixa',
          customerName: finalCustomerName,
          partnerId: paymentMethod === 'CONVENIO' ? selectedPartnerId : null,
          items: cart,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao finalizar venda.');

      setSuccessMsg(`Venda finalizada com sucesso! ID: ${data.saleId.substring(0, 8)}`);
      setCart([]);
      setCustomerName('');
      setSelectedPartnerId('');
      setPaymentMethod('CASH');
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="PDV - Frente de Caixa Profissional"
        subtitle="Atendimento ágil, convênios e controlo gerencial."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PDVProductSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredProducts={filteredProducts}
            onSelectProduct={(p) => handleAddToCart(p)}
            inputRef={searchInputRef}
            onKeyDown={handleKeyDown}
            isDarkMode={isDarkMode}
          />

          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <PDVCartList
              cart={cart}
              onRequestAction={requestManagerAction}
              editingProductId={editingProductId}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              editQty={editQty}
              setEditQty={setEditQty}
              onSaveEdit={handleSaveItemEdit}
              onCancelEdit={() => setEditingProductId(null)}
            />

            <PDVCheckoutPanel
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              partners={partners}
              selectedPartnerId={selectedPartnerId}
              setSelectedPartnerId={setSelectedPartnerId}
              customerName={customerName}
              setCustomerName={setCustomerName}
              totalCart={totalCart}
              loading={loading}
              onCheckout={handleCheckout}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </main>

      <ManagerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onAuthorized={handleManagerAuthorized}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}