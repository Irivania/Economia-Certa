'use client';

import { useState } from 'react';
import { Search, X, Users, Check } from 'lucide-react';

interface PartnerItem {
  id: string;
  type: 'EMPLOYEE' | 'COMPANY_PARTNER';
  name: string;
  document: string | null;
  creditLimit: string;
  currentBalance: string;
  active: boolean;
}

interface PDVPartnerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: PartnerItem[];
  onSelectPartner: (partnerId: string, partnerName: string) => void;
  isDarkMode: boolean;
}

export function PDVPartnerSearchModal({
  isOpen,
  onClose,
  partners,
  onSelectPartner,
  isDarkMode,
}: PDVPartnerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.document && p.document.includes(searchTerm))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider">Selecionar Convênio / Funcionário</h3>
            <p className="text-xs opacity-60">Pesquise pelo nome ou documento do colaborador cadastrado.</p>
          </div>
        </div>

        {/* Input de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 opacity-40" />
          <input
            type="text"
            placeholder="Digite o nome do funcionário ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs border rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-500/30 focus:border-indigo-600 outline-none"
            autoFocus
          />
        </div>

        {/* Listagem de Parceiros */}
        <div className="max-h-72 overflow-y-auto space-y-2">
          {filteredPartners.length === 0 ? (
            <p className="text-center py-8 text-xs opacity-40">Nenhum funcionário ou empresa encontrados.</p>
          ) : (
            filteredPartners.map((partner) => {
              const currentDebt = Number(partner.currentBalance || 0);
              const limit = Number(partner.creditLimit || 500);
              const available = limit - currentDebt;

              return (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => {
                    onSelectPartner(partner.id, partner.name);
                    onClose();
                  }}
                  className="w-full p-3.5 rounded-2xl border border-slate-500/10 bg-slate-500/5 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition text-left flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs flex items-center gap-2">
                      {partner.type === 'COMPANY_PARTNER' ? '🏢' : '👤'} {partner.name}
                      <span className="text-[10px] opacity-60 font-mono">({partner.type === 'COMPANY_PARTNER' ? 'Empresa' : 'Funcionário'})</span>
                    </div>
                    <div className="text-[10px] opacity-60 font-mono">
                      Crédito Disponível: <span className="text-emerald-600 dark:text-emerald-400 font-bold">R$ {available.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-4 border-t border-slate-500/15 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-500/30 font-bold text-xs transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}