'use client';

import Link from 'next/link';

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  onOpenPermissionModal: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

export function DashboardHeader({
  userName,
  userRole,
  onOpenPermissionModal,
  onLogout,
  isDarkMode,
}: DashboardHeaderProps) {
  const canManageCompany = ['admin', 'gerente'].includes(userRole);

  return (
    <div className={`border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md sticky top-0 z-30 px-6 sm:px-12 py-3 flex flex-col sm:flex-row justify-between items-center gap-4`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
          {userName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-bold leading-none">{userName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">
              Cargo: {userRole}
            </span>
            <button
              onClick={onOpenPermissionModal}
              className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              [Alterar Nível]
            </button>
            {userRole === 'admin' && (
              <Link
                href="/usuarios"
                className="text-[11px] text-purple-600 hover:underline font-bold ml-1"
              >
                ⚙️ Gestão de Utilizadores
              </Link>
            )}
            {canManageCompany && (
              <Link
                href="/configuracoes/empresa"
                className="text-[11px] text-emerald-600 hover:underline font-bold ml-1"
              >
                🏢 Dados da Empresa
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs opacity-60 hidden md:inline">Sessão protegida por token corporativo</span>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold transition-all border border-rose-500/20 flex items-center gap-2 cursor-pointer"
        >
          <span>🚪 Terminar Sessão</span>
        </button>
      </div>
    </div>
  );
}