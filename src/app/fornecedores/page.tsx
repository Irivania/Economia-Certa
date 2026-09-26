'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { uppercaseText } from '@/lib/text';

interface Supplier {
  id: string;
  name: string;
  cnpj?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
}

export default function SuppliersPage() {
  const { isDarkMode, mounted, themeColor } = useTheme();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchingCep, setFetchingCep] = useState(false);

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';
  const latestQuotationId = 'd7f46ae7-19c2-409d-8ab4-dfbb458c5248';

  const themeButtonStyles = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25',
    'emerald-light': 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25',
    'blue-light': 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
    'purple-light': 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
  }[themeColor];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').substring(0, 8);
    let formatted = rawValue;
    if (rawValue.length > 5) {
      formatted = `${rawValue.slice(0, 5)}-${rawValue.slice(5)}`;
    }
    setCep(formatted);

    if (rawValue.length === 8) {
      try {
        setFetchingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const fullAddress = `${data.logradouro}, Bairro: ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setAddress(uppercaseText(fullAddress));
          showToast('Endereço localizado via CEP com sucesso!');
        } else {
          alert('CEP não encontrado.');
        }
      } catch {
        console.error('Erro ao buscar CEP.');
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 14);
    let formatted = value;
    if (value.length > 2 && value.length <= 5) {
      formatted = `${value.slice(0, 2)}.${value.slice(2)}`;
    } else if (value.length > 5 && value.length <= 8) {
      formatted = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`;
    } else if (value.length > 8 && value.length <= 12) {
      formatted = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8)}`;
    } else if (value.length > 12) {
      formatted = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12)}`;
    }
    setCnpj(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 11);
    let formatted = value;
    if (value.length > 2 && value.length <= 6) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 6 && value.length <= 10) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 10) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 0) {
      formatted = `(${value}`;
    }
    setPhone(formatted);
  };

  const refreshSuppliers = useCallback(async () => {
    try {
      const res = await fetch(`/api/suppliers?companyId=${companyId}`);
      if (!res.ok) throw new Error('Erro ao carregar fornecedores.');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Não foi possível buscar os fornecedores.');
      console.error(err);
    }
  }, [companyId]);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const res = await fetch(`/api/suppliers?companyId=${companyId}`);
        if (!res.ok) throw new Error('Erro ao carregar fornecedores.');
        const data = await res.json();
        if (isMounted) {
          setSuppliers(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError('Não foi possível buscar os fornecedores.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInitialData();
    return () => { isMounted = false; };
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O nome do fornecedor é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/suppliers';
      const method = editingId ? 'PUT' : 'POST';
      const bodyData = editingId 
        ? { id: editingId, companyId, name, cnpj, address, contactPerson, phone, email, password }
        : { companyId, name, cnpj, address, contactPerson, phone, email, password };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar fornecedor.');
      }

      resetForm();
      showToast(editingId ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!');
      await refreshSuppliers();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro ao salvar fornecedor.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sup: Supplier) => {
    setEditingId(sup.id);
    setName(sup.name);
    setCnpj(sup.cnpj || '');
    setAddress(sup.address || '');
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setEmail(sup.email || '');
    setPassword('');
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;
    try {
      const res = await fetch(`/api/suppliers?id=${id}&companyId=${companyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir fornecedor.');
      showToast('Fornecedor excluído com sucesso!');
      await refreshSuppliers();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o fornecedor.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCnpj('');
    setCep('');
    setAddress('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.cnpj && s.cnpj.includes(searchTerm)) ||
    (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Gestão de Fornecedores"
        subtitle="Melo Perfumaria — Diretório avançado de parceiros B2B."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        
        <SupplierForm
          editingId={editingId}
          name={name}
          setName={setName}
          cnpj={cnpj}
          handleCnpjChange={handleCnpjChange}
          cep={cep}
          handleCepChange={handleCepChange}
          fetchingCep={fetchingCep}
          address={address}
          setAddress={setAddress}
          contactPerson={contactPerson}
          setContactPerson={setContactPerson}
          phone={phone}
          handlePhoneChange={handlePhoneChange}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          submitting={submitting}
          onSubmit={handleSubmit}
          onReset={resetForm}
          isDarkMode={isDarkMode}
          themeButtonStyles={themeButtonStyles}
        />

        <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-500/10">
            <div>
              <h2 className="text-base font-black tracking-tight">Diretório de Fornecedores</h2>
              <p className="text-xs opacity-60 mt-0.5">Gestão centralizada de canais ativos na Melo Perfumaria.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Pesquisar fornecedor ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 text-xs border rounded-xl outline-none w-full sm:w-64 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
              <span className="text-xs font-mono font-bold opacity-70 bg-slate-500/10 px-3 py-2 rounded-xl whitespace-nowrap">
                {filteredSuppliers.length} ativos
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-16 opacity-60 text-xs font-medium">A carregar diretório de parceiros...</p>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-semibold">{error}</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-500/20 rounded-3xl">
              <p className="opacity-60 text-xs font-medium">Nenhum fornecedor encontrado com os critérios informados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.map((sup) => (
                <SupplierCard
                  key={sup.id}
                  supplier={sup}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDarkMode={isDarkMode}
                  themeColor={themeColor}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold transition-all z-50">
          {toastMessage}
        </div>
      )}

      <CommandMenu 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        isDarkMode={isDarkMode} 
        latestQuotationId={latestQuotationId} 
      />

    </div>
  );
}