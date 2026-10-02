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
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Economia Certa ERP</p>
          <h1 className="text-2xl font-black mt-2">Criar nova empresa</h1>
          <p className="text-sm text-slate-500 mt-1">Este cadastro cria uma conta empresarial independente.</p>
        </div>
        {error && <p className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs font-bold">Razão social *
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" />
          </label>
          <label className="text-xs font-bold">Nome fantasia
            <input value={form.tradeName} onChange={(e) => update('tradeName', e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" />
          </label>
          <label className="text-xs font-bold">CNPJ
            <input value={form.document} onChange={(e) => update('document', e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" />
          </label>
          <label className="text-xs font-bold">Telefone
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" />
          </label>
        </div>
        <label className="block text-xs font-bold">E-mail de acesso *
          <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" />
        </label>
        <label className="block text-xs font-bold">Senha *
          <input required minLength={6} type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" />
        </label>
        <button disabled={loading} className="w-full rounded-xl bg-indigo-600 text-white py-3 font-black disabled:opacity-50">
          {loading ? 'A criar empresa...' : 'Criar empresa e aceder'}
        </button>
        <p className="text-center text-sm text-slate-500">Já possui acesso? <Link href="/login" className="text-indigo-600 font-bold">Voltar ao login</Link></p>
      </form>
    </main>
  );
}
