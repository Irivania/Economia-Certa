'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionData, UserRole } from '../types/user.types';
import { OPERATOR_ROLES, ADMIN_ROLE } from '../constants/roles';

const SESSION_KEY = 'melo_company_session';

export function useUserSession() {
  const router = useRouter();
  
  // Lazy initial state: lê a sessão de forma síncrona apenas na montagem, evitando setState em useEffect
  const [session, setSession] = useState<SessionData>(() => {
    if (typeof window === 'undefined') {
      return { name: 'Melo Perfumaria', role: ADMIN_ROLE };
    }
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData) as Partial<SessionData>;
        const role = (parsed.role || ADMIN_ROLE).toLowerCase() as UserRole;
        return {
          name: parsed.name || 'Melo Perfumaria',
          role,
          companyId: parsed.companyId,
        };
      }
    } catch (e) {
      console.error('Erro ao ler sessão do usuário:', e);
    }
    return { name: 'Melo Perfumaria', role: ADMIN_ROLE };
  });

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  useEffect(() => {
    const roleLower = String(session.role || '').toLowerCase() as UserRole;
    if (OPERATOR_ROLES.includes(roleLower)) {
      router.replace('/pdv');
    }
  }, [session.role, router]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    void fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  const handleRoleChange = useCallback(
    (newRole: UserRole, onError: (title: string, desc: string, type: 'warning') => void) => {
      if (session.role !== ADMIN_ROLE) {
        onError('Acesso Restrito', 'Apenas administradores podem alterar níveis de permissão.', 'warning');
        return false;
      }

      setSession((prev) => ({ ...prev, role: newRole }));
      try {
        const sessionData = sessionStorage.getItem(SESSION_KEY);
        const parsed = sessionData ? (JSON.parse(sessionData) as Record<string, unknown>) : {};
        parsed.role = newRole;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('Erro ao atualizar sessão:', e);
      }
      setIsPermissionModalOpen(false);
      return true;
    },
    [session.role]
  );

  return {
    userName: session.name,
    userRole: session.role,
    isPermissionModalOpen,
    setIsPermissionModalOpen,
    handleLogout,
    handleRoleChange,
  };
}