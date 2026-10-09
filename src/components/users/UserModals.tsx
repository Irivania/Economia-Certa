'use client';

import React from 'react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'supervisor' | 'geral';
  status: 'ativo' | 'pausado';
  active: boolean;
}

interface UserModalsProps {
  isDarkMode: boolean;
  // Modal Criar
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  newName: string;
  setNewName: (val: string) => void;
  newEmail: string;
  setNewEmail: (val: string) => void;
  newRole: 'admin' | 'gerente' | 'supervisor' | 'geral';
  setNewRole: (val: 'admin' | 'gerente' | 'supervisor' | 'geral') => void;
  handleCreateUser: (e: React.FormEvent) => void;

  // Modal Senha Gerada
  createdUserData: { name: string; email: string; tempPassword: string } | null;
  setCreatedUserData: (val: null) => void;
  onCopyPassword: (pwd: string) => void;

  // Modal Editar
  isEditModalOpen: boolean;
  setIsEditModalOpen: (val: boolean) => void;
  editName: string;
  setEditName: (val: string) => void;
  editEmail: string;
  setEditEmail: (val: string) => void;
  editRole: 'admin' | 'gerente' | 'supervisor' | 'geral';
  setEditRole: (val: 'admin' | 'gerente' | 'supervisor' | 'geral') => void;
  handleUpdateUser: (e: React.FormEvent) => void;
  onResetPassword: () => void; // Nova prop para redefinir senha
}

export function UserModals({
  isDarkMode,
  isModalOpen,
  setIsModalOpen,
  newName,
  setNewName,
  newEmail,
  setNewEmail,
  newRole,
  setNewRole,
  handleCreateUser,
  createdUserData,
  setCreatedUserData,
  onCopyPassword,
  isEditModalOpen,
  setIsEditModalOpen,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editRole,
  setEditRole,
  handleUpdateUser,
  onResetPassword,
}: UserModalsProps) {
  return (
    <>
      {/* Modal para Adicionar Novo Utilizador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black">Conceder Novo Acesso</h3>
                <p className="text-xs text-slate-500 mt-0.5">A senha provisória será gerada automaticamente.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer">✕</button>
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
                  Gerar Acesso Seguro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sucesso com a Senha Gerada (Apenas Admin Visualiza) */}
      {createdUserData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-xl font-black">✓</div>
              <h3 className="text-base font-black">Acesso Gerado com Sucesso!</h3>
              <p className="text-xs text-slate-500">Copie a palavra-passe provisória abaixo e envie ao colaborador. Ela não será exibida novamente por segurança.</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 font-mono text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div><strong>Colaborador:</strong> {createdUserData.name}</div>
              <div><strong>E-mail:</strong> {createdUserData.email}</div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span><strong>Senha Provisória:</strong> <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{createdUserData.tempPassword}</span></span>
                <button
                  onClick={() => onCopyPassword(createdUserData.tempPassword)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>

            <button
              onClick={() => setCreatedUserData(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Concluído
            </button>
          </div>
        </div>
      )}

      {/* Modal para Editar Utilizador */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black">Editar Colaborador</h3>
                <p className="text-xs text-slate-500 mt-0.5">Altere as informações ou nível de acesso.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:border-indigo-600 font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:border-indigo-600 font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase">Nível de Permissão</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserItem['role'])}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:border-indigo-600 font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="admin">Administrador (Acesso Total)</option>
                  <option value="gerente">Gerente (Fornecedores e Relatórios)</option>
                  <option value="supervisor">Supervisor (Importações e Stocks)</option>
                  <option value="geral">Acesso Geral (Operador)</option>
                </select>
              </div>

              {/* Botão para Redefinir Senha */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja gerar uma nova palavra-passe provisória para este colaborador?')) {
                      onResetPassword();
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold text-xs transition cursor-pointer"
                >
                  🔑 Redefinir Palavra-passe Provisória
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}