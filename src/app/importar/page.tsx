'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProductImportModal, Product, ItemPendente } from '@/components/ProductImportModal';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

export default function ImportarPage() {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
  const latestQuotationId = 'd7f46ae7-19c2-409d-8ab4-dfbb458c5248';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === 'Escape') {
      setIsCmdOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`/api/products?companyId=${companyId}`);
        if (!res.ok) throw new Error('Erro ao carregar produtos.');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [companyId]);

  const handleQuickRegister = async (itemPendente: ItemPendente) => {
    console.log(itemPendente);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        A carregar catálogo de produtos...
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-25 space-y-8">
        
        {/* Cartão Principal da Central de Importação */}
        <div className={`rounded-3xl border p-8 shadow-2xl transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
        }`}>
          
          {/* Navegação Secundária para o Catálogo */}
          <div className="flex items-center justify-between text-xs pb-4 border-b border-slate-500/10">
            <div>
              <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-500 border border-blue-500/20 mb-2">
                Módulo de Sincronização
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">🔄 Central de Importação Inteligente</h1>
              <p className="text-xs opacity-60 mt-1 font-medium">Melo Perfumaria — Cruzamento e Cadastro Rápido de Produtos.</p>
            </div>

            <Link href="/produtos" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition flex items-center gap-1.5">
              &larr; Voltar para Catálogo
            </Link>
          </div>

          {/* Componente Modularizado da Central de Importação */}
          <ProductImportModal 
            products={products} 
            onQuickRegister={handleQuickRegister} 
          />

        </div>

      </main>

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={latestQuotationId} />

    </div>
  );
}