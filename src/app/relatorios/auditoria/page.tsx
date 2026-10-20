'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';
import { ShieldAlert } from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  details: string | null;
  userId: string | null;
  userName: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLogs() {
      if (!companyId) return;
      try {
        setLoading(true);
        const res = await apiFetch(`/api/audit/logs?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setLogs(data.logs);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar logs de auditoria:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Trilha de Auditoria & Segurança (Audit Logs)"
        subtitle="Registo eletrónico transparente de todas as ações sensíveis e operacionais do sistema."
        onOpenCmd={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>
        </div>

        <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 border-b pb-4 border-slate-500/10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Registo Eletrónico de Eventos Críticos</h3>
              <p className="text-xs opacity-60">Monitorização em tempo real de autorizações, cancelamentos e alterações sensíveis.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs opacity-50 font-mono">A carregar trilha de auditoria...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-40 font-mono">Nenhum evento crítico registado até o momento.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[10px] font-extrabold opacity-60 border-slate-500/10">
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Colaborador / Utilizador</th>
                    <th className="p-3">Ação Executada</th>
                    <th className="p-3">Detalhes do Evento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-500/5 transition">
                      <td className="p-3 opacity-75">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                      <td className="p-3 font-sans font-bold">{log.userName || 'Sistema / Terminal'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase border border-indigo-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 opacity-80 font-sans">{log.details || 'Nenhum detalhe adicional fornecido.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}