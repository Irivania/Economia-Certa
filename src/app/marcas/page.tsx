'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { uppercaseText } from '@/lib/text';

interface Brand {
  id: string;
  name: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UUID real da Melo Perfumaria
  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/brands?companyId=${companyId}`);
      if (!res.ok) throw new Error('Erro ao carregar marcas');
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      setError('Não foi possível carregar as marcas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        const res = await fetch(`/api/brands?companyId=${companyId}`);
        if (!res.ok) throw new Error('Erro ao carregar marcas');
        const data = await res.json();
        if (isMounted) setBrands(data);
      } catch (err) {
        if (isMounted) setError('Não foi possível carregar as marcas.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome da marca.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, name }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar marca');

      setName('');
      showToast('Marca cadastrada com sucesso!');
      loadBrands();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar marca.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">🏢 Gestão de Marcas</h1>
            <p className="text-slate-600 text-xs sm:text-sm">Melo Perfumaria - Padronização de fabricantes e marcas.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold">
              &larr; Dashboard
            </Link>
            <Link href="/produtos" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-semibold">
              Produtos &rarr;
            </Link>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-8">
          <h2 className="text-sm font-bold text-slate-800 mb-3">➕ Nova Marca</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome da Marca (Ex: Chanel, Natura, Boticário...)"
              value={name}
              onChange={(e) => setName(uppercaseText(e.target.value))}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Adicionar Marca'}
            </button>
          </form>
        </div>

        {/* Listagem */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4">Marcas Cadastradas ({brands.length})</h2>
          
          {loading ? (
            <p className="text-slate-500 text-center py-8 text-xs">Carregando marcas...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-xs">{error}</div>
          ) : brands.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-400 text-xs">Nenhuma marca cadastrada ainda.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="p-3 font-semibold">Nome da Marca</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{brand.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-lg text-xs sm:text-sm font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}