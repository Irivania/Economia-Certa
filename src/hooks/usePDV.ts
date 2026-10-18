'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export function usePDV() {
  const router = useRouter();
  const companyId = getCompanyId();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Estados para valor bruto e display formatado em Real para a abertura de caixa
  const [openingRawValue, setOpeningRawValue] = useState(0);
  const [openingDisplayValue, setOpeningDisplayValue] = useState('');

  const [registerLoading, setRegisterLoading] = useState(true);
  const [isOperator, setIsOperator] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

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

    async function initPDV() {
      if (!companyId) return;
      try {
        setRegisterLoading(true);

        const sessionData = sessionStorage.getItem('melo_company_session');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          const role = String(parsed.role || '').toLowerCase();
          if (role === 'geral' || role === 'operador') {
            setIsOperator(true);
          }
        }

        const res = await fetch(`/api/pdv/register?companyId=${companyId}`);
        const data = await res.json();
        if (isMounted) {
          if (data.isOpen) {
            setIsRegisterOpen(true);
            setIsPaused(data.register?.status === 'PAUSED');
          } else {
            setIsRegisterOpen(false);
          }
        }
        await loadData();
      } catch (err) {
        console.error('Erro ao inicializar PDV:', err);
      } finally {
        if (isMounted) {
          setRegisterLoading(false);
        }
      }
    }

    initPDV();

    return () => {
      isMounted = false;
    };
  }, [companyId, loadData]);

  // Manipulador para formatar o fundo de troco em Real com centavos
  const handleOpeningMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numberValue = Number(value) / 100;
    
    setOpeningRawValue(numberValue);
    setOpeningDisplayValue(
      numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    );
  };

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcula o valor garantindo precisão nos centavos independentemente do fluxo de digitação
    const val = openingRawValue > 0 ? openingRawValue : Number(openingDisplayValue.replace(/\D/g, '')) / 100;

    if (isNaN(val) || val <= 0) {
      alert('Informe um valor de fundo de troco válido maior que zero.');
      return;
    }

    try {
      const res = await fetch('/api/pdv/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          action: 'OPEN',
          amount: val,
          operatorName: 'Operador de Caixa',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Caixa aberto com sucesso! Bom turno de trabalho 🚀');
        setIsRegisterOpen(true);
        setOpeningRawValue(0);
        setOpeningDisplayValue('');
      } else {
        alert(data.error || 'Erro ao abrir caixa.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const handleAddToCart = (product: ProductItem, customQty?: number) => {
    if (!isRegisterOpen || isPaused) {
      alert('O caixa encontra-se fechado ou pausado. Impossível realizar vendas.');
      return;
    }

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

      alert(`Venda finalizada com sucesso! ID: ${data.saleId.substring(0, 8)}`);
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

  return {
    router,
    cart,
    partners,
    searchTerm,
    setSearchTerm,
    isRegisterOpen,
    isPaused,
    openingDisplayValue,
    handleOpeningMoneyChange,
    registerLoading,
    isOperator,
    paymentMethod,
    setPaymentMethod,
    selectedPartnerId,
    setSelectedPartnerId,
    customerName,
    setCustomerName,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    pendingAction,
    setPendingAction,
    editingProductId,
    setEditingProductId,
    editPrice,
    setEditPrice,
    editQty,
    setEditQty,
    searchInputRef,
    filteredProducts,
    totalCart,
    handleOpenRegister,
    handleAddToCart,
    requestManagerAction,
    handleManagerAuthorized,
    handleSaveItemEdit,
    handleKeyDown,
    handleCheckout,
  };
}