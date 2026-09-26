'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  shortcut: string;
  href: string;
  icon: string;
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  latestQuotationId: string;
}

export function CommandMenu({ isOpen, onClose, isDarkMode, latestQuotationId }: CommandMenuProps) {
  const router = useRouter();
  const [cmdSearch, setCmdSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen) return null;

  const commandsList: CommandItem[] = [
    { id: '1', label: 'Nova Cotação Inteligente', category: 'Cotações', shortcut: 'N', href: '/cotacoes/nova', icon: '⚡' },
    { id: '2', label: 'Gerenciar Cotações', category: 'Cotações', shortcut: 'G', href: '/cotacoes', icon: '📊' },
    { id: '3', label: 'Comparador de Preços', category: 'Cotações', shortcut: 'C', href: `/cotacoes/respostas/${latestQuotationId}`, icon: '📈' },
    { id: '4', label: 'Pedidos para Distribuidores', category: 'Compradores', shortcut: 'P', href: `/cotacoes/pedidos/${latestQuotationId}`, icon: '📦' },
    { id: '5', label: 'Catálogo de Produtos', category: 'Estoque', shortcut: 'E', href: '/produtos', icon: '🏷️' },
    { id: '6', label: 'Central de Importação', category: 'Estoque', shortcut: 'I', href: '/importar', icon: '📥' },
    { id: '7', label: 'Gestão de Fornecedores', category: 'Parceiros', shortcut: 'F', href: '/fornecedores', icon: '🤝' },
    { id: '8', label: 'Relatório Comparativo', category: 'Relatórios', shortcut: 'R', href: '/relatorios/comparativo', icon: '📑' },
  ];

  const filteredCommands = commandsList.filter((cmd) =>
    cmd.label.toLowerCase().includes(cmdSearch.toLowerCase()) ||
    cmd.category.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  const handleSelectCommand = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-500/20 flex items-center gap-3">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="Digite um comando ou pesquise um módulo (ex: Cotação, Fornecedores)..."
            value={cmdSearch}
            onChange={(e) => {
              setCmdSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none outline-none text-sm placeholder:text-slate-400 font-medium"
          />
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-500/20 text-slate-400">ESC</span>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              Nenhum comando encontrado para &quot;{cmdSearch}&quot;.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => handleSelectCommand(cmd.href)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-left transition-colors ${
                  selectedIndex === idx 
                    ? (isDarkMode ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-900 border border-indigo-100') 
                    : (isDarkMode ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cmd.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{cmd.label}</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-wider">{cmd.category}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono opacity-50 px-2 py-0.5 rounded bg-slate-500/10">Ir &rarr;</span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-500/5 border-t border-slate-500/10 flex justify-between items-center text-[11px] text-slate-400">
          <span>Navegue com as setas ou clique no comando</span>
          <span className="font-semibold text-indigo-500">Economia Certa ERP v3.1</span>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}