'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SupplierRegisterPage() {
  const router = useRouter();
  
  const [representativeName, setRepresentativeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sanitizedEmail = email.trim().toLowerCase();

    if (!representativeName || !sanitizedEmail || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: representativeName.trim(),
          email: sanitizedEmail,
          phone: phone.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError((data as { error?: string }).error || 'Erro ao realizar o cadastro do representante.');
        setLoading(false);
        return;
      }

      if (data.supplier) {
        sessionStorage.setItem('melo_supplier_session', JSON.stringify(data.supplier));
      }

      router.push('/portal/painel');
    } catch (err: unknown) {
      console.error('[Register Error]:', err);
      setError('Ocorreu um erro ao processar o cadastro.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Iluminação Atmosférica Suave e Equilibrada */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Contentor Principal Split-Screen Sofisticado com Animação de Entrada */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Painel Esquerdo: Identidade & Branding */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Economia Certa B2B
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Cadastro de <span className="text-indigo-300">Representante</span>
            </h2>
            <p className="text-xs text-indigo-100/80 font-medium leading-relaxed">
              Crie a sua conta unificada para gerir portfólios de múltiplas marcas, receber cotações e fechar pedidos com lojistas.
            </p>
          </div>

          <div className="pt-8 relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <span>🔒 Arquitetura Multimarcas</span>
              </div>
              <p className="text-[11px] text-indigo-100/70 leading-normal">
                Um único acesso para gerir várias distribuidoras com total isolamento e autonomia no painel.
              </p>
            </div>
          </div>
        </div>

        {/* Painel Direito: Formulário de Cadastro */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-5 bg-white">
          
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Registo de Conta</h1>
            <p className="text-xs text-slate-500 font-medium">Preencha os seus dados de acesso como representante comercial</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl shadow-inner flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">Nome Completo do Representante *</label>
              <input
                type="text"
                required
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                placeholder="Ex: Paulo Melo"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="exemplo@distribuidora.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium lowercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">Senha de Acesso *</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition p-1"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>A processar registo...</span>
                </>
              ) : (
                <span>Concluir Cadastro &rarr;</span>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Já possui uma conta?{' '}
              <Link href="/portal/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition underline underline-offset-4">
                Fazer Login
              </Link>
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}