'use client';

import React, { useState } from 'react';
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
  connectionStatus?: 'ACCEPTED' | 'PENDING' | 'PENDENTE' | 'NONE';
  initiatedBy?: string;
  connectionId?: string;
  onConnect?: (supplierId: string) => void;
  onUpdateConnection?: (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => void;
}

export function SupplierCard({
  supplier,
  onEdit,
  onDelete,
  isDarkMode,
  themeColor,
  connectionStatus = 'NONE',
  initiatedBy,
  connectionId,
  onConnect,
  onUpdateConnection,
}: SupplierCardProps) {
  const [copied, setCopied] = useState(false);

  const avatarStyles = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950',
    'emerald-light': 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white',
    blue: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
    'blue-light': 'bg-gradient-to-br from-blue-500 to-sky-400 text-white',
    purple: 'bg-gradient-to-br from-purple-700 to-indigo-900 text-white',
    'purple-light': 'bg-gradient-to-br from-purple-500 to-indigo-400 text-white',
  }[themeColor];

  const handleCopyId = () => {
    navigator.clipboard.writeText(supplier.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPending = connectionStatus === 'PENDING' || connectionStatus === 'PENDENTE';
  const isPendingFromSupplier = isPending && initiatedBy !== 'COMPANY';

  return (
    <div className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3.5 shadow-xs ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-100' 
        : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-900'
    }`}>
      <div className="space-y-3">
        {/* Cabeçalho Organizado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${avatarStyles}`}>
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight uppercase">{supplier.name}</h3>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{supplier.cnpj || 'CNPJ não informado'}</span>
            </div>
          </div>

          {/* Botões e Status B2B */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {connectionStatus === 'ACCEPTED' ? (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                🔗 Conectado B2B
              </span>
            ) : isPendingFromSupplier && connectionId && onUpdateConnection ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateConnection(connectionId, 'ACCEPTED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95"
                >
                  Aceitar ✓
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateConnection(connectionId, 'REJECTED')}
                  className="px-2 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-[10px] font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : isPending ? (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                ⏳ Convite Pendente
              </span>
            ) : onConnect ? (
              <button
                type="button"
                onClick={() => onConnect(supplier.id)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95"
              >
                + Conectar B2B
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-all cursor-pointer"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(supplier.id)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </div>

        {/* Informações e ID Copiável */}
        <div className="text-xs space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
          <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/15 p-2 rounded-lg">
            <div className="space-y-0.5 truncate pr-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 block">ID / Código de Conexão B2B:</span>
              <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 select-all font-semibold">{supplier.id}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition shadow-xs cursor-pointer shrink-0 active:scale-95"
              title="Copiar ID"
            >
              {copied ? 'Copiado! ✓' : '📋 Copiar'}
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Endereço:</span> {supplier.address || 'Não cadastrado'}</p>
          <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Representante:</span> {supplier.contactPerson || 'Não informado'}</p>
          <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Contato:</span> {supplier.phone || '-'} {supplier.email ? `• ${supplier.email}` : ''}</p>
        </div>
      </div>
    </div>
  );
}