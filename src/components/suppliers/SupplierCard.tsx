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
    alert(`ID do fornecedor ${supplier.name} copiado para a área de transferência!`);
  };

  // Verifica se o estado é pendente (tanto em inglês quanto em português)
  const isPending = connectionStatus === 'PENDING' || connectionStatus === 'PENDENTE';
  
  // Se está pendente e foi iniciado pelo fornecedor/representante
  const isPendingFromSupplier = isPending && initiatedBy !== 'COMPANY';

  return (
    <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 shadow-sm ${
      isDarkMode ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50/50 border-slate-200/60 hover:border-slate-300'
    }`}>
      <div className="space-y-3">
        {/* Cabeçalho Organizado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-md shrink-0 ${avatarStyles}`}>
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">{supplier.name}</h3>
              <span className="text-[10px] font-mono opacity-60">{supplier.cnpj || 'CNPJ não informado'}</span>
            </div>
          </div>

          {/* Botões e Status B2B */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {connectionStatus === 'ACCEPTED' ? (
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                🔗 Conectado B2B
              </span>
            ) : isPendingFromSupplier && connectionId && onUpdateConnection ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateConnection(connectionId, 'ACCEPTED')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95"
                >
                  Aceitar Parceria ✓
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateConnection(connectionId, 'REJECTED')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-[10px] font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : isPending ? (
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                ⏳ Convite Pendente
              </span>
            ) : onConnect ? (
              <button
                type="button"
                onClick={() => onConnect(supplier.id)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95"
              >
                + Conectar B2B
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(supplier.id)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </div>

        {/* Informações e ID Copiável */}
        <div className="text-xs space-y-2 pt-3 border-t border-slate-500/10 opacity-90 font-medium">
          <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/15 p-2 rounded-xl">
            <div className="space-y-0.5 truncate pr-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 block">ID / Código de Conexão B2B:</span>
              <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 select-all font-bold">{supplier.id}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition shadow-sm cursor-pointer shrink-0 active:scale-95"
              title="Copiar ID"
            >
              📋 Copiar
            </button>
          </div>

          <p><span className="font-semibold opacity-60">Endereço:</span> {supplier.address || 'Não cadastrado'}</p>
          <p><span className="font-semibold opacity-60">Representante:</span> {supplier.contactPerson || 'Não informado'}</p>
          <p><span className="font-semibold opacity-60">Contato:</span> {supplier.phone || '-'} {supplier.email ? `• ${supplier.email}` : ''}</p>
        </div>
      </div>
    </div>
  );
}