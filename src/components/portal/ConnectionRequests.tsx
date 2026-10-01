'use client';

import { useState } from 'react';

export interface Connection {
  id: string;
  companyId: string;
  supplierId: string;
  status: 'PENDENTE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  initiatedBy?: string;
  companyName?: string;
  companyCnpj?: string;
  companyEmail?: string;
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
  connections,
  onUpdateConnection,
  onRefreshConnections,
}: ConnectionRequestsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filtro universal para aceitar tanto "PENDENTE" (PT) quanto "PENDING" (EN)
  const pendingConnections = connections.filter((c) => {
    const st = (c.status || '').trim().toUpperCase();
    return st === 'PENDENTE' || st === 'PENDING';
  });

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Deseja realmente excluir esta solicitação/conexão pendente?')) {
      return;
    }

    try {
      setProcessingId(connectionId);
      const res = await fetch('/api/portal/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!res.ok) throw new Error('Erro ao excluir conexão');

      onRefreshConnections();
    } catch (err) {
      console.error('Erro ao excluir conexão:', err);
      alert('Não foi possível excluir a conexão.');
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingConnections.length === 0) {
    return null;
  }

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
    }`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-500/10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 text-sm">🔔</span>
          <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
            Solicitações de Conexão Pendentes
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
          {pendingConnections.length} {pendingConnections.length === 1 ? 'pendente' : 'pendentes'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingConnections.map((conn) => {
          const storeName = conn.companyName || `Parceria com Loja (ID: #${conn.companyId.slice(0, 8)})`;
          const isProcessing = processingId === conn.id;
          const isInitiatedBySupplier = conn.initiatedBy?.toUpperCase() === 'SUPPLIER';

          return (
            <div
              key={conn.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all shadow-md ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {isInitiatedBySupplier ? 'Enviado por si (Aguardando)' : 'Convite Recebido da Loja'}
                  </span>
                  
                  {/* Botão de Excluir para limpar conexões pendentes/antigas */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDeleteConnection(conn.id)}
                    className="px-3 py-1 text-[11px] font-bold rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition cursor-pointer shadow-sm disabled:opacity-50"
                    title="Excluir conexão pendente"
                  >
                    {isProcessing ? 'A excluir...' : '🗑️ Excluir'}
                  </button>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">{storeName}</h3>
                <p className="text-[11px] font-mono opacity-70">Estado: {conn.status} {conn.initiatedBy ? `• Iniciado por: ${conn.initiatedBy}` : ''}</p>
                {conn.companyCnpj && (
                  <p className="text-xs font-mono text-slate-500">CNPJ: {conn.companyCnpj}</p>
                )}
                {conn.companyEmail && (
                  <p className="text-xs text-slate-500">E-mail: {conn.companyEmail}</p>
                )}
              </div>

              {!isInitiatedBySupplier ? (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-500/10">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onUpdateConnection(conn.id, 'ACCEPTED')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 disabled:opacity-50 text-center"
                  >
                    Aceitar ✓
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onUpdateConnection(conn.id, 'REJECTED')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95 disabled:opacity-50 text-center"
                  >
                    Recusar ✕
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-500/10 flex justify-between items-center text-[11px] text-amber-500 font-bold">
                  <span>⏳ Aguardando aprovação da loja</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}