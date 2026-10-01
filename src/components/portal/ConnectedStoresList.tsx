'use client';

import { useState, useEffect } from 'react';

interface Connection {
  id: string;
  companyId: string;
  supplierId: string;
  status: string;
  initiatedBy?: string;
  companyName?: string;
  companyCnpj?: string;
  companyEmail?: string;
  brandName?: string;
  tradeName?: string;
}

interface ConnectedStoresListProps {
  isDarkMode: boolean;
  supplierId: string;
  supplierEmail?: string;
  activeBrandId?: string;
  activeBrandName?: string;
  onSelectStoreForQuotations?: (companyId: string, storeName: string) => void;
}

export function ConnectedStoresList({
  isDarkMode,
  supplierId,
  supplierEmail,
  activeBrandName,
  onSelectStoreForQuotations,
}: ConnectedStoresListProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchConnectedStores() {
      if (!supplierId) return;
      
      try {
        const emailQuery = supplierEmail ? `&supplierEmail=${encodeURIComponent(supplierEmail)}` : '';
        const res = await fetch(`/api/portal/connections?supplierId=${supplierId}${emailQuery}`);
        if (!res.ok) throw new Error('Erro ao buscar conexões');
        const data: Connection[] = await res.json();
        
        const acceptedConnections = data.filter((c) => {
          const isAccepted = c.status?.toUpperCase() === 'ACCEPTED' || c.status?.toUpperCase() === 'ACEITO';
          return isAccepted;
        });

        const uniqueConnectionsMap = new Map<string, Connection>();
        for (const conn of acceptedConnections) {
          if (!uniqueConnectionsMap.has(conn.companyId)) {
            uniqueConnectionsMap.set(conn.companyId, conn);
          }
        }
        const uniqueConnections = Array.from(uniqueConnectionsMap.values());

        if (isMounted) {
          setConnections(uniqueConnections);
        }
      } catch (err) {
        console.error('Erro ao carregar lojas conectadas:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchConnectedStores();

    return () => {
      isMounted = false;
    };
  }, [supplierId, supplierEmail]);

  if (loading) {
    return (
      <div className={`p-6 rounded-[2.5rem] border text-center text-xs opacity-60 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        A carregar lojas parceiras para {activeBrandName || 'esta marca'}...
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-xl border backdrop-blur-2xl transition-all space-y-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
      }`}>
        <div className="flex items-center gap-2.5 border-b pb-4 border-slate-500/10">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm">🏪</span>
          <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
            Lojas Parceiras Conectadas — {activeBrandName || 'Geral'}
          </h2>
        </div>
        <p className="text-xs opacity-60 py-6 text-center">
          Ainda não existem lojas parceiras conectadas à marca <strong className="text-indigo-500">{activeBrandName}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
    }`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-500/10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm">🏪</span>
          <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
            Lojas Parceiras Conectadas — {activeBrandName || 'Geral'}
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {connections.length} {connections.length === 1 ? 'loja ativa' : 'lojas ativas'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((store) => {
          const storeName = store.companyName || `Loja Parceira (ID: #${store.companyId.slice(0, 8)})`;
          const storeCnpj = store.companyCnpj || 'CNPJ não informado';
          const storeEmail = store.companyEmail || 'E-mail não informado';

          return (
            <div
              key={store.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between gap-3 transition-all shadow-md ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Conectado a {activeBrandName} ✓
                  </span>
                  <span className="text-[10px] font-mono opacity-50">ID: #{store.companyId.slice(0, 8)}</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">{storeName}</h3>
                <p className="text-xs font-mono text-slate-500">CNPJ: {storeCnpj}</p>
                <p className="text-xs text-slate-500">E-mail: {storeEmail}</p>
              </div>

              <div className="pt-3 border-t border-slate-500/10 flex items-center justify-between text-[11px]">
                <span className="opacity-75 font-medium">Gestão Comercial da Loja</span>
                <button
                  type="button"
                  onClick={() => onSelectStoreForQuotations?.(store.companyId, storeName)}
                  className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Gerir cotações ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}