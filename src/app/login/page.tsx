'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para o modal de Recuperação de Senha
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Estados para o Modal de Troca Obrigatória de Senha (Primeiro Acesso)
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [tempUserId, setTempUserId] = useState('');

  // Validação básica de formato de e-mail por Regex
  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedEmail || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setError('Por favor, insira um formato de e-mail válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (data as { error?: string }).error ||
            'Credenciais inválidas ou acesso corporativo negado.',
        );
      }

      // Verifica se o colaborador precisa de alterar a senha no primeiro acesso
      if (data.mustChangePassword) {
        setTempUserId(data.session.userId);
        setMustChangePassword(true);
        setLoading(false);
        return;
      }

      if (data.session) {
        sessionStorage.setItem(
          'melo_company_session',
          JSON.stringify(data.session),
        );
      }
      router.push('/');
    } catch (err: unknown) {
      console.error('[Company Auth Security Error]:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao processar a autenticação.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedForgotEmail = forgotEmail.trim().toLowerCase();

    if (!isValidEmail(sanitizedForgotEmail)) {
      alert('Insira um e-mail válido para recuperação.');
      return;
    }

    setForgotSent(true);

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedForgotEmail }),
      });
    } catch (err) {
      console.error('Erro ao solicitar recuperação:', err);
    } finally {
      setTimeout(() => {
        setForgotSent(false);
        setIsForgotOpen(false);
        setForgotEmail('');
        alert(
          'Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas.',
        );
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Iluminação Atmosférica */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Contentor Principal */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Painel Esquerdo */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Economia Certa ERP
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Economia Certa <span className="text-indigo-300">ERP</span>
            </h2>
            <p className="text-xs text-indigo-100/80 font-medium leading-relaxed">
              Módulo exclusivo de gestão de inventário, margens estratégicas e
              disparo de cotações inteligentes para fornecedores.
            </p>
          </div>

          <div className="pt-8 relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <span>⚡ Automação e Controle B2B</span>
              </div>
              <p className="text-[11px] text-indigo-100/70 leading-normal">
                Centralize suas ordens de compra e compare propostas em tempo
                real com total segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Painel Direito */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Acesso Administrativo
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Entre com as credenciais da sua empresa ou colaborador
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-4 rounded-2xl shadow-inner flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setError(
                'Login com Google ainda não está configurado. Utilize o e-mail corporativo.',
              )
            }
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com o Google Workspace</span>
          </button>

          <div className="flex items-center my-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              ou e-mail corporativo
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                E-mail Corporativo
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition p-1"
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
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>A autenticar...</span>
                </>
              ) : (
                <span>Aceder ao Painel Gerencial &rarr;</span>
              )}
            </button>
          </form>

          {/* Links Inferiores */}
          <div className="space-y-2 text-center pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Ainda não possui uma conta empresarial?{' '}
              <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition underline underline-offset-4">
                Criar nova empresa
              </Link>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Procura o portal de distribuidores?{' '}
              <Link href="/portal/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition underline underline-offset-4">
                Aceder como Fornecedor
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 🔒 Modal Modularizado de Troca Obrigatória de Senha */}
      <ChangePasswordModal
        isOpen={mustChangePassword}
        userId={tempUserId}
        tempPasswordUsed={password}
        onSuccess={() => {
          setMustChangePassword(false);
          setPassword('');
        }}
      />

      {/* Modal de Recuperação de Senha */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Recuperação de Acesso
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enviaremos um link de redefinição para o seu e-mail.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="nome@empresa.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {forgotSent ? 'A enviar...' : 'Enviar Instruções'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}