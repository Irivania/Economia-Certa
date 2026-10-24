'use client';

import { UserRole } from '@/features/dashboard/types/user.types';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSelectionModal({
  isOpen,
  onClose,
  userRole,
  onRoleChange,
}: RoleSelectionModalProps) {
  if (!isOpen) return null;

  const roles: UserRole[] = ['admin', 'gerente', 'supervisor', 'geral', 'operador'];

  const titles: Record<UserRole, string> = {
    admin: '👑 Administrador (Acesso Total)',
    gerente: '💼 Gerente',
    supervisor: '🛡️ Supervisor',
    geral: '👤 Acesso Geral (Operador)',
    operador: '⚡ Operador de Caixa (PDV)',
  };

  const desc: Record<UserRole, string> = {
    admin: 'Controle completo de todas as funcionalidades, fornecedores e relatórios.',
    gerente: 'Acesso a gestão de fornecedores, comparadores e relatórios financeiros.',
    supervisor: 'Permite importação de dados e visualização de stocks críticos.',
    geral: 'Apenas visualização do catálogo, cotações e comparador básico.',
    operador: 'Acesso direto ao Terminal de Vendas (PDV) e operação de caixa.',
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-center border-b pb-3.5 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold tracking-tight">Gestão de Níveis de Acesso (RBAC)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Escolha o perfil para testar as permissões em tempo real.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {roles.map((role) => {
            const isSelected = userRole === role;

            return (
              <div 
                key={role}
                onClick={() => onRoleChange(role)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">{titles[role]}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc[role]}</p>
                </div>
                {isSelected && (
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 whitespace-nowrap ml-2">
                    Ativo
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
          >
            Concluir Seleção
          </button>
        </div>
      </div>
    </div>
  );
}