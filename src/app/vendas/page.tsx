"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { SalesFilters } from "@/components/vendas/SalesFilters";
import { SalesTable, Sale } from "@/components/vendas/SalesTable";
import { SaleDetailsModal } from "@/components/vendas/SaleDetailsModal";

const subscribeToHydration = () => () => {};

export default function VendasPage() {
  const { isDarkMode } = useTheme();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts } = useToast();

  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterType, setFilterType] = useState<
    "all" | "today" | "biweekly" | "month" | "custom"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("all");
  const [selectedRegister, setSelectedRegister] = useState("all");

  // Modal de Detalhes
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    fetch("/api/vendas")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalesList(data.sales);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950"
        aria-hidden="true"
      />
    );
  }

  // Listas únicas para os filtros dinâmicos
  const operators = Array.from(new Set(salesList.map((s) => s.operatorName)));
  const registers = Array.from(
    new Set(salesList.map((s) => s.registerName || "Caixa Padrão")),
  );

  // Lógica de Filtragem Completa
  const filteredSales = salesList.filter((sale) => {
    if (selectedOperator !== "all" && sale.operatorName !== selectedOperator)
      return false;
    const regName = sale.registerName || "Caixa Padrão";
    if (selectedRegister !== "all" && regName !== selectedRegister)
      return false;

    if (!sale.createdAt) return true;
    const saleDate = new Date(sale.createdAt);
    const today = new Date();

    if (filterType === "today") {
      return saleDate.toDateString() === today.toDateString();
    }
    if (filterType === "biweekly") {
      const diffTime = Math.abs(today.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 15;
    }
    if (filterType === "month") {
      return (
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    }
    if (filterType === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    }

    return true;
  });

  const totalFaturado = filteredSales.reduce(
    (acc, s) => acc + Number(s.total || 0),
    0,
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* 1. Cabeçalho Global Padronizado */}
      <AppHeader
        title="Economia Certa"
        subtitle="Consulte transações, horários, operadores, turnos e itens comprados em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* 2. Contentor Principal Alinhado */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20 space-y-6 relative z-25">
        {/* Banner Superior da Página */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Histórico de Vendas & PDV 📋
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Auditoria completa das vendas realizadas no balcão e
                self-checkout.
              </p>
            </div>
          </div>

          <Link
            href="/pdv"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider text-white transition shadow-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao PDV
          </Link>
        </div>

        {/* 🌸 Módulo de Filtros Extensível */}
        <SalesFilters
          filterType={filterType}
          setFilterType={setFilterType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedOperator={selectedOperator}
          setSelectedOperator={setSelectedOperator}
          selectedRegister={selectedRegister}
          setSelectedRegister={setSelectedRegister}
          operators={operators}
          registers={registers}
          totalFaturado={totalFaturado}
        />

        {/* 🌸 Tabela de Vendas Isolada */}
        <SalesTable
          sales={filteredSales}
          loading={loading}
          onSelectSale={setSelectedSale}
        />
      </main>

      {/* 🌸 Modal de Detalhes Isolado */}
      <SaleDetailsModal
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />

      {/* 3. Componentes Globais de Apoio */}
      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
      <CommandMenu
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        isDarkMode={isDarkMode}
        latestQuotationId=""
      />
    </div>
  );
}
