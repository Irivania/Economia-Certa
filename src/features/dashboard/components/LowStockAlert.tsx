import React from 'react';
import Link from 'next/link';
import { Product } from '../types/dashboard.types';

interface LowStockAlertProps {
  lowStockProducts: Product[];
  isDarkMode: boolean;
}

export const LowStockAlert = React.memo(function LowStockAlert({
  lowStockProducts,
  isDarkMode,
}: LowStockAlertProps) {
  if (lowStockProducts.length === 0) return null;

  return (
    <div 
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`${
        isDarkMode ? 'bg-rose-950/30 border-rose-900/60 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
      } border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/15 rounded-lg text-rose-600" aria-hidden="true">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold">
            Alerta de Reposição Urgente ({lowStockProducts.length} itens críticos)
          </h3>
          <p className="text-xs opacity-80">Produtos abaixo do estoque mínimo. Recomendamos iniciar cotação imediata.</p>
        </div>
      </div>
      <Link
        href="/produtos"
        aria-label="Ver lista de produtos com estoque crítico"
        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs whitespace-nowrap"
      >
        Ver Produtos &rarr;
      </Link>
    </div>
  );
});