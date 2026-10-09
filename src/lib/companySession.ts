export interface CompanySession {
  userId?: string;
  companyId?: string;
  name?: string;
  tradeName?: string;
  email?: string;
  role?: string;
}

/**
 * ATENÇÃO: Esta função deve ser usada EXCLUSIVAMENTE no Frontend (Componentes 'use client').
 * Nunca confie nestes dados para operações de backend ou validações de segurança (IDOR).
 */
export function getCompanySession(): CompanySession | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawSession = sessionStorage.getItem('melo_company_session');
    return rawSession ? (JSON.parse(rawSession) as CompanySession) : null;
  } catch (error) {
    console.error('Erro ao ler a sessão da empresa no cliente:', error);
    return null;
  }
}

export function getCompanyId(): string {
  return getCompanySession()?.companyId || '';
}