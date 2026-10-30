'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

export interface Product {
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
  classTrib?: string | null;
  anvisaRegistry?: string | null;
  manufacturerName?: string | null;
  weight?: string | null;
  dimensions?: string | null;
}

export function useProductManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const [formMode, setFormMode] = useState<'minimal' | 'complete'>('minimal');
  const [isFromImport] = useState(() => !!searchParams.get('description'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState(() => searchParams.get('description') || '');
  const [ean, setEan] = useState(() => searchParams.get('ean') || '');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [unit, setUnit] = useState('UN');
  const [boxQuantity, setBoxQuantity] = useState<number | ''>(1);
  const [costPrice, setCostPrice] = useState('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState(() => searchParams.get('salePrice') || '');
  
  const [stockCurrent, setStockCurrent] = useState<number | ''>(() => {
    const stock = searchParams.get('stockCurrent');
    return stock ? Number(stock) : '';
  });
  const [stockMin, setStockMin] = useState<number | ''>('');
  const [stockIdeal, setStockIdeal] = useState<number | ''>(() => {
    const stock = searchParams.get('stockIdeal');
    return stock ? Number(stock) : '';
  });
  const [stockMax, setStockMax] = useState<number | ''>('');

  const [ncm, setNcm] = useState('');
  const [cest, setCest] = useState('');
  const [classTrib, setClassTrib] = useState('');

  const [anvisaRegistry, setAnvisaRegistry] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = getCompanyId();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshProducts = useCallback(async () => {
    try {
      const res = await apiFetch('/api/products');
      if (!res.ok) throw new Error('Erro ao carregar produtos.');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
        const uniqueBrands = Array.from(
          new Set(data.map((p: Product) => p.brand).filter(Boolean))
        ) as string[];
        setBrands(uniqueBrands);
      }
      setError(null);
    } catch (err) {
      setError('Não foi possível buscar os produtos.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await apiFetch('/api/products');
        if (!res.ok) throw new Error('Erro ao carregar produtos.');
        const data = await res.json();
        
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
          const uniqueBrands = Array.from(
            new Set(data.map((p: Product) => p.brand).filter(Boolean))
          ) as string[];
          setBrands(uniqueBrands);
        }
      } catch (err) {
        if (isMounted) setError('Não foi possível buscar os produtos.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setEan('');
    setBrand('');
    setImageUrl('');
    setUnit('UN');
    setBoxQuantity(1);
    setCostPrice('');
    setLastPurchasePrice('');
    setSalePrice('');
    setStockCurrent('');
    setStockMin('');
    setStockIdeal('');
    setStockMax('');
    setNcm('');
    setCest('');
    setClassTrib('');
    setAnvisaRegistry('');
    setManufacturerName('');
    setWeight('');
    setDimensions('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('A descrição do produto é obrigatória.');
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const bodyData = {
        id: editingId || undefined,
        companyId,
        code: ean,
        description,
        brand,
        imageUrl: formMode === 'complete' ? imageUrl : null,
        unit: formMode === 'complete' ? unit : 'UN',
        boxQuantity: formMode === 'complete' && boxQuantity !== '' ? Number(boxQuantity) : 1,
        costPrice: formMode === 'complete' && costPrice ? costPrice.replace(/\./g, '').replace(',', '.') : null,
        lastPurchasePrice: formMode === 'complete' && lastPurchasePrice ? lastPurchasePrice.replace(/\./g, '').replace(',', '.') : null,
        salePrice: salePrice ? salePrice.replace(/\./g, '').replace(',', '.') : null,
        stockCurrent: stockCurrent === '' || stockCurrent === undefined ? 0 : Number(stockCurrent),
        stockMin: formMode === 'complete' && stockMin !== '' ? Number(stockMin) : 0,
        stockIdeal: formMode === 'complete' && stockIdeal !== '' ? Number(stockIdeal) : 0,
        stockMax: formMode === 'complete' && stockMax !== '' ? Number(stockMax) : 0,
        ncm: formMode === 'complete' ? ncm : null,
        cest: formMode === 'complete' ? cest : null,
        classTrib: formMode === 'complete' ? classTrib : null,
        anvisaRegistry: formMode === 'complete' ? anvisaRegistry : null,
        manufacturerName: formMode === 'complete' ? manufacturerName : null,
        weight: formMode === 'complete' ? weight : null,
        dimensions: formMode === 'complete' ? dimensions : null,
      };

      const res = await apiFetch(url, { method, body: JSON.stringify(bodyData) });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Erro ao salvar produto.';

        if (errorMessage.includes('Já existe um produto cadastrado com o EAN')) {
          alert(`⚠️ ${errorMessage}\n\nO produto já consta no catálogo. A retornar à cotação...`);
          if (returnTo) {
            router.push(returnTo);
            return;
          }
        }

        throw new Error(errorMessage);
      }

      resetForm();
      showToast(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      await refreshProducts();

      if (returnTo && !editingId) {
        setTimeout(() => { router.push(returnTo); }, 1000);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro ao salvar produto.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setDescription(prod.description || '');
    setEan(prod.ean || '');
    setBrand(prod.brand || '');
    setImageUrl(prod.imageUrl || '');
    setUnit(prod.unit || 'UN');
    setBoxQuantity(prod.boxQuantity ?? 1);
    setCostPrice(prod.costPrice || '');
    setLastPurchasePrice(prod.lastPurchasePrice || '');
    setSalePrice(prod.salePrice || '');
    setStockCurrent(prod.stockCurrent ?? '');
    setStockMin(prod.stockMin ?? '');
    setStockIdeal(prod.stockIdeal ?? '');
    setStockMax(prod.stockMax ?? '');
    setNcm(prod.ncm || '');
    setCest(prod.cest || '');
    setClassTrib(prod.classTrib || '');
    setAnvisaRegistry(prod.anvisaRegistry || '');
    setManufacturerName(prod.manufacturerName || '');
    setWeight(prod.weight || '');
    setDimensions(prod.dimensions || '');
    setFormMode('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      const res = await apiFetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir produto.');
      showToast('Produto excluído com sucesso!');
      await refreshProducts();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o produto.');
    }
  };

  return {
    products, brands, loading, error, isCmdOpen, setIsCmdOpen,
    formMode, setFormMode, isFromImport, searchTerm, setSearchTerm,
    selectedBrand, setSelectedBrand, editingId, description, setDescription,
    ean, setEan, brand, setBrand, imageUrl, setImageUrl, unit, setUnit,
    boxQuantity, setBoxQuantity, costPrice, setCostPrice, lastPurchasePrice,
    setLastPurchasePrice, salePrice, setSalePrice, stockCurrent, setStockCurrent,
    stockMin, setStockMin, stockIdeal, setStockIdeal, stockMax, setStockMax,
    ncm, setNcm, cest, setCest, classTrib, setClassTrib, anvisaRegistry,
    setAnvisaRegistry, manufacturerName, setManufacturerName, weight, setWeight,
    dimensions, setDimensions, submitting, toastMessage, returnTo,
    handleSubmit, handleEdit, handleDelete, resetForm
  };
}