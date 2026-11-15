"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { ProductImportModal } from "@/features/quotations/components/ProductImportModal";
import {
  ItemPendente,
  Product,
} from "@/features/quotations/components/import/types";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { apiFetch } from "@/lib/apiClient";

const subscribeToHydration = () => () => {};

export default function ImportarPage() {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts, addToast } = useToast();

  const latestQuotationId = "";

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === "Escape") {
      setIsCmdOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await apiFetch("/api/products");
        if (!res.ok) throw new Error("Erro ao carregar produtos.");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
        addToast(
          "Atenção",
          "Erro ao carregar catálogo de produtos.",
          "warning",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [addToast]);

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const handleQuickRegister = async (itemPendente: ItemPendente) => {
    console.log(itemPendente);
    addToast("Sucesso", "Item processado com sucesso!", "success");
  };

  if (!mounted || loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-xs font-mono font-bold ${isDarkMode ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-500"}`}
        aria-hidden="true"
      >
        A carregar catálogo de produtos...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 mt-6 pb-20 relative z-25 space-y-6">
        {/* Cartão Principal da Central de Importação */}
        <div
          className={`rounded-3xl border p-7 shadow-xl transition-all space-y-5 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          {/* Navegação Secundária para o Catálogo */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-500/10">
            <div>
              <span className="inline-flex rounded-xl bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
                Módulo de Sincronização
              </span>
              <h1 className="text-base md:text-lg font-black tracking-tight uppercase">
                Central de Importação Inteligente
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Cruzamento e cadastro rápido de produtos da empresa.
              </p>
            </div>

            <Link
              href="/produtos"
              className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-2 cursor-pointer"
            >
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

      {/* COMPONENTES GLOBAIS DE APOIO */}
      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
      <CommandMenu
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        isDarkMode={isDarkMode}
        latestQuotationId={latestQuotationId}
      />
    </div>
  );
}
