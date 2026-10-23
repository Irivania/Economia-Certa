'use client';

import { X, Keyboard } from 'lucide-react';

interface PDVShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function PDVShortcutsModal({ isOpen, onClose, isDarkMode }: PDVShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        <div className="flex justify-between items-center border-b pb-4 border-slate-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider">Atalhos do Caixa (PDV) ⚡</h3>
              <p className="text-xs opacity-60">Guia rápido de operação por teclado para o operador.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 font-bold cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Atalhos */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <div>
              <span className="font-bold block">Pesquisar & Navegar</span>
              <span className="text-[11px] font-sans opacity-60">Use as setas para descer na lista de produtos.</span>
            </div>
            <kbd className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">Setas ↕ + Enter</kbd>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <div>
              <span className="font-bold block">Multiplicador de Quantidade</span>
              <span className="text-[11px] font-sans opacity-60">Ex: 4 unidades de um produto.</span>
            </div>
            <kbd className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">Qtd * EAN (ex: 4*789...)</kbd>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <div>
              <span className="font-bold block">Gestão de Pagamento & Troco</span>
              <span className="text-[11px] font-sans opacity-60">Abre a tela de escolha de formas de pagamento.</span>
            </div>
            <kbd className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">F9</kbd>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <div>
              <span className="font-bold block">Concluir Venda & Imprimir</span>
              <span className="text-[11px] font-sans opacity-60">Finaliza o pagamento misto ou total.</span>
            </div>
            <kbd className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">F10</kbd>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <div>
              <span className="font-bold block">Ajuda / Guia de Atalhos</span>
              <span className="text-[11px] font-sans opacity-60">Abre este painel de orientações.</span>
            </div>
            <kbd className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">F1</kbd>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-500/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}