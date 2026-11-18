"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Printer,
  ArrowLeftRight,
  ArrowRight,
} from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  saleId: string;
  changeAmount: number;
  saleData: {
    operatorName?: string;
    customerName: string;
    customerDocument?: string | null;
    paymentMethod: string;
    paymentDetails?: string; // 👈 Autorização ou 4 últimos dígitos do cartão/PIX
    total: number;
    discountTotal?: number; // 👈 Desconto total aplicado na venda
    cashbackEarned?: number; // 👈 Cashback gerado para a cliente
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    tributosRTC?: unknown;
  } | null;
  onClose: () => void;
  isDarkMode: boolean;
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null;

const toMoney = (value: unknown): number => {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;
  return Number.isFinite(numeric) ? numeric : 0;
};

const extrairTributosRTC = (resultado: unknown) => {
  if (!isRecord(resultado)) return { cbs: 0, ibs: 0, impostoSeletivo: 0 };

  const total = isRecord(resultado.total) ? resultado.total : null;
  const tribCalc = total && isRecord(total.tribCalc) ? total.tribCalc : null;
  const isTotal = tribCalc && isRecord(tribCalc.ISTot) ? tribCalc.ISTot : null;
  const ibsCbsTotal =
    tribCalc && isRecord(tribCalc.IBSCBSTot) ? tribCalc.IBSCBSTot : null;
  const gCbs =
    ibsCbsTotal && isRecord(ibsCbsTotal.gCBS) ? ibsCbsTotal.gCBS : null;
  const gIbs =
    ibsCbsTotal && isRecord(ibsCbsTotal.gIBS) ? ibsCbsTotal.gIBS : null;

  return {
    cbs: toMoney(gCbs?.vCBS),
    ibs: toMoney(gIbs?.vIBS),
    impostoSeletivo: toMoney(isTotal?.vIS),
  };
};

