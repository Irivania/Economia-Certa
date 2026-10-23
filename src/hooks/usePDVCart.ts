'use client';

import { useState, useRef, useCallback, useMemo } from 'react';

export interface ProductItem {
  id: string;
  description: string;
  ean: string | null;
  salePrice: string | null;
  stockCurrent: number;
  imageUrl: string | null;
  unitOfMeasure?: 'UN' | 'KG' | 'LT' | 'CX';
  discountAmount?: number;
  promotionId?: string;
}

export interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
  unitOfMeasure?: 'UN' | 'KG' | 'LT' | 'CX';
  discountAmount?: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

const MAX_QUANTITY_PER_ITEM = 9999;

function validatePriceAndQty(price: number, qty: number): { isValid: boolean; error?: string } {
  if (!Number.isFinite(price) || price < 0) {
    return { isValid: false, error: 'O preço do produto é inválido ou negativo.' };
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return { isValid: false, error: 'A quantidade deve ser maior do que zero.' };
  }
  if (qty > MAX_QUANTITY_PER_ITEM) {
    return { isValid: false, error: `A quantidade máxima permitida por item é ${MAX_QUANTITY_PER_ITEM}.` };
  }
  return { isValid: true };
}

export function usePDVCart(
  isRegisterOpen: boolean,
  isPaused: boolean,
  onNotify?: (message: string, type: NotificationType) => void
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string, type: NotificationType = 'error') => {
    if (onNotify) {
      onNotify(message, type);
    } else {
      console.warn(`[PDV Notification - ${type.toUpperCase()}]: ${message}`);
      window.alert(message);
    }
  }, [onNotify]);

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    });
  }, []);

  const handleAddToCart = useCallback((product: ProductItem, customQty?: number) => {
    if (!isRegisterOpen || isPaused) {
      notify('O caixa encontra-se fechado ou pausado. Impossível realizar vendas.', 'warning');
      return;
    }

    if (product.salePrice === null || product.salePrice === undefined || product.salePrice === '') {
      notify(`O produto "${product.description}" não possui preço de venda definido.`, 'error');
      focusSearchInput();
      return;
    }

    const price = Number(product.salePrice);
    let qtyToAdd = Number(customQty);

    if (!Number.isFinite(qtyToAdd) || qtyToAdd <= 0) {
      qtyToAdd = 1;
      if (searchTerm.includes('*')) {
        const parts = searchTerm.split('*');
        const parsedQty = Number(parts[0]);
        if (Number.isFinite(parsedQty) && parsedQty > 0) {
          qtyToAdd = Math.floor(parsedQty);
        }
      }
    }

    const validation = validatePriceAndQty(price, qtyToAdd);
    if (!validation.isValid) {
      notify(validation.error || 'Dados inválidos.', 'error');
      focusSearchInput();
      return;
    }

    const existingInCart = cart.find((item) => item.productId === product.id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;
    const requestedTotalQty = currentCartQty + qtyToAdd;

    if (product.stockCurrent !== undefined && product.stockCurrent !== null) {
      if (requestedTotalQty > product.stockCurrent) {
        notify(`Stock insuficiente para "${product.description}". Disponível: ${product.stockCurrent}, Solicitado: ${requestedTotalQty}.`, 'warning');
      }
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);
      
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = item.quantity + qtyToAdd;
        
        const validationCheck = validatePriceAndQty(item.unitPrice, newQty);
        if (!validationCheck.isValid) {
          notify(validationCheck.error || 'Quantidade excedida.', 'error');
          return prev;
        }

        const newSubtotal = Number((newQty * item.unitPrice).toFixed(2));
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: Number.isFinite(newSubtotal) ? newSubtotal : 0,
        };
        return updatedCart;
      }

      const initialSubtotal = Number((price * qtyToAdd).toFixed(2));
      return [
        ...prev,
        {
          productId: product.id,
          description: product.description,
          unitPrice: price,
          quantity: qtyToAdd,
          subtotal: Number.isFinite(initialSubtotal) ? initialSubtotal : 0,
          imageUrl: product.imageUrl,
          unitOfMeasure: product.unitOfMeasure || 'UN',
        },
      ];
    });

    setSearchTerm('');
    focusSearchInput();
  }, [isRegisterOpen, isPaused, searchTerm, cart, notify, focusSearchInput]);

  const handleSaveItemEdit = useCallback((productId: string) => {
    const newPrice = Number(editPrice);
    const newQty = Number(editQty);

    const validation = validatePriceAndQty(newPrice, newQty);
    if (!validation.isValid) {
      notify(validation.error || 'Valores inválidos para preço ou quantidade.', 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const safeSubtotal = Number((newPrice * newQty).toFixed(2));
          return {
            ...item,
            unitPrice: newPrice,
            quantity: newQty,
            subtotal: Number.isFinite(safeSubtotal) ? safeSubtotal : 0,
          };
        }
        return item;
      })
    );
    setEditingProductId(null);
    focusSearchInput();
  }, [editPrice, editQty, notify, focusSearchInput]);

  const totalCart = useMemo(() => {
    const sum = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
    return Number.isFinite(sum) ? Number(sum.toFixed(2)) : 0;
  }, [cart]);

  return useMemo(() => ({
    cart,
    setCart,
    searchTerm,
    setSearchTerm,
    editingProductId,
    setEditingProductId,
    editPrice,
    setEditPrice,
    editQty,
    setEditQty,
    searchInputRef,
    totalCart,
    handleAddToCart,
    handleSaveItemEdit,
    focusSearchInput,
  }), [
    cart,
    searchTerm,
    editingProductId,
    editPrice,
    editQty,
    totalCart,
    handleAddToCart,
    handleSaveItemEdit,
    focusSearchInput,
  ]);
}