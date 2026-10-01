'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BrandPortfolioSection } from '@/components/portal/BrandPortfolioSection';

interface CotacaoItem {
  id: string;
  productId: string;
  productDescription: string;
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
}

interface Quotation {
  id: string;
  companyId: string;
  supplierId: string;
  status: 'PENDING' | 'SENT' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  items: CotacaoItem[];
}

interface Connection {
  id: string;
  companyId: string;
  supplierId: string;
  status: string;
  initiatedBy: string;
}

interface SupplierSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface RepresentedCompany {
  id: string;
  tradeName: string;
  corporateName: string;
  cnpj: string;
  email: string;
  phone: string;
}

export default function SupplierPortalDashboard() {
  const router = useRouter();

  const [supplier] = useState<SupplierSession | null> (() => {
    if (typeof window === 'undefined') return null;
    const sessionData = sessionStorage.getItem('melo_supplier_session');
    if (!sessionData) return null;
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  });

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado para o Portfólio de Marcas & Distribuidoras do Representante
  const [representedCompanies, setRepresentedCompanies] = useState<RepresentedCompany[]>([
    {
      id: 'default-solfarma',
      tradeName: 'SOLFARMA',
      corporateName: 'SOLFARMA COMERCIO DE PRODUTOS FARMACEUTICOS S.A.',
      cnpj: '46.054.219/0001-74',
      email: 'contato@solfarma.com',
      phone: '(11) 3459-2300',
    },
  ]);
  const [activeCompany, setActiveCompany] = useState<RepresentedCompany>(representedCompanies[0]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPortalData = useCallback(async (supplierId: string) => {
    try {
      const [quotRes, connRes] = await Promise.all([
        fetch(`/api/portal/quotations?supplierId=${supplierId}`),
        fetch(`/api/portal/connections?supplierId=${supplierId}`)
      ]);

      if (quotRes.ok) {
        const quotData = await quotRes.json();
        setQuotations(Array.isArray(quotData) ? quotData : []);
      }
      if (connRes.ok) {
        const connData = await connRes.json();
        setConnections(Array.isArray(connData) ? connData : []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do portal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('melo_supplier_session');
    if (!sessionData) {
      router.push('/portal/login');
      return;
    }

    try {
      const parsedSupplier: SupplierSession = JSON.parse(sessionData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadPortalData(parsedSupplier.id);
    } catch (err) {
      console.error(err);
      router.push('/portal/login');
    }
  }, [router, loadPortalData]);

  const handleConnectByCompanyId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompanyId.trim() || !supplier) return;

    try {
      const res = await fetch('/api/portal/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: targetCompanyId.trim(),
          supplierId: supplier.id,
          initiatedBy: 'SUPPLIER'
        })
      });

      if (!res.ok) throw new Error('Erro ao enviar convite.');

      showToast('Convite de parceria enviado à loja com sucesso!');
      setTargetCompanyId('');
      await loadPortalData(supplier.id);
    } catch {
      alert('Não foi possível enviar o convite. Verifique o ID da loja.');
    }
  };

  const handleUpdateConnection = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED' | 'INACTIVE') => {
    try {
      const res = await fetch('/api/portal/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status })
      });
      if (!res.ok) throw new Error();
      showToast('Estado da conexão atualizado com sucesso!');
      if (supplier) await loadPortalData(supplier.id);
    } catch {
      showToast('Erro ao atualizar conexão.');
    }
  };

  // Gestão de Marcas do Representante (Adicionar, Atualizar, Remover)
  const handleAddCompany = (newComp: Omit<RepresentedCompany, 'id'>) => {
    const created: RepresentedCompany = {
      ...newComp,
      id: `comp-${Date.now()}`,
    };
    const updated = [...representedCompanies, created];
    setRepresentedCompanies(updated);
    setActiveCompany(created);
    showToast('Distribuidora adicionada com sucesso!');
  };

  const handleUpdateCompany = (updatedComp: RepresentedCompany) => {
    const updated = representedCompanies.map((c) => (c.id === updatedComp.id ? updatedComp : c));
    setRepresentedCompanies(updated);
    if (activeCompany.id === updatedComp.id) {
      setActiveCompany(updatedComp);
    }
    showToast('Distribuidora atualizada com sucesso!');
  };

  const handleRemoveCompany = (id: string) => {
    const filtered = representedCompanies.filter((c) => c.id !== id);
    setRepresentedCompanies(filtered);
    if (activeCompany.id === id && filtered.length > 0) {
      setActiveCompany(filtered[0]);
    }
    showToast('Distribuidora removida com sucesso!');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('melo_supplier_session');
    router.push('/portal/login');
  };

  if (!supplier) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">A carregar portal...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        {/* Cabeçalho do Fornecedor */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🏢 Portal do Fornecedor / Distribuidor</h1>
            <p className="text-xs text-slate-500">Bem-vindo(a), <span className="font-semibold text-slate-700">{supplier.name}</span> ({supplier.email})</p>
            <p className="text-[10px] font-mono text-indigo-600 mt-1">ID Comercial B2B: {supplier.id}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Sair da Sessão &rarr;
          </button>
        </div>

        {/* Secção de Portfólio de Marcas & Distribuidoras com Edição/Exclusão */}
        <BrandPortfolioSection
          isDarkMode={false}
          representedCompanies={representedCompanies}
          activeCompany={activeCompany}
          onSelectCompany={(comp) => setActiveCompany(comp)}
          onAddCompany={handleAddCompany}
          onUpdateCompany={handleUpdateCompany}
          onRemoveCompany={handleRemoveCompany}
        />

        {/* Secção de Conexões B2B */}
        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">🔗 Conexões e Parcerias com Lojas</h2>
          
          <form onSubmit={handleConnectByCompanyId} className="flex gap-2">
            <input
              type="text"
              placeholder="Cole aqui o ID / UUID da Loja para conectar..."
              value={targetCompanyId}
              onChange={(e) => setTargetCompanyId(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border rounded-lg bg-white outline-none border-slate-300 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm"
            >
              + Conectar Loja por ID
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {connections.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma conexão ativa ou pendente com lojas no momento.</p>
            ) : (
              connections.map((conn) => {
                const isPending = conn.status === 'PENDING' || conn.status === 'PENDENTE';
                const isAccepted = conn.status === 'ACCEPTED';
                const isPendingFromCompany = isPending && conn.initiatedBy === 'COMPANY';

                return (
                  <div key={conn.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg border border-slate-200 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 block">ID da Loja: {conn.companyId}</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isAccepted ? '🔗 Conectado B2B' : `⏳ Estado: ${conn.status} (Iniciado por: ${conn.initiatedBy})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPendingFromCompany && (
                        <button
                          type="button"
                          onClick={() => handleUpdateConnection(conn.id, 'ACCEPTED')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition cursor-pointer"
                        >
                          Aceitar Parceria ✓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleUpdateConnection(conn.id, isAccepted ? 'INACTIVE' : 'REJECTED')}
                        className="px-3 py-1 bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-700 text-[10px] font-bold rounded transition cursor-pointer"
                      >
                        {isAccepted ? 'Inativar' : 'Excluir / Recusar'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lista de Cotações Recebidas */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-4">📋 Cotações e Pedidos Recebidos para: <span className="text-indigo-600">{activeCompany.tradeName}</span></h2>
          {loading ? (
            <p className="text-xs text-slate-400 py-10 text-center">A carregar cotações...</p>
          ) : quotations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-xs">Não existem cotações pendentes no momento para esta distribuidora.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.map((cot) => (
                <div key={cot.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span><b>Cotação ID:</b> {cot.id.slice(0, 8)}...</span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {cot.status}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <th className="p-2.5 font-semibold">Produto</th>
                          <th className="p-2.5 font-semibold text-center">Qtd Solicitada</th>
                          <th className="p-2.5 font-semibold text-right">Preço Unitário (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cot.items?.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="p-2.5 text-slate-800 font-medium">{item.productDescription}</td>
                            <td className="p-2.5 text-center text-slate-600">{item.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-800">
                              R$ {item.unitPrice ? item.unitPrice.toFixed(2) : '0,00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}