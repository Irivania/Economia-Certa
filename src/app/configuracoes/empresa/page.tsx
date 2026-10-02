'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
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

  const handleCepChange = async (rawInput: string) => {
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
      
      // Redireciona automaticamente para o Dashboard após 1.5 segundos
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
        title="Configurações da Empresa" 
        subtitle="Gestão completa de dados cadastrais, fiscais e morada." 
        onOpenCmd={() => {}} 
      />

      <main className="max-w-5xl mx-auto px-6 mt-10 pb-20">
        <div className={`p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          {loading ? (
            <div className="py-20 text-center text-xs opacity-60">A carregar dados corporativos...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500 border-b border-indigo-500/20 pb-2">
                  1. Informações Corporativas e Fiscais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">
                      CNPJ {fetchingCnpj && <span className="text-indigo-500 animate-pulse font-normal">| Buscando...</span>}
                    </label>
                    <input
                      type="text"
                      value={document}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                      className={`w-full p-3.5 text-xs font-mono font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Nome Fantasia (Marca)</label>
                    <input
                      type="text"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="Ex: Melo Perfumaria"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Tipo de Unidade</label>
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="Matriz ou Filial"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-3">
                    <label className="block text-xs font-bold opacity-80">Razão Social</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500 border-b border-indigo-500/20 pb-2">
                  2. Canais de Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@sualoja.com.br"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500 border-b border-indigo-500/20 pb-2">
                  3. Endereço Comercial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">
                      CEP {fetchingCep && <span className="text-indigo-500 animate-pulse font-normal">| Buscando...</span>}
                    </label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className={`w-full p-3.5 text-xs font-mono font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-xs font-bold opacity-80">Logradouro (Rua, Avenida...)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Rua das Flores"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Número</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Cidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className={`w-full p-3.5 text-xs font-bold rounded-2xl border outline-none transition ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold opacity-80">Estado (UF)</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Ex: SP"
                      maxLength={2}
                      className={`w-full p-3.5 text-xs font-mono font-bold rounded-2xl border outline-none transition uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-500/20">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className={`px-6 py-3 font-bold rounded-2xl text-xs border transition cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
                >
                  ← Voltar ao Dashboard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-9 py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {saving ? 'A salvar alterações...' : 'Salvar Cadastro Completo'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-extrabold z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}