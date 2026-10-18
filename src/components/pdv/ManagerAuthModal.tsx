'use client';

import { useState } from 'react';

interface ManagerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  isDarkMode: boolean;
}

export function ManagerAuthModal({
  isOpen,
  onClose,
  onAuthorized,
  isDarkMode,
}: ManagerAuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // PIN padrão do gerente/supervisor (Pode ser ajustado ou validado via API)
    if (pin === '1234' || pin === 'admin') {
      setError(false);
      setPin('');
      onAuthorized();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="text-center space-y-1">
          <div className="text-3xl mb-1">🔐</div>
          <h3 className="text-sm font-black uppercase tracking-wider">Autorização de Gerente</h3>
          <p className="text-xs opacity-60">O cancelamento de item exige PIN de supervisor.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Digite o PIN (Ex: 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={`w-full px-4 py-3 text-center text-lg font-mono tracking-widest border rounded-2xl outline-none ${
                error ? 'border-rose-500 bg-rose-500/10' : 'bg-slate-50 dark:bg-slate-950 border-slate-500/30'
              }`}
              autoFocus
              required
            />
            {error && <p className="text-[11px] text-rose-500 font-bold text-center mt-1">PIN incorreto. Tente novamente.</p>}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-500/20 font-bold text-xs hover:bg-slate-500/10 transition cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              Autorizar 🔓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}