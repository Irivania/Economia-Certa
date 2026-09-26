'use client';

import React from 'react';
import { ThemeColor } from '@/context/ThemeContext';

interface Supplier {
  id: string;
  name: string;
  cnpj?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (sup: Supplier) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
  themeColor: ThemeColor;
}

export function SupplierCard({ supplier, onEdit, onDelete, isDarkMode, themeColor }: SupplierCardProps) {
  // Mapeamento dinâmico do avatar de acordo com o tema global ativo
  const avatarStyles = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950',
    'emerald-light': 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white',
    blue: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
    'blue-light': 'bg-gradient-to-br from-blue-500 to-sky-400 text-white',
    purple: 'bg-gradient-to-br from-purple-700 to-indigo-900 text-white',
    'purple-light': 'bg-gradient-to-br from-purple-500 to-indigo-400 text-white',
  }[themeColor];

  return (
    <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${isDarkMode ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50/50 border-slate-200/60 hover:border-slate-300 shadow-sm'}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${avatarStyles}`}>
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{supplier.name}</h3>
              <span className="text-[10px] font-mono opacity-60">{supplier.cnpj || 'CNPJ não informado'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(supplier)} 
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Editar
            </button>
            <button 
              onClick={() => onDelete(supplier.id)} 
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </div>

        <div className="text-xs space-y-1 pt-2 border-t border-slate-500/10 opacity-80">
          <p><span className="font-semibold opacity-60">Endereço:</span> {supplier.address || 'Não cadastrado'}</p>
          <p><span className="font-semibold opacity-60">Representante:</span> {supplier.contactPerson || 'Não informado'}</p>
          <p><span className="font-semibold opacity-60">Contato:</span> {supplier.phone || '-'} {supplier.email ? `• ${supplier.email}` : ''}</p>
        </div>
      </div>
    </div>
  );
}