export function SuccessModal({
  isOpen,
  saleId,
  changeAmount,
  saleData,
  onClose,
  isDarkMode,
}: SuccessModalProps) {
  const [selectedAction, setSelectedAction] = useState<"print" | "newSale">(
    "newSale",
  );

  const handlePrintReceipt = useCallback(() => {
    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.visibility = "hidden";
    document.body.appendChild(printFrame);

    const printDocument = printFrame.contentDocument;
    const printWindow = printFrame.contentWindow;

    if (!printDocument || !printWindow) {
      printFrame.remove();
      console.error(
        "[PDV] Não foi possível criar o documento de impressão do cupom.",
      );
      return;
    }

    const receiptId = escapeHtml(
      saleId ? saleId.slice(0, 8).toUpperCase() : "---",
    );
    const customer = escapeHtml(saleData?.customerName || "Cliente Balcão");
    const customerDoc = saleData?.customerDocument
      ? escapeHtml(saleData.customerDocument)
      : "";
    const paymentMethod = escapeHtml(
      saleData?.paymentMethod || "Não informado",
    );
    const paymentDetails = saleData?.paymentDetails
      ? escapeHtml(saleData.paymentDetails)
      : "";
    const operator = escapeHtml(saleData?.operatorName || "Operador de Caixa");
    const discountTotal = saleData?.discountTotal || 0;

    // Cálculo dinâmico de Cashback (Ex: 5% padrão ou valor fornecido)
    const calculatedCashback =
      saleData?.cashbackEarned || (saleData?.total || 0) * 0.05;

    const items = (saleData?.items || [])
      .map(
        (item) => `
      <div class="item">
        <div class="item-line">
          <span>${escapeHtml(item.description)}</span>
          <span>R$ ${item.subtotal.toFixed(2)}</span>
        </div>
        <div class="item-details">${item.quantity} un x R$ ${item.unitPrice.toFixed(2)}</div>
      </div>
    `,
      )
      .join("");

    const discountLine =
      discountTotal > 0
        ? `<div class="total-line discount"><span>Descontos Aplicados:</span><span>- R$ ${discountTotal.toFixed(2)}</span></div>`
        : "";

    const change =
      changeAmount > 0
        ? `<div class="total-line"><span>Troco Devolvido:</span><strong>R$ ${changeAmount.toFixed(2)}</strong></div>`
        : "";

    const docLine = customerDoc
      ? `<div class="data-line"><span>CPF/CNPJ:</span><span>${customerDoc}</span></div>`
      : "";

    const authLine = paymentDetails
      ? `<div class="data-line auth"><span>Auth / Detalhes:</span><span>${paymentDetails}</span></div>`
      : "";

    const tributosRTC = extrairTributosRTC(saleData?.tributosRTC);
    const tributosLine = `
      <section class="rtc-block">
        <div class="items-title">TRIBUTOS DA REFORMA TRIBUTARIA</div>
        <div class="total-line"><span>CBS (Federal):</span><strong>R$ ${tributosRTC.cbs.toFixed(2)}</strong></div>
        <div class="total-line"><span>IBS (Estadual/Municipal):</span><strong>R$ ${tributosRTC.ibs.toFixed(2)}</strong></div>
        ${
          tributosRTC.impostoSeletivo > 0
            ? `<div class="total-line"><span>Imposto Seletivo:</span><strong>R$ ${tributosRTC.impostoSeletivo.toFixed(2)}</strong></div>`
            : ""
        }
      </section>`;

    const mockAccessKey = "35261000012345678900650010000001231000123456";

    printDocument.open();
    printDocument.write(`<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>Cupom ${receiptId}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; }
            html, body { width: 80mm; margin: 0; padding: 0; background: #fff; color: #000; }
            body { font-family: "Courier New", monospace; font-size: 11px; }
            #thermal-receipt { width: 80mm; padding: 5mm 4mm; }
            .center { text-align: center; }
            .header { border-bottom: 1px dashed #000; padding-bottom: 3mm; margin-bottom: 3mm; }
            .store-name { font-size: 16px; font-weight: 700; text-transform: uppercase; }
            .tagline { font-size: 10px; font-style: italic; margin-top: 1mm; }
            .small { font-size: 10px; }
            .sale-data { border-bottom: 1px dashed #000; padding-bottom: 2mm; margin-bottom: 2mm; }
            .data-line, .item-line, .total-line { display: flex; justify-content: space-between; gap: 3mm; }
            .data-line { margin-bottom: 1mm; }
            .auth { font-size: 9px; opacity: 0.8; }
            .items { border-bottom: 1px dashed #000; padding-bottom: 2mm; margin-bottom: 2mm; }
            .items-title { font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 1mm; margin-bottom: 2mm; font-size: 10px; }
            .item { margin-bottom: 2mm; }
            .item-line { font-weight: 700; }
            .item-details { font-size: 10px; margin-top: 0.5mm; }
            .totals { border-bottom: 1px dashed #000; padding-bottom: 3mm; margin-bottom: 3mm; }
            .discount { color: #555; }
            .grand-total { border-top: 1px solid #000; margin-top: 2mm; padding-top: 2mm; font-size: 14px; font-weight: 700; }
            .cashback-box { border: 1px solid #000; padding: 2mm; text-align: center; font-size: 10px; margin-bottom: 3mm; background: #f9f9f9; }
            .access-key { font-size: 9px; word-break: break-all; margin-top: 1mm; font-weight: bold; }
            .footer { border-top: 1px dashed #000; margin-top: 3mm; padding-top: 3mm; }
            .rtc-block { border-bottom: 1px dashed #000; padding: 2mm 0 3mm; margin-bottom: 3mm; }
            .rtc-block .items-title { margin-bottom: 2mm; }
          </style>
        </head>
        <body>
          <main id="thermal-receipt">
            <header class="header center">
              <div class="store-name">Melo Perfumaria 🌸</div>
              <div class="tagline">Beleza que te faz bem! 💖</div>
              <div class="small">CNPJ: 00.123.456/0001-99</div>
              <div class="small">IE: 123.456.789.110</div>
              <div class="small">Av. Paulo Faccini, 200 - Centro</div>
              <div class="small">Guarulhos - SP</div>
            </header>
            <section class="sale-data">
              <div class="data-line"><span>EXTRATO Nº:</span><strong>${receiptId}</strong></div>
              <div class="data-line"><span>Data/Hora:</span><span>${escapeHtml(new Date().toLocaleString("pt-BR"))}</span></div>
              <div class="data-line"><span>Operador:</span><span>${operator}</span></div>
              <div class="data-line"><span>Cliente:</span><span>${customer}</span></div>
              ${docLine}
            </section>
            <section class="items">
              <div class="items-title">ITENS DA VENDA / SUB_TOTAL</div>
              ${items || "<div>Nenhum item informado</div>"}
            </section>
            <section class="totals">
              <div class="data-line"><span>Pagamento:</span><strong>${paymentMethod}</strong></div>
              ${authLine}
              ${discountLine}
              ${change}
              <div class="total-line grand-total"><span>TOTAL A PAGAR:</span><span>R$ ${(saleData?.total || 0).toFixed(2)}</span></div>
            </section>
            <div class="cashback-box">
              <strong>✨ CASHBACK MELO FIDELIDADE ✨</strong><br/>
              Acumulou <strong>R$ ${calculatedCashback.toFixed(2)}</strong> para resgatar em kits Skala, Neutrox ou Kolene na próxima compra!
            </div>
            ${tributosLine}
            <footer class="footer center small">
              <div>Consulta via Chave de Acesso NFC-e:</div>
              <div class="access-key">${mockAccessKey}</div>
              <div style="margin-top: 2mm;">Documento auxiliar de venda • Sem valor fiscal</div>
              <div>Obrigada pela preferência e volte sempre! 💖</div>
            </footer>
          </main>
        </body>
      </html>`);
    printDocument.close();

    const cleanup = () => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
    };

    printWindow.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 10000);
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 50);
  }, [changeAmount, saleData, saleId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleActionKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedAction((current) =>
          current === "print" ? "newSale" : "print",
        );
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (selectedAction === "print") {
          handlePrintReceipt();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleActionKeyDown);
    return () => window.removeEventListener("keydown", handleActionKeyDown);
  }, [handlePrintReceipt, isOpen, onClose, selectedAction]);

  if (!isOpen) return null;

  const tributosScreen = extrairTributosRTC(saleData?.tributosRTC);
  const possuiTributos =
    tributosScreen.cbs > 0 ||
    tributosScreen.ibs > 0 ||
    tributosScreen.impostoSeletivo > 0;

  const toggleAction = () => {
    setSelectedAction((current) => (current === "print" ? "newSale" : "print"));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 print:hidden">
        <div
          className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl text-center space-y-6 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-100 text-slate-900"
          }`}
        >
          {/* Ícone de Sucesso Destacado */}
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          {/* Títulos e Identificação */}
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Venda Realizada com Sucesso! 💖
            </h3>
            <p className="text-xs opacity-60 font-mono">
              ID do Cupom:{" "}
              <span className="font-bold">
                {saleId ? saleId.slice(0, 8).toUpperCase() : "---"}
              </span>
            </p>
          </div>

          {/* Destaque do Troco */}
          {changeAmount > 0 && (
            <div
              className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}
            >
              <span className="text-[11px] uppercase tracking-wider opacity-70 block font-bold">
                Troco a Devolver
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {changeAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          )}

          {possuiTributos && (
            <div
              className={`rounded-2xl border p-4 text-left font-mono text-xs ${
                isDarkMode
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-center opacity-70">
                Tributos da Reforma Tributaria
              </div>
              <div className="flex justify-between py-1">
                <span>CBS (Federal):</span>
                <strong>
                  {tributosScreen.cbs.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span>IBS (Estadual/Municipal):</span>
                <strong>
                  {tributosScreen.ibs.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </div>
              {tributosScreen.impostoSeletivo > 0 && (
                <div className="flex justify-between py-1">
                  <span>Imposto Seletivo:</span>
                  <strong>
                    {tributosScreen.impostoSeletivo.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação Profissionais */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              aria-pressed={selectedAction === "print"}
              className={`font-bold text-xs py-3 px-4 rounded-xl inline-flex items-center justify-center gap-2 transition cursor-pointer ${
                selectedAction === "print"
                  ? "bg-slate-300 dark:bg-slate-700 ring-2 ring-indigo-500"
                  : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Printer className="w-4 h-4" /> Imprimir Cupom
            </button>

            <button
              type="button"
              onClick={toggleAction}
              aria-label="Alternar entre imprimir cupom e nova venda"
              className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-pressed={selectedAction === "newSale"}
              className={`font-black text-xs text-white py-3 px-4 rounded-xl inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer ${
                selectedAction === "newSale"
                  ? "bg-emerald-600 hover:bg-emerald-500 ring-2 ring-indigo-500"
                  : "bg-emerald-600/70 hover:bg-emerald-500"
              }`}
            >
              Nova Venda <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
