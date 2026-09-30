'use client';

import React, { useState } from 'react';

export interface Connection {
  id: string;
  companyId: string;
  status: string;
  initiatedBy: string;
}

interface ConnectionRequestsProps {
  isDarkMode: boolean;
  supplierId: string;
  connections: Connection[];
  onUpdateConnection: (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => void;
  onRefreshConnections: () => void;
}

export function ConnectionRequests({
  isDarkMode,
  supplierId,
  connections,
  onUpdateConnection,
  onRefreshConnections,
}: ConnectionRequestsProps) {
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompanyId.trim()) return;

    try {
      setLoadingInvite(true);
      setInviteFeedback(null);

      const res = await fetch('/api/portal/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: targetCompanyId.trim(),
          supplierId,
          initiatedBy: 'SUPPLIER',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar convite.');

      setInviteFeedback('✅ Convite enviado com sucesso para a loja!');
      setTargetCompanyId('');
      onRefreshConnections();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar convite.';
      setInviteFeedback(`⚠️ ${message}`);
    } finally {
      setLoadingInvite(false);
      setTimeout(() => setInviteFeedback(null), 4000);
    }
  };

  const hasConnections = connections.length > 0;

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
    }`}>
      {/* Header da Secção */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-500/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-sm">🤝</span>
            <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">Conectividade & Parcerias B2B</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Envie convites para lojistas ou aceite solicitações de parceria pendentes.</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {connections.filter(c => c.status === 'PENDING').length} Pendentes
        </span>
      </div>

      {/* Formulário para Enviar Novo Convite */}
      <form onSubmit={handleSendInvitation} className={`p-5 rounded-3xl border space-y-3 ${
        isDarkMode ? 'bg-slate-950/60 border-indigo-500/30' : 'bg-slate-50/80 border-indigo-200'
      }`}>
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Convidar Nova Loja / Lojista
          </label>
          <span className="text-[10px] font-mono opacity-60">Informe o ID da Loja</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Cole aqui o UUID / ID da Empresa (Lojista)"
            value={targetCompanyId}
            onChange={(e) => setTargetCompanyId(e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border text-xs font-mono outline-none transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
            }`}
          />
          <button
            type="submit"
            disabled={loadingInvite}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black uppercase tracking-widest transition shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 whitespace-nowrap disabled:opacity-50"
          >
            {loadingInvite ? 'A enviar...' : 'Disparar Convite ➔'}
          </button>
        </div>

        {inviteFeedback && (
          <p className="text-xs font-bold pt-1 animate-in fade-in">{inviteFeedback}</p>
        )}
      </form>

      {/* Lista de Conexões Existentes */}
      {!hasConnections ? (
        <div className={`p-6 rounded-3xl border border-dashed text-center space-y-1 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <p className="text-xs font-bold text-slate-400">Sem parcerias ativas ou convites registados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((conn) => {
            const isPending = conn.status === 'PENDING';
            const isAccepted = conn.status === 'ACCEPTED';

            return (
              <div 
                key={conn.id} 
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-950' : 'border-slate-200/80 bg-slate-50/80 hover:bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      isAccepted ? 'bg-emerald-400' : isPending ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                    }`} />
                    <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                      Parceria com Loja (ID: #{conn.companyId.slice(0, 8)})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Iniciado por: <strong className="uppercase">{conn.initiatedBy}</strong> • Estado:{' '}
                    <span className={`font-bold ${isAccepted ? 'text-emerald-500' : isPending ? 'text-amber-500' : 'text-rose-500'}`}>
                      {conn.status}
                    </span>
                  </p>
                </div>

                {isPending && conn.initiatedBy === 'COMPANY' ? (
                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onUpdateConnection(conn.id, 'ACCEPTED')}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
                    >
                      Aceitar ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateConnection(conn.id, 'REJECTED')}
                      className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95"
                    >
                      Recusar
                    </button>
                  </div>
                ) : (
                  <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                    isAccepted 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {isAccepted ? '✓ Parceria Ativa' : 'Aguardando Aprovação'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}