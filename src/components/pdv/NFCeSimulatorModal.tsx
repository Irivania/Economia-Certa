'use client';

import { Printer, X, ShieldCheck } from 'lucide-react';

interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface NFCeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    saleId: string;
    operatorName: string;
    customerName: string;
    paymentMethod: string;
    total: number;
    items: CartItem[];
  } | null;
  isDarkMode: boolean;
}

export function NFCeSimulatorModal({
  isOpen,
  onClose,
  saleData,
  isDarkMode,
}: NFCeSimulatorModalProps) {
  if (!isOpen || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  // Gerar uma chave de acesso fictícia de 44 dígitos para simulação realista
  const mockAccessKey = '35261000012345678900650010000001231000123456';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 relative print:shadow-none print:border-none print:p-0 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Botão Fechar (Oculto na Impressão) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 transition cursor-pointer print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tag de Homologação Educacional */}
        <div className="text-center space-y-1 border-b pb-4 border-slate-500/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Modo Educacional / Homologação (Sem Valor Fiscal)
          </div>
          <h2 className="text-sm font-black uppercase tracking-wider">Extrato No. {saleData.saleId.substring(0, 8).toUpperCase()}</h2>
          <p className="text-[11px] opacity-60 font-mono">Cupon Fiscal Eletrônico Simulado (NFC-e)</p>
        </div>

        {/* Dados do Estabelecimento e Venda */}
        <div className="text-xs font-mono space-y-1 opacity-80 border-b pb-3 border-slate-500/10">
          <div className="flex justify-between">
            <span>Operador:</span>
            <span className="font-bold">{saleData.operatorName}</span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span className="font-bold">{saleData.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Data/Hora:</span>
            <span className="font-bold">{new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Itens do Cupom */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-wider opacity-60">Itens Consumidos</h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
            {saleData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-dashed border-slate-500/15">
                <div>
                  <div className="font-sans font-bold text-xs">{item.description}</div>
                  <div className="text-[10px] opacity-60">{item.quantity} un x R$ {item.unitPrice.toFixed(2)}</div>
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totais e Forma de Pagamento */}
        <div className="space-y-2 pt-2 border-t border-slate-500/15 font-mono text-xs">
          <div className="flex justify-between opacity-80">
            <span>Forma de Pagamento:</span>
            <span className="font-bold">{saleData.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-base font-black">
            <span>TOTAL A PAGAR:</span>
            <span className="text-emerald-600 dark:text-emerald-400">R$ {saleData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Chave de Acesso Simulada & QR Code Fictício */}
        <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 text-center space-y-2 font-mono">
          <div className="text-[10px] opacity-60 uppercase">Consulta via Chave de Acesso:</div>
          <div className="text-[10px] font-bold tracking-widest break-all">{mockAccessKey}</div>
          <div className="pt-1 flex justify-center">
            {/* Representação visual simulada de um QR Code */}
            <div className="w-20 h-20 bg-slate-800 dark:bg-slate-200 rounded-lg flex items-center justify-center text-[9px] text-white dark:text-slate-900 font-bold">
              [ QR CODE SIMULADO ]
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
    </div>
  );
}