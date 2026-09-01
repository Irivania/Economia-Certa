'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Função para recarregar os dados após o cadastro
  const refreshSuppliers = async () => {
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
  };

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
        if (isMounted) {
          setError('Não foi possível buscar os fornecedores.');
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O nome do fornecedor é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, name, contactPerson, phone, email }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar fornecedor.');

      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      showToast('Fornecedor cadastrado com sucesso!');
      await refreshSuppliers();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar fornecedor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">🤝 Gestão de Fornecedores</h1>
            <p className="text-slate-600 text-sm">Melo Perfumaria — Cadastro de distribuidoras e representantes.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors">
              &larr; Dashboard
            </Link>
            <Link href="/cotacoes" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
              Ir para Cotações &rarr;
            </Link>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="text-md font-bold text-slate-800 mb-3">Cadastrar Novo Fornecedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome da Empresa / Distribuidora *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Nome do Representante / Contato"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Telefone / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="email"
              placeholder="E-mail de Contato"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : '+ Cadastrar Fornecedor'}
            </button>
          </div>
        </form>

        {/* Tabela de Fornecedores */}
        {loading ? (
          <p className="text-slate-500 text-center py-10">Carregando fornecedores...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Fornecedores Cadastrados</h2>
            {suppliers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-slate-400 text-sm">Nenhum fornecedor cadastrado ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-3 font-semibold">Fornecedor</th>
                      <th className="p-3 font-semibold">Contato / Representante</th>
                      <th className="p-3 font-semibold">Telefone</th>
                      <th className="p-3 font-semibold">E-mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((sup) => (
                      <tr key={sup.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{sup.name}</td>
                        <td className="p-3 text-slate-600">{sup.contactPerson || '-'}</td>
                        <td className="p-3 text-slate-600">{sup.phone || '-'}</td>
                        <td className="p-3 text-slate-600">{sup.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}