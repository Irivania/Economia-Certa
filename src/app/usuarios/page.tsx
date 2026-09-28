'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ToastContainer } from '@/components/ToastContainer';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'supervisor' | 'geral';
  status: 'ativo' | 'inativo';
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

// Função auxiliar pura fora do componente para geração de IDs únicos seguros
function generateUniqueId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [users, setUsers] = useState<UserItem[]>([
    { id: '1', name: 'Irivânia Melo (Administração)', email: 'melo.perfumaria@gmail.com', role: 'admin', status: 'ativo' },
    { id: '2', name: 'Carlos Gerente', email: 'carlos.gerente@meloperfumaria.com', role: 'gerente', status: 'ativo' },
    { id: '3', name: 'Ana Supervisor', email: 'ana.supervisor@meloperfumaria.com', role: 'supervisor', status: 'ativo' },
    { id: '4', name: 'Roberto Operador', email: 'roberto.geral@meloperfumaria.com', role: 'geral', status: 'ativo' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'gerente' | 'supervisor' | 'geral'>('geral');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Verificar se o utilizador logado é Admin
  useEffect(() => {
    const sessionData = sessionStorage.getItem('melo_company_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed.role && parsed.role !== 'admin') {
          alert('Acesso restrito a Administradores.');
          router.push('/');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = generateUniqueId();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: UserItem = {
      id: generateUniqueId(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'ativo',
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRole('geral');
    addToast('Utilizador Cadastrado', `O acesso para ${newName} foi liberado com sucesso!`, 'success');
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addToast('Acesso Revogado', 'O utilizador foi removido do sistema.', 'warning');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AppHeader
        title="Gestão de Utilizadores & Permissões"
        subtitle="Controle centralizado de acessos corporativos da Melo Perfumaria."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 pb-20 space-y-8">
        
        {/* Barra de Ações Superior */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="text-base font-black">Colaboradores Autorizados</h2>
            <p className="text-xs text-slate-500 mt-0.5">Gerencie quem pode aceder e alterar dados no ERP.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              &larr; Voltar ao Painel
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              + Novo Utilizador
            </button>
          </div>
        </div>

        {/* Tabela de Utilizadores */}
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
                {users.map((user) => (
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
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ativo
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user.email !== 'melo.perfumaria@gmail.com' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold transition cursor-pointer"
                        >
                          Revogar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal para Adicionar Novo Utilizador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black">Conceder Novo Acesso</h3>
                <p className="text-xs text-slate-500 mt-0.5">Defina o nível de permissão do colaborador.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:border-indigo-600 font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="joao@meloperfumaria.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:border-indigo-600 font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase">Nível de Permissão</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserItem['role'])}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:border-indigo-600 font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="admin">Administrador (Acesso Total)</option>
                  <option value="gerente">Gerente (Fornecedores e Relatórios)</option>
                  <option value="supervisor">Supervisor (Importações e Stocks)</option>
                  <option value="geral">Acesso Geral (Operador)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Salvar e Liberar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
    </div>
  );
}