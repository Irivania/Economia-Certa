'use client';

import React from 'react';
import { uppercaseText } from '@/lib/text';

interface SupplierFormProps {
  editingId: string | null;
  name: string;
  setName: (v: string) => void;
  cnpj: string;
  handleCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cep: string;
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchingCep: boolean;
  address: string;
  setAddress: (v: string) => void;
  contactPerson: string;
  setContactPerson: (v: string) => void;
  phone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  setEmail: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isDarkMode: boolean;
  themeButtonStyles: string;
}

export function SupplierForm({
  editingId,
  name,
  setName,
  cnpj,
  handleCnpjChange,
  cep,
  handleCepChange,
  fetchingCep,
  address,
  setAddress,
  contactPerson,
  setContactPerson,
  phone,
  handlePhoneChange,
  email,
  setEmail,
  submitting,
  onSubmit,
  onReset,
  isDarkMode,
  themeButtonStyles,
}: SupplierFormProps) {
  const inputClass = `w-full px-3.5 py-2.5 text-xs border rounded-lg outline-none transition-all ${
    isDarkMode 
      ? 'bg-slate-950/80 border-slate-800 text-slate-100 focus:border-indigo-500' 
      : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
  }`;

  return (
    <form onSubmit={onSubmit} className={`p-6 sm:p-7 rounded-xl shadow-xs border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'}`}>
      <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
            🤝
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              {editingId ? 'Editar Dados do Fornecedor' : 'Novo Cadastro de Distribuidora'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Preencha as informações fiscais e canais de atendimento B2B.</p>
          </div>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-rose-500 hover:underline font-semibold bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar Edição
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">Nome da Empresa / Distribuidora *</label>
          <input
            type="text"
            placeholder="Ex: DISTRIBUIDORA DE COSMÉTICOS LTDA"
            value={name}
            onChange={(e) => setName(uppercaseText(e.target.value))}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">CNPJ da Empresa</label>
          <input
            type="text"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={handleCnpjChange}
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">CEP (Preenchimento Automático)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              className={`${inputClass} font-mono`}
            />
            {fetchingCep && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] animate-pulse text-indigo-500 font-semibold">
                A buscar...
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">Endereço Completo</label>
          <input
            type="text"
            placeholder="Logradouro, Nº, Bairro, Cidade - UF"
            value={address}
            onChange={(e) => setAddress(uppercaseText(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">Nome do Representante</label>
          <input
            type="text"
            placeholder="Ex: CARLOS SILVA"
            value={contactPerson}
            onChange={(e) => setContactPerson(uppercaseText(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">Telefone / WhatsApp</label>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={handlePhoneChange}
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">E-mail de Contato</label>
          <input
            type="email"
            placeholder="contato@distribuidora.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={submitting}
          className={`text-xs font-bold px-6 py-2.5 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer ${
            editingId ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' : themeButtonStyles
          } disabled:opacity-50`}
        >
          {submitting ? 'A processar...' : editingId ? 'Salvar Alterações' : '+ Cadastrar Fornecedor'}
        </button>
      </div>
    </form>
  );
}