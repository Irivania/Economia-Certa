'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

interface PartnerItem {
  id: string;
  type: 'EMPLOYEE' | 'COMPANY_PARTNER';
  name: string;
  document: string | null;
  phone: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  companyPartnerId: string | null;
  active: boolean;
}

type RegistrationMode = 'COMPANY_PARTNER' | 'EMPLOYEE';

export default function ConveniosPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);

  // Form state
  const [mode, setMode] = useState<RegistrationMode>('COMPANY_PARTNER');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('500');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const loadPartners = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/partners?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPartners(data);
      }
    } catch (err) {
      console.error('Erro ao carregar parceiros:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchPartnersData() {
      if (!companyId) return;
      try {
        const res = await apiFetch(`/api/partners?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) setPartners(data);
        }
      } catch (err) {
        console.error('Erro ao carregar parceiros:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPartnersData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  // Função para buscar automaticamente dados do CNPJ
  const handleFetchCnpj = async (cnpjValue: string) => {
    const clean = cnpjValue.replace(/\D/g, '');
    if (clean.length !== 14) return;

    try {
      setFetchingCnpj(true);
      // Utiliza a rota de CNPJ integrada do ERP ou consome diretamente a BrasilAPI
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (data.razao_social || data.nome_fantasia) {
          setName(data.razao_social || data.nome_fantasia);
        }
        if (data.ddd_telefone_1) {
          setPhone(data.ddd_telefone_1);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar CNPJ automático:', err);
    } finally {
      setFetchingCnpj(false);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O nome ou razão social é obrigatório.');
      return;
    }

    if (mode === 'EMPLOYEE' && !selectedCompanyId) {
      alert('Selecione a Empresa Parceira à qual este funcionário pertence.');
      return;
    }

    try {
      const res = await apiFetch('/api/partners', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          type: mode,
          name,
          document,
          phone,
          creditLimit,
          discountPercentage,
          companyPartnerId: mode === 'EMPLOYEE' ? selectedCompanyId : null,
        }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar.');

      setName('');
      setDocument('');
      setPhone('');
      setCreditLimit('500');
      setDiscountPercentage('0');
      setSelectedCompanyId('');
      await loadPartners();
      alert(mode === 'COMPANY_PARTNER' ? 'Empresa parceira cadastrada com sucesso!' : 'Funcionário vinculado cadastrado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Não foi possível realizar o cadastro.');
    }
  };

  const companyPartners = partners.filter((p) => p.type === 'COMPANY_PARTNER');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Gestão de Convênios & Empresas Parceiras"
        subtitle="Controle de faturamento corporativo, empresas e funcionários vinculados."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div>
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Cadastro Hierárquico */}
          <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Novo Cadastro de Convênio</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode('COMPANY_PARTNER')}
                className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl border transition cursor-pointer ${
                  mode === 'COMPANY_PARTNER'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-500/10 border-slate-500/20 opacity-70'
                }`}
              >
                🏢 Empresa Parceira
              </button>
              <button
                type="button"
                onClick={() => setMode('EMPLOYEE')}
                className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl border transition cursor-pointer ${
                  mode === 'EMPLOYEE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-500/10 border-slate-500/20 opacity-70'
                }`}
              >
                👤 Funcionário
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              {mode === 'EMPLOYEE' && (
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                  <label className="block font-bold text-indigo-600 dark:text-indigo-400">Empresa Parceira Vinculada *</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-950 font-bold font-mono text-xs"
                    required
                  >
                    <option value="">-- Selecionar Empresa Mãe --</option>
                    {companyPartners.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        🏢 {comp.name} ({comp.document || 'Sem CNPJ'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'COMPANY_PARTNER' && (
                <div>
                  <label className="block font-bold mb-1 opacity-80">CNPJ (Busca Automática)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      onBlur={(e) => handleFetchCnpj(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono"
                    />
                    {fetchingCnpj && (
                      <span className="absolute right-3 top-2.5 text-[10px] text-indigo-600 font-bold animate-pulse">
                        A consultar...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {mode === 'EMPLOYEE' && (
                <div>
                  <label className="block font-bold mb-1 opacity-80">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold mb-1 opacity-80">
                  {mode === 'COMPANY_PARTNER' ? 'Razão Social da Empresa' : 'Nome Completo do Funcionário'}
                </label>
                <input
                  type="text"
                  placeholder={mode === 'COMPANY_PARTNER' ? 'Ex: Empresa XYZ Ltda' : 'Ex: João da Silva'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 uppercase"
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
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 opacity-80">Limite Crédito (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 opacity-80">Desconto (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
              >
                {mode === 'COMPANY_PARTNER' ? 'Cadastrar Empresa Parceira 🏢' : 'Cadastrar Funcionário 👤'}
              </button>
            </form>
          </div>

          {/* Listagem Hierárquica */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Empresas Parceiras & Funcionários Vinculados</h3>

            {loading ? (
              <p className="text-center py-12 text-xs opacity-50">Carregando convênios...</p>
            ) : partners.length === 0 ? (
              <p className="text-center py-12 text-xs opacity-50">Nenhum convênio cadastrado.</p>
            ) : (
              <div className="space-y-6">
                {companyPartners.map((comp) => {
                  const employees = partners.filter((p) => p.companyPartnerId === comp.id);
                  const compDebt = Number(comp.currentBalance || 0);
                  const compLimit = Number(comp.creditLimit || 0);

                  return (
                    <div key={comp.id} className="p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-500/10 pb-3">
                        <div>
                          <div className="font-extrabold text-sm flex items-center gap-2">
                            <span>🏢</span> {comp.name}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-mono">Empresa Parceira</span>
                          </div>
                          <div className="text-[11px] opacity-60 font-mono mt-0.5">
                            CNPJ: {comp.document || 'Não informado'} • Tel: {comp.phone || 'N/A'} • Desconto: {Number(comp.discountPercentage)}%
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-[10px] opacity-60 uppercase font-bold">Limite / Saldo Devedor</div>
                          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            R$ {compDebt.toFixed(2)} / <span className="opacity-70">R$ {compLimit.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pl-4 sm:pl-6 space-y-2">
                        <div className="text-[11px] font-black uppercase tracking-wider opacity-50">
                          Funcionários Vinculados ({employees.length})
                        </div>

                        {employees.length === 0 ? (
                          <p className="text-xs italic opacity-40">Nenhum funcionário cadastrado nesta empresa ainda.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {employees.map((emp) => {
                              const empDebt = Number(emp.currentBalance || 0);
                              const empLimit = Number(emp.creditLimit || 0);
                              return (
                                <div key={emp.id} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex justify-between items-center text-xs`}>
                                  <div>
                                    <div className="font-bold flex items-center gap-1.5">
                                      <span>👤</span> {emp.name}
                                    </div>
                                    <div className="text-[10px] opacity-60 font-mono">CPF: {emp.document || 'N/A'}</div>
                                  </div>
                                  <div className="text-right font-mono">
                                    <div className="font-bold">R$ {empDebt.toFixed(2)}</div>
                                    <div className="text-[10px] opacity-50">Lim: R$ {empLimit.toFixed(2)}</div>
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
        </div>
      </main>
    </div>
  );
}