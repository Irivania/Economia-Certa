export type UserRole = 'admin' | 'gerente' | 'supervisor' | 'operador' | 'geral';

export interface SessionData {
  name: string;
  role: UserRole;
  companyId?: string;
}