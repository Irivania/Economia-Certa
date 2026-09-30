'use client';

import React from 'react';

export interface RepresentedCompany {
  id: string;
  tradeName: string;
  corporateName: string;
  cnpj: string;
  email: string;
  phone: string;
}

interface BrandPortfolioManagerProps {
  isDarkMode: boolean;
  representedCompanies: RepresentedCompany[];
  activeCompany: RepresentedCompany;
  onSelectCompany: (company: RepresentedCompany) => void;
  onAddCompany: (e: React.FormEvent) => void;
  onRemoveCompany: (id: string) => void;
  tradeNameInput: string;
  setTradeNameInput: (val: string) => void;
  corporateNameInput: string;
  setCorporateNameInput: (val: string) => void;
  cnpjInput: string;
  setCnpjInput: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
}

export function BrandPortfolioManager({
  isDarkMode,
  representedCompanies,
  activeCompany,
  onSelectCompany,
  onAddCompany,
  onRemoveCompany,
  tradeNameInput,
  setTradeNameInput,
  corporateNameInput,
  setCorporateNameInput,
  cnpjInput,
  setCnpjInput,
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
}: BrandPortfolioManagerProps) {
  return (
    <div className="space-y-6">
      {/* Seletor de Marca Ativa (Context Switcher) */}
      <div className={`p-6 rounded-3xl shadow-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDarkMode ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-900/50' : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100'}`}>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Portfólio de Atuação Ativa</span>
          <h2 className="text-sm font-black tracking-tight">
            A negociar como: <span className="text-indigo-600 dark:text-indigo-400 underline">{activeCompany?.tradeName}</span>
          </h2>
          <p className="text-[11px] opacity-60 font-mono">CNPJ: {activeCompany?.cnpj} | {activeCompany?.corporateName}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {representedCompanies.map((comp) => (
            <button
              key={comp.id}
              onClick={() => onSelectCompany(comp)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                activeCompany?.id === comp.id
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : isDarkMode 
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              🏢 {comp.tradeName}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário e Listagem de Registo de Marcas */}
      <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
        <div>
          <h2 className="text-sm font-black tracking-tight">🏭 Gerir Portfólio de Marcas / Distribuidoras</h2>
          <p className="text-xs opacity-60 mt-0.5">Adicione as marcas ou distribuidoras que representa no seu escritório comercial.</p>
        </div>

        <form onSubmit={onAddCompany} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Nome Fantasia / Marca</label>
            <input
              type="text"
              required
              placeholder="Ex: Rogê"
              value={tradeNameInput}
              onChange={(e) => setTradeNameInput(e.target.value)}
              className={`w-full px-4 py-2.5 text-xs border rounded-2xl outline-none uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Razão Social</label>
            <input
              type="text"
              placeholder="Ex: Rogê Distribuidora S.A."
              value={corporateNameInput}
              onChange={(e) => setCorporateNameInput(e.target.value)}
              className={`w-full px-4 py-2.5 text-xs border rounded-2xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">CNPJ</label>
            <input
              type="text"
              placeholder="00.000.000/0001-00"
              value={cnpjInput}
              onChange={(e) => setCnpjInput(e.target.value)}
              className={`w-full px-4 py-2.5 text-xs border rounded-2xl font-mono outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">E-mail Comercial</label>
            <input
              type="email"
              placeholder="contato@distribuidora.com.br"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className={`w-full px-4 py-2.5 text-xs border rounded-2xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Telefone / WhatsApp</label>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className={`w-full px-4 py-2.5 text-xs border rounded-2xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-600/25"
            >
              + Adicionar Distribuidora
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-500/10">
          {representedCompanies.map((comp) => (
            <div
              key={comp.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                activeCompany?.id === comp.id 
                  ? 'border-indigo-500/50 bg-indigo-500/5 shadow-md' 
                  : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-indigo-500">📦 {comp.tradeName}</span>
                  {representedCompanies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveCompany(comp.id)}
                      className="text-rose-500 hover:text-rose-600 font-bold text-xs cursor-pointer px-2 py-0.5 rounded bg-rose-500/10"
                      title="Remover distribuidora"
                    >
                      × Remover
                    </button>
                  )}
                </div>
                <p className="text-[11px] font-semibold">{comp.corporateName}</p>
                <p className="text-[10px] opacity-60 font-mono">CNPJ: {comp.cnpj}</p>
              </div>

              <div className="pt-2 border-t border-slate-500/10 flex justify-between items-center text-[10px] opacity-70">
                <span>✉ {comp.email}</span>
                <span>📞 {comp.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}