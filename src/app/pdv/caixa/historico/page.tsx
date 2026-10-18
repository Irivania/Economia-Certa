'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { History, Lock, Unlock } from 'lucide-react';

interface RegisterRecord {
  id: string;
  operatorName: string;
  openingAmount: string;
  closingAmount: string | null;
  differenceAmount: string | null;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

export default function CashRegisterHistoryPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [registers, setRegisters] = useState<RegisterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!companyId) return;
      try {
        const res = await apiFetch(`/api/pdv/register/history?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.registers)) {
            setRegisters(data.registers);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Histórico de Turnos de Caixa"
        subtitle="Auditoria gerencial de turnos anteriores, quebras e operador responsável."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/pdv/caixa" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar à Gestão de Caixa
          </Link>
        </div>

        <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Registo de Turnos Anteriores</h3>
              <p className="text-xs opacity-60">Consulte a auditoria completa de abertura, fechamento e diferenças.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs opacity-50 font-mono">A carregar histórico...</div>
          ) : registers.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-40 font-mono">Nenhum turno de caixa registado até ao momento.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3">Estado</th>
                    <th className="p-3">Operador</th>
                    <th className="p-3">Abertura</th>
                    <th className="p-3">Fechamento</th>
                    <th className="p-3">Diferença (Quebra/Sobra)</th>
                    <th className="p-3">Abertura / Fecho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs">
                  {registers.map((reg) => {
                    const isOpen = reg.status === 'OPEN';
                    const diff = Number(reg.differenceAmount || 0);
                    const isBalanced = Math.abs(diff) < 0.01;

                    return (
                      <tr key={reg.id} className="hover:bg-slate-500/5 transition">
                        <td className="p-3">
                          {isOpen ? (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-extrabold text-[10px] uppercase inline-flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> Aberto
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 font-extrabold text-[10px] uppercase inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Fechado
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-sans font-bold">{reg.operatorName}</td>
                        <td className="p-3 font-bold text-emerald-600">R$ {Number(reg.openingAmount).toFixed(2)}</td>
                        <td className="p-3 font-bold">
                          {reg.closingAmount ? `R$ ${Number(reg.closingAmount).toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3">
                          {isOpen ? (
                            <span className="opacity-50">Em andamento</span>
                          ) : (
                            <span className={`font-bold px-2 py-0.5 rounded ${
                              isBalanced ? 'text-emerald-600 bg-emerald-500/10' : diff > 0 ? 'text-blue-600 bg-blue-500/10' : 'text-rose-600 bg-rose-500/10'
                            }`}>
                              {diff > 0 ? `+R$ ${diff.toFixed(2)}` : `R$ ${diff.toFixed(2)}`}
                            </span>
                          )}
                        </td>
                        <td className="p-3 opacity-70 text-[11px]">
                          {new Date(reg.openedAt).toLocaleString('pt-BR')}
                          {reg.closedAt && <span className="block opacity-60">até {new Date(reg.closedAt).toLocaleString('pt-BR')}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}