'use client';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'supervisor' | 'geral';
  status: 'ativo' | 'pausado';
  active: boolean;
}

interface UsersTableProps {
  users: UserItem[];
  loading: boolean;
  isDarkMode: boolean;
  onToggleStatus: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onDelete: (id: string) => void;
}

export function UsersTable({ users, loading, isDarkMode, onToggleStatus, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'border-slate-800 bg-slate-950/50 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
              <th className="py-4 px-6">Nome / Colaborador</th>
              <th className="py-4 px-6">E-mail Corporativo</th>
              <th className="py-4 px-6">Nível de Acesso (RBAC)</th>
              <th className="py-4 px-6">Estado</th>
              <th className="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center opacity-60">A carregar colaboradores...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center opacity-60">Nenhum utilizador registado além da administração principal.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-4 px-6 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    {user.name}
                  </td>
                  <td className="py-4 px-6 font-mono opacity-80">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                      user.role === 'gerente' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' :
                      user.role === 'supervisor' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 font-semibold ${user.active ? 'text-emerald-600' : 'text-amber-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {user.active ? 'Ativo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        user.active ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                      }`}
                    >
                      {user.active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 font-bold transition cursor-pointer"
                    >
                      Editar
                    </button>
                    {user.email !== 'melo.perfumaria@gmail.com' && (
                      <button
                        onClick={() => onDelete(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold transition cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}