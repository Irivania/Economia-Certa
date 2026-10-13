'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { uppercaseText } from '@/lib/text';
import { getCompanyId } from '@/lib/companySession';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const companyId = getCompanyId();

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categories?companyId=${companyId}`);
      if (!res.ok) throw new Error('Erro ao carregar categorias');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError('Não foi possível carregar as categorias.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        const res = await fetch(`/api/categories?companyId=${companyId}`);
        if (!res.ok) throw new Error('Erro ao carregar categorias');
        const data = await res.json();
        if (isMounted) setCategories(data);
      } catch (err) {
        if (isMounted) setError('Não foi possível carregar as categorias.');
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
      alert('Informe o nome da categoria.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, name }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar categoria');

      setName('');
      showToast('Categoria cadastrada com sucesso!');
      loadCategories();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLOBAL UNIFICADO */}
      <AppHeader
        title="Economia Certa"
        subtitle="Painel gerencial inteligente e controle de compras em tempo real."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        
        {/* Cartão Principal */}
        <div className={`rounded-xl border p-6 sm:p-7 shadow-xs transition-all space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="inline-flex rounded-md bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
                🏷️ Gestão de Categorias
              </span>
              <h1 className="text-base md:text-lg font-bold tracking-tight">Padronização de departamentos e setores</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Organize o catálogo de produtos de forma estruturada.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link href="/" className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400">
                &larr; Dashboard
              </Link>
              <Link href="/produtos" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-2 rounded-lg border border-indigo-500/20 transition hover:bg-indigo-500/20">
                Produtos &rarr;
              </Link>
            </div>
          </div>

          {/* Formulário de Cadastro */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">➕ Nova Categoria</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder="Nome da Categoria (Ex: Cosméticos, Perfumaria...)"
                value={name}
                onChange={(e) => setName(uppercaseText(e.target.value))}
                className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-xs"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {submitting ? 'Salvando...' : 'Adicionar Categoria'}
              </button>
            </form>
          </div>

          {/* Listagem */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Categorias Cadastradas</h2>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">{categories.length} item(ns)</span>
            </div>
            
            {loading ? (
              <p className="text-slate-400 text-center py-8 text-xs font-medium">Carregando categorias...</p>
            ) : error ? (
              <div className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-xs font-semibold">{error}</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-400 text-xs font-medium">Nenhuma categoria cadastrada ainda.</p>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] font-bold tracking-wider">
                      <th className="px-4 py-3">Nome da Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categories.map((cat, index) => (
                      <tr key={`${cat.id}-${index}`} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-middle">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{cat.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold transition-all z-50">
          {toastMessage}
        </div>
      )}

      {/* MENU DE COMANDOS */}
      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId="" />

    </div>
  );
}