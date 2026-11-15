"use client";

import React from "react";

interface PartnerItem {
  id: string;
  type: "EMPLOYEE" | "COMPANY_PARTNER";
  name: string;
  document: string | null;
  phone: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  companyPartnerId: string | null;
  active: boolean;
}

interface ConvenioListProps {
  partners: PartnerItem[];
  loading: boolean;
  isDarkMode: boolean;
}

export function ConvenioList({
  partners,
  loading,
  isDarkMode,
}: ConvenioListProps) {
  const companyPartners = partners.filter((p) => p.type === "COMPANY_PARTNER");

  return (
    <div
      className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
    >
      <h3 className="text-sm font-black uppercase tracking-wider mb-4">
        Empresas Parceiras & Funcionários Vinculados
      </h3>

      {loading ? (
        <p className="text-center py-12 text-xs opacity-50 font-mono">
          Carregando convênios...
        </p>
      ) : partners.length === 0 ? (
        <p className="text-center py-12 text-xs opacity-50 font-mono">
          Nenhum convênio cadastrado.
        </p>
      ) : (
        <div className="space-y-6">
          {companyPartners.map((comp) => {
            const employees = partners.filter(
              (p) => p.companyPartnerId === comp.id,
            );
            const compDebt = Number(comp.currentBalance || 0);
            const compLimit = Number(comp.creditLimit || 0);

            return (
              <div
                key={comp.id}
                className="p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-500/10 pb-3">
                  <div>
                    <div className="font-extrabold text-sm flex items-center gap-2">
                      <span>🏢</span> {comp.name}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-mono font-bold">
                        Empresa Parceira
                      </span>
                    </div>
                    <div className="text-[11px] opacity-60 font-mono mt-0.5">
                      CNPJ: {comp.document || "Não informado"} | Tel:{" "}
                      {comp.phone || "N/A"} | Desconto:{" "}
                      {Number(comp.discountPercentage)}%
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[10px] opacity-60 uppercase font-bold">
                      Limite / Saldo Devedor
                    </div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      R$ {compDebt.toFixed(2)} /{" "}
                      <span className="opacity-70">
                        R$ {compLimit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pl-4 sm:pl-6 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider opacity-50">
                    Funcionários Vinculados ({employees.length})
                  </div>

                  {employees.length === 0 ? (
                    <p className="text-xs italic opacity-40 font-mono">
                      Nenhum funcionário cadastrado nesta empresa ainda.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {employees.map((emp) => {
                        const empDebt = Number(emp.currentBalance || 0);
                        const empLimit = Number(emp.creditLimit || 0);
                        return (
                          <div
                            key={emp.id}
                            className={`p-3 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} flex justify-between items-center text-xs`}
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                <span>👤</span> {emp.name}
                              </div>
                              <div className="text-[10px] opacity-60 font-mono">
                                CPF: {emp.document || "N/A"}
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="font-bold">
                                R$ {empDebt.toFixed(2)}
                              </div>
                              <div className="text-[10px] opacity-50">
                                Lim: R$ {empLimit.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
