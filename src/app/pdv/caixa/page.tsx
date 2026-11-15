"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { getCompanyId } from "@/lib/companySession";
import { ArrowLeft } from "lucide-react";
import { CashRegisterStatusCard } from "@/components/pdv/CashRegisterStatusCard";
import { CashRegisterOperationsForm } from "@/components/pdv/CashRegisterOperationsForm";

const ManagerAuthModal = dynamic(
  () =>
    import("@/components/pdv/ManagerAuthModal").then(
      (mod) => mod.ManagerAuthModal,
    ),
  { ssr: false, loading: () => null },
);

const subscribeToHydration = () => () => {};

interface CashRegister {
  id: string;
  operatorName: string;
  openingAmount: string;
  status: "OPEN" | "PAUSED" | "CLOSED";
  pausedAt?: string | null;
}

interface RegisterStatus {
  isOpen: boolean;
  isPaused?: boolean;
  register?: CashRegister;
  salesCount?: number;
}

export default function CashRegisterPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const companyId = getCompanyId();

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts, addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus | null>(
    null,
  );
  const [pauseDuration, setPauseDuration] = useState("00:00:00");

  const [rawValue, setRawValue] = useState(0);
  const [displayValue, setDisplayValue] = useState("");

  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState<"SUPPLY" | "BLEED" | "CLOSE">(
    "BLEED",
  );

  // Estados para o PIN de Segurança / Gestor
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPauseState, setPendingPauseState] = useState<boolean>(false);

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!companyId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/pdv/register?companyId=${companyId}`);
        const data = await res.json();

        if (isMounted) {
          setRegisterStatus({
            isOpen: data.isOpen,
            isPaused: data.register?.status === "PAUSED",
            register: data.register,
            salesCount: data.salesCount,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (registerStatus?.isPaused && registerStatus?.register?.pausedAt) {
      const startTime = new Date(registerStatus.register.pausedAt).getTime();

      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.floor((now - startTime) / 1000);

        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");

        setPauseDuration(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else {
      queueMicrotask(() => {
        setPauseDuration("00:00:00");
      });
    }

    return () => clearInterval(interval);
  }, [registerStatus?.isPaused, registerStatus?.register?.pausedAt]);

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950"
        aria-hidden="true"
      />
    );
  }

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numberValue = Number(value) / 100;

    setRawValue(numberValue);
    setDisplayValue(
      numberValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    );
  };

  // Dispara o modal de PIN antes de efetuar a pausa ou reabertura
  const handleRequestPauseAuth = (pauseState: boolean) => {
    setPendingPauseState(pauseState);
    setIsAuthModalOpen(true);
  };

  // Executado após a validação bem-sucedida do PIN pelo gestor
  const handleManagerAuthorized = async () => {
    setIsAuthModalOpen(false);
    await executeTogglePause(pendingPauseState);
  };

  const executeTogglePause = async (pauseState: boolean) => {
    try {
      const res = await fetch("/api/pdv/register/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, pause: pauseState }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          "Turno de Caixa",
          pauseState
            ? "☕ Caixa pausado com sucesso!"
            : "⚡ Caixa reaberto e retornado com sucesso!",
          "success",
        );
        setLoading(true);
        const statusRes = await fetch(
          `/api/pdv/register?companyId=${companyId}`,
        );
        const statusData = await statusRes.json();
        setRegisterStatus({
          isOpen: statusData.isOpen,
          isPaused: statusData.register?.status === "PAUSED",
          register: statusData.register,
          salesCount: statusData.salesCount,
        });
        setLoading(false);
      } else {
        addToast(
          "Atenção",
          data.error || "Erro ao alterar estado de pausa.",
          "warning",
        );
      }
    } catch (err) {
      console.error(err);
      addToast("Atenção", "Erro de conexão.", "warning");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawValue <= 0 && registerStatus?.isOpen) {
      addToast("Atenção", "Informe um valor válido maior que zero.", "warning");
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        companyId,
        action: registerStatus?.isOpen ? actionType : "OPEN",
        operatorName:
          registerStatus?.register?.operatorName || "Maria da Conceição",
        amount: rawValue,
        reason: reason,
      };

      if (registerStatus?.isOpen && actionType === "CLOSE") {
        payload.closingAmount = rawValue;
      }

      const res = await fetch("/api/pdv/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast(
          "Sucesso",
          "Operação de caixa realizada com sucesso! A retornar à Frente de Caixa... 🚀",
          "success",
        );
        setRawValue(0);
        setDisplayValue("");
        setReason("");

        setTimeout(() => {
          router.push("/pdv");
        }, 1000);
      } else {
        addToast(
          "Atenção",
          data.error || "Erro ao processar operação.",
          "warning",
        );
      }
    } catch (err) {
      console.error(err);
      addToast("Atenção", "Erro de conexão.", "warning");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
      >
        <p className="text-xs font-bold animate-pulse">
          A carregar dados do turno...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* 1. Cabeçalho Global Padronizado */}
      <AppHeader
        title="Economia Certa"
        subtitle="Abertura, controlo de intervalos, sangrias de segurança e fecho cego."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6 relative z-25">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/pdv")}
            className="font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Frente de Caixa (Continuar Vendas)
            &rarr;
          </button>
        </div>

        <CashRegisterStatusCard
          registerStatus={registerStatus}
          pauseDuration={pauseDuration}
          isDarkMode={isDarkMode}
          onRequestPauseAuth={handleRequestPauseAuth}
        />

        <CashRegisterOperationsForm
          isOpen={!!registerStatus?.isOpen}
          actionType={actionType}
          displayValue={displayValue}
          reason={reason}
          isDarkMode={isDarkMode}
          onChangeAction={setActionType}
          onMoneyChange={handleMoneyChange}
          onReasonChange={setReason}
          onSubmit={handleSubmit}
        />
      </main>

      {/* Modal de Autenticação por PIN de Gerente / Supervisor */}
      <ManagerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthorized={handleManagerAuthorized}
        isDarkMode={isDarkMode}
      />

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
