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

export function usePDVState() {
  const router = useRouter();
  const companyId = getCompanyId();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [openingRawValue, setOpeningRawValue] = useState(0);
  const [openingDisplayValue, setOpeningDisplayValue] = useState('');

  const [registerLoading, setRegisterLoading] = useState(true);
  const [isOperator, setIsOperator] = useState(false);

  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [customerName, setCustomerName] = useState('');

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

  const handleOpeningMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numberValue = Number(value) / 100;
    
    setOpeningRawValue(numberValue);
    setOpeningDisplayValue(
      numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    );
  };

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleAddToCart = useCallback((product: ProductItem, customQty?: number) => {
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
          item.productId === product.id ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice } : item
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
  }, [isRegisterOpen, isPaused, searchTerm]);

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

      let customQty = 1;
      let queryToMatch = searchTerm.trim();

      if (queryToMatch.includes('*')) {
        const parts = queryToMatch.split('*');
        const parsedQty = parseInt(parts[0], 10);
        if (!isNaN(parsedQty) && parsedQty > 0) {
          customQty = parsedQty;
        }
        queryToMatch = (parts[1] || '').trim();
      }

      if (!queryToMatch) return;

      const exactMatchByEan = products.find(
        (p) => p.ean && p.ean.toLowerCase() === queryToMatch.toLowerCase()
      );

      if (exactMatchByEan) {
        handleAddToCart(exactMatchByEan, customQty);
        return;
      }

      const matchFromFiltered = filteredProducts.find(
        (p) => (p.ean && p.ean.toLowerCase().includes(queryToMatch.toLowerCase())) ||
               p.description.toLowerCase().includes(queryToMatch.toLowerCase())
      );

      if (matchFromFiltered) {
        handleAddToCart(matchFromFiltered, customQty);
      } else if (filteredProducts.length > 0) {
        handleAddToCart(filteredProducts[0], customQty);
      } else {
        alert('Produto não encontrado para o código ou termo informado.');
      }
    }
  };

  return {
    router,
    companyId,
    products,
    partners,
    searchTerm,
    setSearchTerm,
    cart,
    setCart,
    isRegisterOpen,
    isPaused,
    openingDisplayValue,
    handleOpeningMoneyChange,
    registerLoading,
    isOperator,
    selectedPartnerId,
    setSelectedPartnerId,
    customerName,
    setCustomerName,
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
    handleKeyDown,
    loadData,
  };
}