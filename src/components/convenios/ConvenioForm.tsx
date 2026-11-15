"use client";

import React from "react";

interface ConvenioFormProps {
  mode: "COMPANY_PARTNER" | "EMPLOYEE";
  setMode: (mode: "COMPANY_PARTNER" | "EMPLOYEE") => void;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  companyPartners: Array<{ id: string; name: string; document: string | null }>;
  document: string;
  setDocument: (doc: string) => void;
  handleFetchCnpj: (cnpj: string) => void;
  fetchingCnpj: boolean;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  creditLimit: string;
  setCreditLimit: (limit: string) => void;
  discountPercentage: string;
  setDiscountPercentage: (disc: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDarkMode: boolean;
}

export function ConvenioForm({
  mode,
  setMode,
  selectedCompanyId,
  setSelectedCompanyId,
  companyPartners,
  document,
  setDocument,
  handleFetchCnpj,
  fetchingCnpj,
  name,
  setName,
  phone,
  setPhone,
  creditLimit,
  setCreditLimit,
  discountPercentage,
  setDiscountPercentage,
  onSubmit,
  isDarkMode,
}: ConvenioFormProps) {
  return (
    <div
      className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
    >
      <h3 className="text-sm font-black uppercase tracking-wider mb-4">
        Novo Cadastro de Convênio
      </h3>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("COMPANY_PARTNER")}
          className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl border transition cursor-pointer ${
            mode === "COMPANY_PARTNER"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-slate-500/10 border-slate-500/20 opacity-70"
          }`}
        >
          🏢 Empresa Parceira
        </button>
        <button
          type="button"
          onClick={() => setMode("EMPLOYEE")}
          className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl border transition cursor-pointer ${
            mode === "EMPLOYEE"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-slate-500/10 border-slate-500/20 opacity-70"
          }`}
        >
          👤 Funcionário
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        {mode === "EMPLOYEE" && (
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
            <label className="block font-bold text-indigo-600 dark:text-indigo-400">
              Empresa Parceira Vinculada *
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-950 font-bold font-mono text-xs border-slate-500/20 outline-none"
              required
            >
              <option value="">-- Selecionar Empresa Mãe --</option>
              {companyPartners.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  🏢 {comp.name} ({comp.document || "Sem CNPJ"})
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "COMPANY_PARTNER" && (
          <div>
            <label className="block font-bold mb-1 opacity-80">
              CNPJ (Busca Automática)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="00.000.000/0001-00"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                onBlur={(e) => handleFetchCnpj(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono border-slate-500/20 outline-none"
              />
              {fetchingCnpj && (
                <span className="absolute right-3 top-2.5 text-[10px] text-indigo-600 font-bold animate-pulse">
                  A consultar...
                </span>
              )}
            </div>
          </div>
        )}

        {mode === "EMPLOYEE" && (
          <div>
            <label className="block font-bold mb-1 opacity-80">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono border-slate-500/20 outline-none"
            />
          </div>
        )}

        <div>
          <label className="block font-bold mb-1 opacity-80">
            {mode === "COMPANY_PARTNER"
              ? "Razão Social da Empresa"
              : "Nome Completo do Funcionário"}
          </label>
          <input
            type="text"
            placeholder={
              mode === "COMPANY_PARTNER"
                ? "Ex: Empresa XYZ Ltda"
                : "Ex: João da Silva"
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 uppercase border-slate-500/20 outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-1 opacity-80">Telefone</label>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono border-slate-500/20 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold mb-1 opacity-80">
              Limite Crédito (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono font-bold border-slate-500/20 outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1 opacity-80">
              Desconto (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono font-bold border-slate-500/20 outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          {mode === "COMPANY_PARTNER"
            ? "Cadastrar Empresa Parceira 🏢"
            : "Cadastrar Funcionário 👤"}
        </button>
      </form>
    </div>
  );
}
