"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { getCompanyId } from "@/lib/companySession";
import { apiFetch } from "@/lib/apiClient";
import { ConvenioForm } from "@/components/convenios/ConvenioForm";
import { ConvenioList } from "@/components/convenios/ConvenioList";

const subscribeToHydration = () => () => {};

interface PartnerItem {
  id: string;
  type: "EMPLOYEE" | "COMPANY_PARTNER";
  name: string;
  document: string | null;
  phone: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  companyPartnerId: string | null;
  active: boolean;
}

type RegistrationMode = "COMPANY_PARTNER" | "EMPLOYEE";

export default function ConveniosPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts, addToast } = useToast();

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);

  // Form state
  const [mode, setMode] = useState<RegistrationMode>("COMPANY_PARTNER");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [creditLimit, setCreditLimit] = useState("500");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const loadPartners = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/partners?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPartners(data);
      }
    } catch (err) {
      console.error("Erro ao carregar parceiros:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchPartnersData() {
      if (!companyId) return;
      try {
        const res = await apiFetch(`/api/partners?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) setPartners(data);
        }
      } catch (err) {
        console.error("Erro ao carregar parceiros:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPartnersData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950"
        aria-hidden="true"
      />
    );
  }

  // Função para buscar automaticamente dados do CNPJ
  const handleFetchCnpj = async (cnpjValue: string) => {
    const clean = cnpjValue.replace(/\D/g, "");
    if (clean.length !== 14) return;

    try {
      setFetchingCnpj(true);
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (data.razao_social || data.nome_fantasia) {
          setName(data.razao_social || data.nome_fantasia);
        }
        if (data.ddd_telefone_1) {
          setPhone(data.ddd_telefone_1);
        }
        addToast(
          "Sucesso",
          "Dados do CNPJ preenchidos automaticamente!",
          "success",
        );
      }
    } catch (err) {
      console.error("Erro ao buscar CNPJ automático:", err);
    } finally {
      setFetchingCnpj(false);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Atenção", "O nome ou razão social é obrigatório.", "warning");
      return;
    }

    if (mode === "EMPLOYEE" && !selectedCompanyId) {
      addToast(
        "Atenção",
        "Selecione a Empresa Parceira à qual este funcionário pertence.",
        "warning",
      );
      return;
    }

    try {
      const res = await apiFetch("/api/partners", {
        method: "POST",
        body: JSON.stringify({
          companyId,
          type: mode,
          name,
          document,
          phone,
          creditLimit,
          discountPercentage,
          companyPartnerId: mode === "EMPLOYEE" ? selectedCompanyId : null,
        }),
      });

      if (!res.ok) throw new Error("Erro ao cadastrar.");

      setName("");
      setDocument("");
      setPhone("");
      setCreditLimit("500");
      setDiscountPercentage("0");
      setSelectedCompanyId("");
      await loadPartners();
      addToast(
        "Sucesso",
        mode === "COMPANY_PARTNER"
          ? "Empresa parceira cadastrada com sucesso!"
          : "Funcionário vinculado cadastrado com sucesso!",
        "success",
      );
    } catch (err) {
      console.error(err);
      addToast("Atenção", "Não foi possível realizar o cadastro.", "warning");
    }
  };

  const companyPartners = partners.filter((p) => p.type === "COMPANY_PARTNER");

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* 1. Cabeçalho Global Padronizado */}
      <AppHeader
        title="Economia Certa"
        subtitle="Controle de faturamento corporativo, empresas e funcionários vinculados."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 mt-6 pb-20 relative z-25 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            href="/"
            className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            &larr; Voltar ao Início
          </Link>

          <Link
            href="/financeiro/convenios/fechamento"
            className="font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition inline-flex items-center gap-2 cursor-pointer"
          >
            📑 Fechamento Mensal de Faturas &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ConvenioForm
            mode={mode}
            setMode={setMode}
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
            companyPartners={companyPartners}
            document={document}
            setDocument={setDocument}
            handleFetchCnpj={handleFetchCnpj}
            fetchingCnpj={fetchingCnpj}
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            creditLimit={creditLimit}
            setCreditLimit={setCreditLimit}
            discountPercentage={discountPercentage}
            setDiscountPercentage={setDiscountPercentage}
            onSubmit={handleCreatePartner}
            isDarkMode={isDarkMode}
          />

          <ConvenioList
            partners={partners}
            loading={loading}
            isDarkMode={isDarkMode}
          />
        </div>
      </main>

      {/* 2. Componentes Globais de Apoio */}
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
