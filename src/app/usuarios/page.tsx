'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ToastContainer } from '@/components/ToastContainer';
import { UsersTable } from '@/components/users/UsersTable';
import { UserModals } from '@/components/users/UserModals';
import { apiFetch } from '@/lib/apiClient';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'supervisor' | 'geral';
  status: 'ativo' | 'pausado';
  active: boolean;
  tempPassword?: string;
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

function generateUniqueId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<{ name: string; email: string; tempPassword: string } | null>(null);

  // Criar
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'gerente' | 'supervisor' | 'geral'>('geral');

  // Editar
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'gerente' | 'supervisor' | 'geral'>('geral');

  const fetchUsers = useCallback(async () => {
    try {
      const sessionData = sessionStorage.getItem('melo_company_session');
      if (!sessionData) {
        router.push('/login');
        return;
      }

      const parsed = JSON.parse(sessionData);
      if (parsed.role && parsed.role !== 'admin') {
        alert('Acesso restrito a Administradores.');
        router.push('/');
        return;
      }

      const res = await apiFetch('/api/users');

      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch {
      console.error('Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (isMounted) await fetchUsers();
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchUsers]);

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = generateUniqueId();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Erro ao cadastrar utilizador.');
      }

      const data = await res.json();
      setUsers((prev) => [data, ...prev]);
      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRole('geral');
      setCreatedUserData({ name: data.name, email: data.email, tempPassword: data.tempPassword });
      addToast('Utilizador Cadastrado', `Acesso gerado para ${newName}!`, 'success');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao criar utilizador.');
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newActiveState = !user.active;
    try {
      const res = await apiFetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ id: user.id, active: newActiveState }),
      });

      if (!res.ok) throw new Error('Erro ao alterar estado.');

      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, active: updated.active, status: updated.status } : u)));
      addToast('Estado Atualizado', `O acesso foi ${newActiveState ? 'ativado' : 'pausado'}.`, 'info');
    } catch {
      alert('Não foi possível alterar o estado.');
    }
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await apiFetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ id: editingUser.id, name: editName, email: editEmail, role: editRole }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar.');

      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      setIsEditModalOpen(false);
      setEditingUser(null);
      addToast('Atualizado', 'Informações do colaborador atualizadas.', 'success');
    } catch {
      alert('Não foi possível atualizar.');
    }
  };

  // Função para redefinir a palavra-passe do utilizador em edição
  const handleResetPassword = async () => {
    if (!editingUser) return;

    try {
      const res = await apiFetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ id: editingUser.id, resetPassword: true }),
      });

      if (!res.ok) throw new Error('Erro ao redefinir palavra-passe.');

      const updated = await res.json();
      setIsEditModalOpen(false);
      setEditingUser(null);

      // Exibe o modal com a nova palavra-passe temporária gerada
      setCreatedUserData({
        name: updated.name,
        email: updated.email,
        tempPassword: updated.tempPassword,
      });

      addToast('Palavra-passe Redefinida', `Nova senha gerada para ${updated.name}!`, 'success');
    } catch {
      alert('Não foi possível redefinir a palavra-passe.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja remover permanentemente este utilizador?')) return;

    try {
      const res = await apiFetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover.');

      setUsers((prev) => prev.filter((u) => u.id !== id));
      addToast('Removido', 'Colaborador excluído do sistema.', 'warning');
    } catch {
      alert('Erro ao excluir.');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Gestão de Utilizadores & Permissões"
        subtitle="Controle centralizado de acessos corporativos da empresa."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 pb-20 space-y-8">
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

        <UsersTable
          users={users}
          loading={loading}
          isDarkMode={isDarkMode}
          onToggleStatus={handleToggleStatus}
          onEdit={openEditModal}
          onDelete={handleDeleteUser}
        />
      </main>

      <UserModals
        isDarkMode={isDarkMode}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        newName={newName}
        setNewName={setNewName}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newRole={newRole}
        setNewRole={setNewRole}
        handleCreateUser={handleCreateUser}
        createdUserData={createdUserData}
        setCreatedUserData={setCreatedUserData}
        onCopyPassword={(pwd) => {
          navigator.clipboard.writeText(pwd);
          addToast('Copiado', 'Palavra-passe copiada para a área de transferência!', 'success');
        }}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editRole={editRole}
        setEditRole={setEditRole}
        handleUpdateUser={handleUpdateUser}
        onResetPassword={handleResetPassword}
      />

      <ToastContainer toasts={toasts} isDarkMode={isDarkMode} />
    </div>
  );
}