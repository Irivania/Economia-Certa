"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";
import { CommandMenu } from "@/components/CommandMenu";
import { useToast } from "@/features/dashboard/hooks/useToast";
import { getCompanyId } from "@/lib/companySession";
import { NotaUploadForm } from "@/components/notas/NotaUploadForm";
import { NotaPreviewTable } from "@/components/notas/NotaPreviewTable";
import { NotaHistoryTable } from "@/components/notas/NotaHistoryTable";

const subscribeToHydration = () => () => {};

interface ItemXML {
  ean: string | null;
  descricaoNota: string;
  unidadeNota: string;
  qtdNota: number;
  quantidadeRealEstoque: number;
  valorUnitarioNota: number;
  custoRealUnitario: number;
  cadastradoNoSistema: boolean;
  productId: string | null;
}

interface BoletoXML {
  numeroFatura: string;
  vencimento: string;
  valor: number;
}

interface ImportedInvoiceRecord {
  id: string;
  accessKey: string;
  invoiceNumber: string;
  issuerName: string;
  totalAmount: string;
  importedAt: string;
}

interface InvoiceDetailData {
  invoice: ImportedInvoiceRecord;
  items: Array<{
    id: string;
    unitCost: string;
    quantity: string;
    productDescription: string;
    productEan: string | null;
  }>;
  payables: Array<{
    id: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    status: string;
  }>;
}

export default function NotaEntradaHubPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const { toasts, addToast } = useToast();

  const [activeTab] = useState<"xml" | "manual">("xml");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [notaData, setNotaData] = useState<{
    emitente: string;
    numeroNota: string;
    chaveAcess: string;
    totalNota: number;
    totalDesconto: number;
    boletos: BoletoXML[];
    itens: ItemXML[];
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importedList, setImportedList] = useState<ImportedInvoiceRecord[]>([]);

  const [selectedInvoiceDetail, setSelectedInvoiceDetail] =
    useState<InvoiceDetailData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchImportedHistory() {
      if (!companyId) return;
      try {
        const res = await fetch(`/api/notes/xml-import?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.invoices)) {
            setImportedList(data.invoices);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar histórico de notas:", err);
      }
    }

    fetchImportedHistory();

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

  const handleOpenInvoiceDetail = async (invoiceNumber: string) => {
    try {
      const res = await fetch(
        `/api/notes/xml-import/detail?companyId=${companyId}&invoiceNumber=${invoiceNumber}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedInvoiceDetail(data);
          setIsDetailModalOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
      addToast(
        "Atenção",
        "Erro ao carregar os detalhes da nota fiscal.",
        "warning",
      );
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      addToast(
        "Atenção",
        "Selecione um ficheiro XML da Nota Fiscal.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", companyId);

      const res = await fetch("/api/notes/xml-import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        addToast("Atenção", data.error || "Erro ao processar XML.", "warning");
        setLoading(false);
        return;
      }

      const itensFormatados = data.itens.map((item: ItemXML) => ({
        ...item,
        custoRealUnitario: Number(
          Number(item.custoRealUnitario || 0).toFixed(2),
        ),
      }));

      setNotaData({
        ...data,
        itens: itensFormatados,
      });
      setSuccessMsg(null);
      addToast("Sucesso", "Ficheiro XML analisado com sucesso!", "success");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro ao importar XML.";
      addToast("Atenção", msg, "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleItemFieldChange = (
    index: number,
    field: "quantidadeRealEstoque" | "custoRealUnitario",
    value: number,
  ) => {
    if (!notaData) return;
    const updatedItens = [...notaData.itens];
    updatedItens[index] = {
      ...updatedItens[index],
      [field]: value,
    };
    setNotaData({
      ...notaData,
      itens: updatedItens,
    });
  };

  const handleBoletoFieldChange = (
    index: number,
    field: "vencimento" | "valor",
    value: string | number,
  ) => {
    if (!notaData) return;
    const updatedBoletos = [...notaData.boletos];
    updatedBoletos[index] = {
      ...updatedBoletos[index],
      [field]: value,
    };
    setNotaData({
      ...notaData,
      boletos: updatedBoletos,
    });
  };

  const handleConfirmarEntradaXML = async () => {
    if (!notaData) return;

    if (
      !confirm(
        "Deseja confirmar a entrada desta nota, atualizar o estoque e lançar os boletos automaticamente no Contas a Pagar?",
      )
    )
      return;

    try {
      setLoading(true);
      const res = await fetch("/api/notes/xml-import", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          emitente: notaData.emitente,
          numeroNota: notaData.numeroNota,
          chaveAcess: notaData.chaveAcess,
          itens: notaData.itens,
          boletos: notaData.boletos,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao efetivar entrada.");

      addToast(
        "Sucesso",
        data.message ||
          "Nota fiscal importada, estoque atualizado e boletos gerados com sucesso!",
        "success",
      );
      setNotaData(null);
      setFile(null);

      const historyRes = await fetch(
        `/api/notes/xml-import?companyId=${companyId}`,
      );
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (historyData.success && Array.isArray(historyData.invoices)) {
          setImportedList(historyData.invoices);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : "Erro ao efetivar entrada de estoque.";
      addToast("Atenção", msg, "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* 1. Cabeçalho Global Padronizado */}
      <AppHeader
        title="Economia Certa"
        subtitle="Dê entrada em mercadorias de forma automatizada via XML ou através do registo manual."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 mt-6 pb-20 relative z-25 space-y-6">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            &larr; Voltar ao Início
          </Link>

          <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {}}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "xml"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📄 Importar Ficheiro XML
            </button>
            <button
              type="button"
              onClick={() => router.push("/notas/manual")}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ✍️ Registo Manual & Boletos &rarr;
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <NotaUploadForm
            file={file}
            setFile={setFile}
            onUpload={handleFileUpload}
            loading={loading}
            successMsg={successMsg}
            isDarkMode={isDarkMode}
          />

          {notaData && (
            <NotaPreviewTable
              notaData={notaData}
              onItemFieldChange={handleItemFieldChange}
              onBoletoFieldChange={handleBoletoFieldChange}
              onConfirm={handleConfirmarEntradaXML}
              loading={loading}
              isDarkMode={isDarkMode}
            />
          )}

          <NotaHistoryTable
            importedList={importedList}
            onOpenDetail={handleOpenInvoiceDetail}
            selectedDetail={selectedInvoiceDetail}
            isDetailModalOpen={isDetailModalOpen}
            onCloseDetailModal={() => setIsDetailModalOpen(false)}
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
