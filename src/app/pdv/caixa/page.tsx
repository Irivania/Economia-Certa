'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { DollarSign, ArrowDownRight, ArrowUpRight, Lock, Unlock, ShieldAlert, Coffee, Play, ShoppingCart } from 'lucide-react';

interface CashRegister {
  id: string;
  operatorName: string;
  openingAmount: string;
  status: 'OPEN' | 'PAUSED' | 'CLOSED';
}

interface RegisterStatus {
  isOpen: boolean;
  isPaused?: boolean;
  register?: CashRegister;
  salesCount?: number;
}

export default function CashRegisterPage() {
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [loading, setLoading] = useState(true);
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus | null>(null);
  
  const [rawValue, setRawValue] = useState(0);
  const [displayValue, setDisplayValue] = useState('');
  
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState<'OPEN' | 'SUPPLY' | 'BLEED' | 'CLOSE'>('OPEN');

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!companyId) return;
      try {
        const res = await fetch(`/api/pdv/register?companyId=${companyId}`);
        const data = await res.json();
        if (isMounted) {
          setRegisterStatus({
            isOpen: data.isOpen,
            isPaused: data.register?.status === 'PAUSED',
            register: data.register,
            salesCount: data.salesCount,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numberValue = Number(value) / 100;
    
    setRawValue(numberValue);
    setDisplayValue(
      numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    );
  };

  const handleTogglePause = async (pauseState: boolean) => {
    try {
      const res = await fetch('/api/pdv/register/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, pause: pauseState }),
      });
      const data = await res.json();
      if (data.success) {
        alert(pauseState ? '☕ Caixa pausado para intervalo!' : '⚡ Caixa retornado com sucesso!');
        setLoading(true);
        const statusRes = await fetch(`/api/pdv/register?companyId=${companyId}`);
        const statusData = await statusRes.json();
        setRegisterStatus({
          isOpen: statusData.isOpen,
          isPaused: statusData.register?.status === 'PAUSED',
          register: statusData.register,
          salesCount: statusData.salesCount,
        });
        setLoading(false);
      } else {
        alert(data.error || 'Erro ao alterar estado de pausa.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawValue <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        companyId,
        action: registerStatus?.isOpen ? actionType : 'OPEN',
        operatorName: registerStatus?.register?.operatorName || 'Operador de Caixa',
      };

      if (registerStatus?.isOpen && actionType === 'CLOSE') {
        payload.closingAmount = rawValue;
      } else {
        payload.amount = rawValue;
        payload.reason = reason;
      }

      const res = await fetch('/api/pdv/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert('Operação de caixa realizada com sucesso!');
        setRawValue(0);
        setDisplayValue('');
        setReason('');
        setLoading(true);

        const statusRes = await fetch(`/api/pdv/register?companyId=${companyId}`);
        const statusData = await statusRes.json();
        setRegisterStatus({
          isOpen: statusData.isOpen,
          isPaused: statusData.register?.status === 'PAUSED',
          register: statusData.register,
          salesCount: statusData.salesCount,
        });
        setLoading(false);
      } else {
        alert(data.error || 'Erro ao processar operação.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <p className="text-xs font-bold animate-pulse">A carregar dados do turno...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Gestão de Turno & Pausas do Caixa"
        subtitle="Abertura, controlo de intervalos, sangrias de segurança e fecho cego."
        onOpenCmd={() => {}}
      />

      <main className="max-w-4xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          {registerStatus?.isOpen && !registerStatus.isPaused && (
            <Link href="/pdv" className="font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2 transition">
              <ShoppingCart className="w-4 h-4" /> Ir para Frente de Caixa (PDV) &rarr;
            </Link>
          )}
        </div>

        {/* Estado Atual do Turno */}
        <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Estado do Turno</h3>
                <p className="text-xs opacity-60">Controlo de operador e pausas.</p>
              </div>
            </div>

            {registerStatus?.isOpen ? (
              registerStatus.isPaused ? (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full flex items-center gap-1.5 text-xs font-extrabold uppercase">
                  <Coffee className="w-3.5 h-3.5 animate-bounce" /> PAUSADO (ALMOÇO/CAFÉ)
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full flex items-center gap-1.5 text-xs font-extrabold uppercase">
                  <Unlock className="w-3.5 h-3.5" /> ABERTO & ATIVO
                </span>
              )
            ) : (
              <span className="px-3 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full flex items-center gap-1.5 text-xs font-extrabold uppercase">
                <Lock className="w-3.5 h-3.5" /> FECHADO
              </span>
            )}
          </div>

          {registerStatus?.isOpen && registerStatus.register && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-500/10 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
                  <span className="font-sans opacity-60 block">Operador Responsável:</span>
                  <span className="font-bold text-sm">{registerStatus.register.operatorName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
                  <span className="font-sans opacity-60 block">Fundo de Abertura:</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">R$ {Number(registerStatus.register.openingAmount).toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
                  <span className="font-sans opacity-60 block">Vendas no Turno:</span>
                  <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{registerStatus.salesCount || 0} vendas</span>
                </div>
              </div>

              {/* Botões de Pausa Rápida */}
              <div className="flex gap-2 pt-2">
                {registerStatus.isPaused ? (
                  <button
                    type="button"
                    onClick={() => handleTogglePause(false)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Play className="w-4 h-4" /> Retornar ao Atendimento (Fim da Pausa)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTogglePause(true)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Coffee className="w-4 h-4" /> Pausar Caixa (Almoço / Café) ☕
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Painel de Operações */}
        <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-sm font-black uppercase tracking-wider mb-6 border-b pb-3 border-slate-500/10">
            {!registerStatus?.isOpen ? 'Abertura de Caixa (Fundo de Troco)' : 'Movimentações e Fechamento'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {registerStatus?.isOpen && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setActionType('SUPPLY')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition cursor-pointer ${
                    actionType === 'SUPPLY' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-500/10 border-slate-500/20 opacity-70'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Suprimento
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('BLEED')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                    actionType === 'BLEED' ? 'bg-amber-600 border-amber-600 text-white shadow-md' : 'bg-slate-500/10 border-slate-500/20 opacity-70'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> Sangria
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('CLOSE')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                    actionType === 'CLOSE' ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-slate-500/10 border-slate-500/20 opacity-70'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" /> Fechamento Cego
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">
                {actionType === 'CLOSE' ? 'Valor Contado em Caixa (Dinheiro)' : 'Valor (R$)'}
              </label>
              <input
                type="text"
                value={displayValue}
                onChange={handleMoneyChange}
                placeholder="R$ 0,00"
                required
                className="w-full px-4 py-3 text-base font-mono font-black border rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-500/30 focus:border-indigo-600 outline-none text-emerald-600 dark:text-emerald-400"
              />
            </div>

            {actionType !== 'CLOSE' && registerStatus?.isOpen && (
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Motivo / Justificativa</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Troco adicional ou sangria parcial para o cofre"
                  className="w-full px-4 py-3 text-xs border rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-500/30 focus:border-indigo-600 outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              {!registerStatus?.isOpen ? 'Abrir Turno de Caixa 🚀' : `Confirmar ${actionType === 'CLOSE' ? 'Fechamento Cego de Turno' : actionType} ✓`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}