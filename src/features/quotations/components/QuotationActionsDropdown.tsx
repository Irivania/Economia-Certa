'use client';

import { useState, useRef, useEffect, memo } from 'react';
import Link from 'next/link';
import { Quotation } from '../types/quotation.types';

interface QuotationActionsDropdownProps {
  quotation: Quotation;
  isDarkMode: boolean;
  onDelete: (quotation: Quotation) => void;
  onCancel: (quotation: Quotation) => void;
}

export const QuotationActionsDropdown = memo(function QuotationActionsDropdown({
  quotation,
  isDarkMode,
  onDelete,
  onCancel,
}: QuotationActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const canDelete = quotation.status !== 'CANCELLED' && 
    (!quotation.suppliers || quotation.suppliers.every((s) => !['ENVIADO', 'RESPONDIDO'].includes(s.status)));

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Opções para a cotação ${quotation.title}`}
        className={`p-2 rounded-lg border transition-all cursor-pointer ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <div 
          role="menu"
          aria-label={`Menu de ações da cotação ${quotation.title}`}
          style={{ minWidth: '220px' }}
          className={`absolute right-0 top-full mt-2 rounded-xl shadow-2xl border py-2 z-50 transform origin-top-right transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <Link
            role="menuitem"
            href={`/cotacoes/acompanhar/${quotation.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-slate-500/10 transition-colors"
          >
            Acompanhar / Enviar
          </Link>

          <Link
            role="menuitem"
            href={`/cotacoes/pedidos/${quotation.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-slate-500/10 transition-colors"
          >
            Ver Pedidos
          </Link>

          <Link
            role="menuitem"
            href={`/cotacoes/editar/${quotation.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-slate-500/10 transition-colors"
          >
            Editar Cotação
          </Link>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" role="separator" />

          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (quotation.status !== 'CANCELLED') onCancel(quotation);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
          >
            {quotation.status === 'CANCELLED' ? 'Cotação Cancelada' : 'Cancelar Cotação'}
          </button>

          {canDelete && (
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(quotation);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-500/10 transition-colors text-left cursor-pointer"
            >
              Excluir Cotação
            </button>
          )}
        </div>
      )}
    </div>
  );
});