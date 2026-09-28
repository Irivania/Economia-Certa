'use client';

type UserRole = 'admin' | 'gerente' | 'supervisor' | 'geral';

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

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black">Gestão de Níveis de Acesso (RBAC)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Escolha o perfil para testar as permissões em tempo real.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer">✕</button>
        </div>

        <div className="space-y-3">
          {(['admin', 'gerente', 'supervisor', 'geral'] as UserRole[]).map((role) => {
            const titles: Record<UserRole, string> = {
              admin: '👑 Administrador (Acesso Total)',
              gerente: '💼 Gerente',
              supervisor: '🛡️ Supervisor',
              geral: '👤 Acesso Geral (Operador)',
            };
            const desc: Record<UserRole, string> = {
              admin: 'Controle completo de todas as funcionalidades, fornecedores e relatórios.',
              gerente: 'Acesso a gestão de fornecedores, comparadores e relatórios financeiros.',
              supervisor: 'Permite importação de dados e visualização de stocks críticos.',
              geral: 'Apenas visualização do catálogo, cotações e comparador básico.',
            };

            return (
              <div 
                key={role}
                onClick={() => onRoleChange(role)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  userRole === role ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{titles[role]}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{desc[role]}</p>
                </div>
                {userRole === role && <span className="text-xs font-bold text-indigo-600">Ativo</span>}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
          >
            Concluir Seleção
          </button>
        </div>
      </div>
    </div>
  );
}