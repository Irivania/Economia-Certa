"use client";

import React from "react";
import { Printer, X, ShieldCheck } from "lucide-react";
import type { CartItem } from "@/types/pdv";
import { formatBRL } from "@/lib/pdv/format";

interface SaleDataType {
  saleId: string;
  operatorName: string;
  customerName: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
  changeGiven?: number;
}

interface NFCeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: SaleDataType | null;
  isDarkMode: boolean;
  companyInfo?: {
    name: string;
    cnpj?: string;
    stateRegistration?: string;
    address?: string;
    phone?: string;
  };
}

export function NFCeSimulatorModal({
  isOpen,
  onClose,
  saleData,
  isDarkMode,
  companyInfo,
}: NFCeSimulatorModalProps) {
  if (!isOpen || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  const mockAccessKey = "35261000012345678900650010000001231000123456";

  // Dados dinâmicos vindos da tabela companies do Drizzle
  const storeName = companyInfo?.name || "EMPRESA NÃO CADASTRADA";
  const storeCNPJ = companyInfo?.cnpj || "CNPJ não informado";
  const storeStateRegistration =
    companyInfo?.stateRegistration || "Não informada";
  const storeAddress =
    companyInfo?.address || "Av. Paulo Faccini, 200 - Centro, Guarulhos - SP";
  const storePhone = companyInfo?.phone || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 relative print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none print:bg-white print:text-black ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Botão Fechar (Oculto na Impressão) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 transition cursor-pointer print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 🌸 Cabeçalho Oficial com Dados da Tabela Companies */}
        <div className="text-center space-y-1 border-b pb-4 border-slate-500/20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider mb-1 print:hidden">
            <ShieldCheck className="w-3.5 h-3.5" /> Modo Educacional /
            Homologação (Sem Valor Fiscal)
          </div>

          <h2 className="text-base font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">
            {storeName}
          </h2>
          <p className="text-[11px] opacity-75 italic font-medium">
            Beleza que te faz bem! 💖
          </p>
          <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
            CNPJ: {storeCNPJ}
          </p>
          <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
            IE: {storeStateRegistration}
          </p>
          <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
            {storeAddress}
          </p>
          {storePhone && (
            <p className="text-[10px] font-mono text-slate-600">
              Tel: {storePhone}
            </p>
          )}
        </div>

        {/* Dados da Venda & Operador */}
        <div className="text-xs font-mono space-y-1 opacity-85 border-b pb-3 border-slate-500/15">
          <div className="flex justify-between font-bold">
            <span>EXTRATO Nº:</span>
            <span>{saleData.saleId.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Operador:</span>
            <span>{saleData.operatorName || "Operador"}</span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span>{saleData.customerName || "Cliente Balcão"}</span>
          </div>
          <div className="flex justify-between">
            <span>Data/Hora:</span>
            <span>{new Date().toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {/* Itens do Cupom */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-wider opacity-60">
            Itens Consumidos
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs print:max-h-none print:overflow-visible">
            {saleData.items.map((item: CartItem, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1 border-b border-dashed border-slate-500/20"
              >
                <div>
                  <div className="font-sans font-bold text-xs">
                    {item.description}
                  </div>
                  <div className="text-[10px] opacity-70">
                    {item.quantity} un x {formatBRL(item.unitPrice)}
                  </div>
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                  {formatBRL(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totais, Pagamento e Troco */}
        <div className="space-y-2 pt-2 border-t border-slate-500/20 font-mono text-xs">
          <div className="flex justify-between opacity-85">
            <span>Forma de Pagamento:</span>
            <span className="font-bold">{saleData.paymentMethod}</span>
          </div>

          {Number(saleData.changeGiven || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold print:text-black">
              <span>Troco Devolvido:</span>
              <span>{formatBRL(Number(saleData.changeGiven))}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black pt-1 border-t border-dashed border-slate-500/30">
            <span>TOTAL A PAGAR:</span>
            <span className="text-emerald-600 dark:text-emerald-400 print:text-black">
              {formatBRL(saleData.total)}
            </span>
          </div>
        </div>

        {/* Chave de Acesso Simulada & QR Code */}
        <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 text-center space-y-2 font-mono print:border-none print:bg-transparent">
          <div className="text-[10px] opacity-60 uppercase">
            Consulta via Chave de Acesso NFC-e:
          </div>
          <div className="text-[10px] font-bold tracking-widest break-all">
            {mockAccessKey}
          </div>
          <div className="pt-1 flex justify-center print:hidden">
            <div className="w-20 h-20 bg-slate-800 dark:bg-slate-200 rounded-lg flex items-center justify-center text-[9px] text-white dark:text-slate-900 font-bold">
              [ QR CODE ]
            </div>
          </div>
        </div>

        {/* Botões de Ação (Ocultos na Impressão) */}
        <div className="flex gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl border border-slate-500/30 hover:bg-slate-500/10 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir Cupom
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
          >
            Continuar Vendas ✓
          </button>
        </div>
      </div>

      {/* Regra CSS global rigorosa para garantir impressão térmica isolada */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .fixed.inset-0,
          .fixed.inset-0 * {
            visibility: visible !important;
          }
          .fixed.inset-0 {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            display: block !important;
            margin: 0 !important;
            padding: 5px !important;
          }
          button,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
