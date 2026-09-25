'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { uppercaseText } from '@/lib/text';

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

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Máscara de Telefone: (00) 00000-0000 ou (00) 0000-0000
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
      const url = '/api/suppliers';
      const method = editingId ? 'PUT' : 'POST';
      const bodyData = editingId 
        ? { id: editingId, companyId, name, contactPerson, phone, email, password }
        : { companyId, name, contactPerson, phone, email, password };

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
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setEmail(sup.email || '');
    setPassword(''); // Deixa em branco por segurança ao editar
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;

    try {
      const res = await fetch(`/api/suppliers?id=${id}&companyId=${companyId}`, {
        method: 'DELETE',
      });

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
    setContactPerson('');
    setPhone('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">🤝 Gestão de Fornecedores</h1>
            <p className="text-slate-600 text-sm">Melo Perfumaria — Cadastro e controle de distribuidoras.</p>
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

        {/* Formulário de Cadastro / Edição */}
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-bold text-slate-800">
              {editingId ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Cancelar Edição
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome da Empresa / Distribuidora *"
              value={name}
              onChange={(e) => setName(uppercaseText(e.target.value))}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Nome do Representante"
              value={contactPerson}
              onChange={(e) => setContactPerson(uppercaseText(e.target.value))}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Telefone / WhatsApp (DDD + Número)"
              value={phone}
              onChange={handlePhoneChange}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="email"
              placeholder="E-mail de Contato / Login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
            <div className="relative md:col-span-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={editingId ? 'Nova Palavra-passe (deixe em branco para manter)' : 'Palavra-passe para o Portal B2B *'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 text-sm border border-slate-300 rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm focus:outline-none"
                title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={`text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors text-white ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : '+ Cadastrar Fornecedor'}
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
                      <th className="p-3 font-semibold">Representante</th>
                      <th className="p-3 font-semibold">Telefone</th>
                      <th className="p-3 font-semibold">E-mail</th>
                      <th className="p-3 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((sup) => (
                      <tr key={sup.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{sup.name}</td>
                        <td className="p-3 text-slate-600">{sup.contactPerson || '-'}</td>
                        <td className="p-3 text-slate-600">{sup.phone || '-'}</td>
                        <td className="p-3 text-slate-600">{sup.email || '-'}</td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(sup)}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(sup.id)}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Excluir
                          </button>
                        </td>
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