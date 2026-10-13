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
    <div className={`border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'} backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
          {userName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold leading-none">{userName}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
              Cargo: {userRole}
            </span>
            <button
              onClick={onOpenPermissionModal}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              [Alterar Nível]
            </button>
            {userRole === 'admin' && (
              <Link
                href="/usuarios"
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold ml-1 flex items-center gap-1"
              >
                ⚙️ Gestão de Utilizadores
              </Link>
            )}
            {canManageCompany && (
              <Link
                href="/configuracoes/empresa"
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-1 flex items-center gap-1"
              >
                🏢 Dados da Empresa
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">Sessão protegida por token corporativo</span>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-all border border-rose-500/20 flex items-center gap-1.5 cursor-pointer"
        >
          <span>🚪 Terminar Sessão</span>
        </button>
      </div>
    </div>
  );
}