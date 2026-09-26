'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SupplierLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar login.');
      }

      sessionStorage.setItem('melo_supplier_session', JSON.stringify(data.supplier));
      router.push('/portal/painel');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Credenciais inválidas.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Economia Certa B2B</p>
          <h1 className="text-2xl font-bold text-slate-900">Portal do Fornecedor</h1>
          <p className="text-sm text-slate-500">Entre com sua conta para gerenciar cotações</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">E-mail de Acesso</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@distribuidora.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Palavra-passe (Senha)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs focus:outline-none cursor-pointer"
                title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'A entrar...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="space-y-2 text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Ainda não tem conta?{' '}
            <Link href="/portal/cadastro" className="text-indigo-600 font-semibold hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition">
              ← Voltar para a página principal
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}