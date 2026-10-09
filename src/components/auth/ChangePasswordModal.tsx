'use client';

import { useState } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  userId: string;
  tempPasswordUsed: string;
  onSuccess: () => void;
}

export function ChangePasswordModal({ isOpen, userId, tempPasswordUsed, onSuccess }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    if (newPassword.length < 6) {
      setChangeError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('As palavras-passe não coincidem.');
      return;
    }

    setChanging(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword: tempPasswordUsed,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar a palavra-passe.');

      alert('Palavra-passe alterada com sucesso! Faça login novamente com a sua nova credencial.');
      onSuccess();
    } catch (err) {
      setChangeError(err instanceof Error ? err.message : 'Erro ao alterar a palavra-passe.');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6 text-slate-100">
        <div className="space-y-2 text-center">
          <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase rounded-full">
            Segurança Obrigatória
          </span>
          <h2 className="text-xl font-black text-white">Defina a sua Palavra-passe</h2>
          <p className="text-xs text-slate-400">
            Este é o seu primeiro acesso. Por razões de segurança, deve definir uma nova palavra-passe pessoal antes de prosseguir.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
              Nova Palavra-passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
              Confirmar Nova Palavra-passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest"
              placeholder="Repita a palavra-passe"
            />
          </div>

          {changeError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-bold">
              {changeError}
            </p>
          )}

          <button
            type="submit"
            disabled={changing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
          >
            {changing ? 'A atualizar...' : 'Salvar Nova Palavra-passe e Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}