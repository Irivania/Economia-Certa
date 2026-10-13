'use client';

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { getCompanyId } from '@/lib/companySession';

const subscribeToHydration = () => () => {};

export default function CompanySettingsPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  const [companyId] = useState<string>(() => getCompanyId());

  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [type, setType] = useState('Matriz / Loja Principal');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === 'Escape') {
      setIsCmdOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCepChange = useCallback(async (rawInput: string) => {
    const cleanCep = rawInput.replace(/\D/g, '');
    setCep(rawInput);

    if (cleanCep.length === 8) {
      setFetchingCep(true);
      try {
        const res = await fetch(`/api/proxy/cnpj?cep=${cleanCep}`);
        if (res.ok) {
          const data = await res.json();
          if (data.street) setAddress(data.street);
          if (data.neighborhood) setNeighborhood(data.neighborhood);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);

          setToast('📍 Endereço preenchido pelo CEP!');
          setTimeout(() => setToast(null), 4000);
        } else {
          setToast('⚠ CEP não encontrado.');
          setTimeout(() => setToast(null), 4000);
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      } finally {
        setFetchingCep(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!companyId) {
      router.replace('/login');
      return;
    }

    async function loadCompany() {
      try {
        const res = await fetch(`/api/company?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setTradeName(data.tradeName || '');
          setDocument(data.document || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setCep(data.cep || '');
          setAddress(data.address || '');
          setNumber(data.number || '');
          setNeighborhood(data.neighborhood || '');
          setCity(data.city || '');
          setState(data.state || '');
          setType(data.type || 'Matriz');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, [companyId, router]);

  const handleCnpjChange = async (rawInput: string) => {
    const cleanCnpj = rawInput.replace(/\D/g, '');
    setDocument(rawInput);

    if (cleanCnpj.length === 14) {
      setFetchingCnpj(true);
      try {
        const res = await fetch(`/api/proxy/cnpj?cnpj=${cleanCnpj}`);
        if (res.ok) {
          const data = await res.json();
          if (data.razao_social) setName(data.razao_social);
          if (data.nome_fantasia) setTradeName(data.nome_fantasia);
          if (data.email) setEmail(data.email);
          if (data.ddd_telefone_1) setPhone(data.ddd_telefone_1);
          if (data.cep) {
            setCep(data.cep);
            void handleCepChange(String(data.cep));
          }
          if (data.logradouro) setAddress(data.logradouro);
          if (data.numero) setNumber(data.numero);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.municipio) setCity(data.municipio);
          if (data.uf) setState(data.uf);

          setToast('✨ Dados corporativos preenchidos via Receita Federal!');
          setTimeout(() => setToast(null), 4000);
        } else {
          setToast('⚠ CNPJ não encontrado. Preencha manualmente.');
          setTimeout(() => setToast(null), 4000);
        }
      } catch (err) {
        console.error('Erro ao consultar CNPJ:', err);
        setToast('⚠ Erro ao consultar CNPJ.');
        setTimeout(() => setToast(null), 4000);
      } finally {
        setFetchingCnpj(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSaving(true);
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId, 
          name, 
          tradeName, 
          document, 
          email, 
          phone, 
          cep, 
          address, 
          number, 
          neighborhood, 
          city, 
          state, 
          type 
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setToast('✅ Cadastro da empresa atualizado com sucesso! A retornar ao painel...');
      
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err) {
      console.error(err);
      setToast('❌ Erro ao atualizar dados da empresa.');
      setTimeout(() => setToast(null), 4000);
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader 
        title="Economia Certa" 
        subtitle="Gestão completa de dados cadastrais, fiscais e morada." 
        onOpenCmd={() => setIsCmdOpen(true)} 
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        <div className={`p-6 sm:p-7 rounded-xl shadow-xs border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
          {loading ? (
            <div className="py-20 text-center text-xs font-medium text-slate-500">A carregar dados corporativos...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  1. Informações Corporativas e Fiscais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      CNPJ {fetchingCnpj && <span className="text-indigo-500 animate-pulse font-normal">| Buscando...</span>}
                    </label>
                    <input
                      type="text"
                      value={document}
                      onChange={(e) => void handleCnpjChange(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                      className={`w-full p-2.5 text-xs font-mono font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Nome Fantasia (Marca)</label>
                    <input
                      type="text"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="Ex: Melo Perfumaria"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Unidade</label>
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="Matriz ou Filial"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Razão Social</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  2. Canais de Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@sualoja.com.br"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  3. Endereço Comercial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      CEP {fetchingCep && <span className="text-indigo-500 animate-pulse font-normal">| Buscando...</span>}
                    </label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => void handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className={`w-full p-2.5 text-xs font-mono font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Logradouro (Rua, Avenida...)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Rua das Flores"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Número</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Cidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className={`w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Estado (UF)</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Ex: SP"
                      maxLength={2}
                      className={`w-full p-2.5 text-xs font-mono font-bold rounded-lg border outline-none transition uppercase shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className={`px-4 py-2.5 font-semibold rounded-lg text-xs border transition cursor-pointer shadow-xs ${isDarkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                >
                  &larr; Voltar ao Dashboard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? 'A salvar alterações...' : 'Salvar Cadastro Completo'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold z-50">
          {toast}
        </div>
      )}

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId="" />
    </div>
  );
}