'use client';

import { useState } from 'react';
import { RepresentedCompany } from '@/app/portal/painel/page';

interface BrandPortfolioSectionProps {
  isDarkMode: boolean;
  representedCompanies: RepresentedCompany[];
  activeCompany: RepresentedCompany;
  onSelectCompany: (comp: RepresentedCompany) => void;
  onAddCompany: (comp: Omit<RepresentedCompany, 'id'>) => void;
  onRemoveCompany: (id: string) => void;
}

export function BrandPortfolioSection({
  isDarkMode,
  representedCompanies,
  activeCompany,
  onSelectCompany,
  onAddCompany,
  onRemoveCompany,
}: BrandPortfolioSectionProps) {
  const [isAdding, setIsAdding] = useState(representedCompanies.length === 0);
  const [tradeName, setTradeName] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fetchingCnpj, setFetchingCnpj] = useState(false);

  // Função para formatar e buscar dados automaticamente do CNPJ
  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').substring(0, 14);
    
    // Formatação visual do CNPJ (00.000.000/0001-00)
    let formatted = rawValue;
    if (rawValue.length > 2 && rawValue.length <= 5) {
      formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2)}`;
    } else if (rawValue.length > 5 && rawValue.length <= 8) {
      formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2, 5)}.${rawValue.slice(5)}`;
    } else if (rawValue.length > 8 && rawValue.length <= 12) {
      formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2, 5)}.${rawValue.slice(5, 8)}/${rawValue.slice(8)}`;
    } else if (rawValue.length > 12) {
      formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2, 5)}.${rawValue.slice(5, 8)}/${rawValue.slice(8, 12)}-${rawValue.slice(12)}`;
    }
    setCnpj(formatted);

    // Quando atingir 14 dígitos, busca automaticamente na BrasilAPI
    if (rawValue.length === 14) {
      try {
        setFetchingCnpj(true);
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawValue}`);
        const data = await res.json();

        if (res.ok && !data.message) {
          if (data.nome_fantasia) {
            setTradeName(data.nome_fantasia.toUpperCase());
          } else if (data.razao_social) {
            setTradeName(data.razao_social.split(' ')[0].toUpperCase());
          }

          if (data.razao_social) {
            setCorporateName(data.razao_social);
          }

          if (data.email) {
            setEmail(data.email.toLowerCase());
          }

          if (data.ddd_telefone_1) {
            setPhone(data.ddd_telefone_1);
          }
        }
      } catch (err) {
        console.error('Erro ao consultar CNPJ:', err);
      } finally {
        setFetchingCnpj(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim()) return;

    onAddCompany({
      tradeName: tradeName.trim().toUpperCase(),
      corporateName: corporateName.trim().toUpperCase() || tradeName.trim().toUpperCase(),
      cnpj: cnpj.trim() || '00.000.000/0001-00',
      email: email.trim() || '',
      phone: phone.trim() || '',
    });

    setTradeName('');
    setCorporateName('');
    setCnpj('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  const hasCompanies = representedCompanies.length > 0;

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all space-y-6 ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-500/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-sm">🏢</span>
            <h2 className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">Portfólio de Marcas & Distribuidoras</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Alterne o contexto comercial para gerir o catálogo e cotações de cada distribuidora.</p>
        </div>

        {hasCompanies && (
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <span>{isAdding ? '✕ Cancelar' : '+ Adicionar Distribuidora'}</span>
          </button>
        )}
      </div>

      {/* Estado Inicial Vazio */}
      {!hasCompanies && !isAdding ? (
        <div className={`p-10 rounded-3xl border-2 border-dashed text-center space-y-4 ${
          isDarkMode ? 'border-indigo-500/30 bg-indigo-950/20' : 'border-indigo-200 bg-indigo-50/50'
        }`}>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-600/30">
            🚀
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Bem-vindo ao seu Portal B2B!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Para começar a receber cotações de lojistas e gerir o seu escritório comercial, precisa de registar a sua primeira marca ou distribuidora.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition cursor-pointer active:scale-95 inline-flex items-center gap-2"
          >
            <span>+ Registar a Primeira Distribuidora Agora</span>
          </button>
        </div>
      ) : isAdding ? (
        /* Formulário de Adição com Consulta CNPJ */
        <form onSubmit={handleSubmit} className={`p-6 sm:p-7 rounded-3xl border space-y-4 animate-in fade-in zoom-in-95 duration-300 ${
          isDarkMode ? 'bg-slate-950 border-indigo-500/30 shadow-2xl' : 'bg-slate-50 border-indigo-200 shadow-xl'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <span>{hasCompanies ? 'Registar Nova Marca no Portfólio' : 'Passo 1: Registo da Distribuidora Principal'}</span>
              {fetchingCnpj && (
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full animate-pulse">
                  🔍 A consultar CNPJ na Receita Federal...
                </span>
              )}
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">* Digite o CNPJ para preenchimento automático</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">CNPJ (Busca Automática)</label>
              <input
                type="text"
                placeholder="00.000.000/0001-00"
                value={cnpj}
                onChange={handleCnpjChange}
                className={`w-full px-4 py-3 rounded-2xl border text-xs font-mono font-bold outline-none transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Marca / Nome Fantasia *</label>
              <input
                type="text"
                required
                placeholder="Ex: MARTINS"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border text-xs uppercase font-black outline-none transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Razão Social</label>
              <input
                type="text"
                placeholder="Ex: Martins Comércio S.A."
                value={corporateName}
                onChange={(e) => setCorporateName(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {hasCompanies && (
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-500/10 transition cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-widest transition shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
            >
              Salvar e Ativar Marca &rarr;
            </button>
          </div>
        </form>
      ) : null}

      {/* Grelha de Cartões Executivos */}
      {hasCompanies && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {representedCompanies.map((comp) => {
            const isActive = activeCompany?.id === comp.id;

            return (
              <div
                key={comp.id}
                onClick={() => onSelectCompany(comp)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between group shadow-lg ${
                  isActive
                    ? isDarkMode 
                      ? 'bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-950/40 border-indigo-500 shadow-indigo-950/60 ring-2 ring-indigo-500/50' 
                      : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 border-indigo-500 shadow-indigo-100 ring-2 ring-indigo-500/30'
                    : isDarkMode 
                      ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60' 
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                        isActive 
                          ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50' 
                          : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />}
                        {isActive ? 'Sessão Ativa' : 'Disponível'}
                      </span>
                      <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white mt-1.5">{comp.tradeName}</h3>
                    </div>

                    {representedCompanies.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCompany(comp.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remover distribuidora"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <p className="truncate">{comp.corporateName}</p>
                    <p className="font-mono text-[11px] opacity-80">CNPJ: {comp.cnpj || 'Não inf.'}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-500/10 flex justify-between items-center text-[11px]">
                  <span className="font-mono text-slate-400 font-semibold">{comp.phone || 'Sem telefone'}</span>
                  <span className={`font-black uppercase tracking-wider transition ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}>
                    {isActive ? 'A Negociar ✓' : 'Ativar Marca →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}