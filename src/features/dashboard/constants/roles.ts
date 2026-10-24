import { UserRole } from '../types/user.types';

export const ADMIN_ROLE: UserRole = 'admin';
export const OPERATOR_ROLES: UserRole[] = ['geral', 'operador'];

export const PERMISSIONS = {
  CAN_MANAGE_SUPPLIERS: ['admin', 'gerente'] as UserRole[],
  CAN_IMPORT_DATA: ['admin', 'gerente', 'supervisor'] as UserRole[],
} as const;