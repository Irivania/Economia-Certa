'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', tradeName: '', document: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json() as { error?: string; user?: Record<string, string>; company?: Record<string, string> };
      if (!response.ok || !data.user || !data.company) {
        setError(data.error || 'Não foi possível criar a empresa.');
        return;
      }
      sessionStorage.setItem('melo_company_session', JSON.stringify({
        ...data.user,
        name: data.company.name,
        tradeName: data.company.tradeName || '',
      }));
      router.replace('/');
    } catch {
      setError('Não foi possível contactar o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-slate-900">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
        <div>
          <span className="inline-flex rounded-md bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-500/20 mb-2">
            Economia Certa ERP
          </span>
          <h1 className="text-lg md:text-xl font-bold tracking-tight">Criar nova empresa</h1>
          <p className="text-xs text-slate-500 mt-0.5">Este cadastro cria uma conta empresarial independente.</p>
        </div>

        {error && <p className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">{error}</p>}
        
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs font-bold text-slate-700">Razão social *
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs" />
          </label>
          <label className="text-xs font-bold text-slate-700">Nome fantasia
            <input value={form.tradeName} onChange={(e) => update('tradeName', e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs" />
          </label>
          <label className="text-xs font-bold text-slate-700">CNPJ
            <input value={form.document} onChange={(e) => update('document', e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs" />
          </label>
          <label className="text-xs font-bold text-slate-700">Telefone
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs" />
          </label>
        </div>

        <label className="block text-xs font-bold text-slate-700">E-mail de acesso *
          <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs" />
        </label>

        <label className="block text-xs font-bold text-slate-700">Senha *
          <input required minLength={6} type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-mono tracking-widest focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs" />
        </label>

        <button disabled={loading} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition shadow-xs cursor-pointer">
          {loading ? 'A criar empresa...' : 'Criar empresa e aceder'}
        </button>

        <p className="text-center text-xs text-slate-500">Já possui acesso? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Voltar ao login</Link></p>
      </form>
    </main>
  );
}