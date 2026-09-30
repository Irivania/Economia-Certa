'use client';

import { useState } from 'react';

interface ProfileSettingsCardProps {
  isDarkMode: boolean;
  representativeName: string;
  representativeEmail: string;
  representativePhone?: string | null;
  onSaveProfile: (newName: string, newPhone: string, newPass: string) => void;
}

export function ProfileSettingsCard({
  isDarkMode,
  representativeName,
  representativeEmail,
  representativePhone,
  onSaveProfile,
}: ProfileSettingsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editName, setEditName] = useState(representativeName);
  const [editPhone, setEditPhone] = useState(representativePhone || '');
  const [editPassword, setEditPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(editName, editPhone, editPassword);
    setIsOpen(false);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-indigo-500/20 shadow-indigo-950/50' 
        : 'bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border-indigo-100 shadow-indigo-100/50'
    }`}>
      {/* Luz ambiente decorativa */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Escritório Comercial Verificado
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {representativeName}
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span>✉️ {representativeEmail}</span>
            <span>•</span>
            <span>📱 {representativePhone || 'Sem telemóvel registado'}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 shadow-lg ${
            isDarkMode 
              ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50 text-white shadow-indigo-600/30' 
              : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white shadow-indigo-600/20'
          }`}
        >
          <span>⚙️</span>
          <span>{isOpen ? 'Fechar Painel' : 'Gerir Perfil & Credenciais'}</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-500/15 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300 relative z-10">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-indigo-300 mb-1.5">Nome do Representante</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border text-xs outline-none font-bold transition-all ${
                isDarkMode ? 'bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-indigo-300 mb-1.5">Telemóvel / WhatsApp</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className={`w-full px-4 py-3 rounded-2xl border text-xs outline-none font-mono font-bold transition-all ${
                isDarkMode ? 'bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-indigo-300 mb-1.5">Nova Senha (Opcional)</label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-2xl border text-xs outline-none font-mono transition-all ${
                isDarkMode ? 'bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
              }`}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-widest transition shadow-xl shadow-emerald-600/30 cursor-pointer active:scale-95"
            >
              Guardar Alterações do Perfil &rarr;
            </button>
          </div>
        </form>
      )}
    </div>
  );
}