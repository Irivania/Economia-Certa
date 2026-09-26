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
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
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
  password,
  setPassword,
  showPassword,
  setShowPassword,
  submitting,
  onSubmit,
  onReset,
  isDarkMode,
  themeButtonStyles,
}: SupplierFormProps) {
  return (
    <form onSubmit={onSubmit} className={`p-8 rounded-3xl shadow-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
      <div className="flex justify-between items-center mb-6 border-b border-slate-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-lg">
            🤝
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">
              {editingId ? 'Editar Dados do Fornecedor' : 'Novo Cadastro de Distribuidora'}
            </h2>
            <p className="text-xs opacity-60 mt-0.5">Preencha as informações fiscais e canais de atendimento B2B.</p>
          </div>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-rose-500 hover:underline font-bold bg-rose-500/10 px-3.5 py-2 rounded-xl transition-colors"
          >
            Cancelar Edição
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">Nome da Empresa / Distribuidora *</label>
          <input
            type="text"
            placeholder="Ex: DISTRIBUIDORA DE COSMÉTICOS LTDA"
            value={name}
            onChange={(e) => setName(uppercaseText(e.target.value))}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none font-medium transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">CNPJ da Empresa</label>
          <input
            type="text"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={handleCnpjChange}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none font-mono transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">CEP (Preenchimento Automático)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none font-mono transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
            />
            {fetchingCep && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] animate-pulse text-indigo-500 font-bold">
                A buscar...
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">Endereço Completo</label>
          <input
            type="text"
            placeholder="Logradouro, Nº, Bairro, Cidade - UF"
            value={address}
            onChange={(e) => setAddress(uppercaseText(e.target.value))}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">Nome do Representante</label>
          <input
            type="text"
            placeholder="Ex: CARLOS SILVA"
            value={contactPerson}
            onChange={(e) => setContactPerson(uppercaseText(e.target.value))}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">Telefone / WhatsApp</label>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={handlePhoneChange}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none font-mono transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">E-mail de Contato</label>
          <input
            type="email"
            placeholder="contato@distribuidora.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 text-xs border rounded-2xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
          />
        </div>

        <div className="relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">Palavra-passe Portal B2B</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={editingId ? 'Manter senha atual (opcional)' : 'Palavra-passe de acesso *'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 pr-10 text-xs border rounded-2xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 text-xs focus:outline-none"
          >
            {showPassword ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-500/10">
        <button
          type="submit"
          disabled={submitting}
          className={`text-xs font-extrabold px-8 py-3.5 rounded-2xl transition-all shadow-xl active:scale-95 cursor-pointer ${
            editingId ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25' : themeButtonStyles
          } disabled:opacity-50`}
        >
          {submitting ? 'A processar...' : editingId ? 'Salvar Alterações' : '+ Cadastrar Fornecedor'}
        </button>
      </div>
    </form>
  );
}