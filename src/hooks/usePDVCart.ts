'use client';

import { useState, useRef } from 'react';

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

export function usePDVCart(isRegisterOpen: boolean, isPaused: boolean) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  return {
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
  };
}