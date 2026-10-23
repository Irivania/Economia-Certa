'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { uppercaseText } from '@/lib/text';
import { apiFetch } from '@/lib/apiClient';

// ==========================================
// 1. TIPOS E CONTRATOS ESTRITOS (TypeScript)
// ==========================================
export interface Supplier {
  id: string;
  name: string;
  cnpj?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Connection {
  id: string;
  supplierId: string;
  status: string;
  initiatedBy: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// ==========================================
// 2. UTILITÁRIOS DE MÁSCARAS E VALIDAÇÃO (DRY)
// ==========================================
function formatCepInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').substring(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

function formatCnpjInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').substring(0, 14);
  if (digits.length > 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  } else if (digits.length > 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  } else if (digits.length > 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  } else if (digits.length > 2) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  return digits;
}

function formatPhoneInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').substring(0, 11);
  if (digits.length > 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length > 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else if (digits.length > 0) {
    return `(${digits}`;
  }
  return '';
}

function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (!digits) return true;
  return digits.length === 14;
}

// ==========================================
// 3. CONSTANTES CENTRALIZADAS
// ==========================================
const MESSAGES = {
  loadError: 'Não foi possível buscar os dados de fornecedores.',
  inviteSuccess: 'Convite de parceria enviado ao fornecedor!',
  inviteError: 'Erro ao enviar convite.',
  connectError: 'Erro ao conectar.',
  acceptSuccess: 'Parceria aceita com sucesso!',
  rejectSuccess: 'Convite recusado.',
  processInviteError: 'Erro ao processar convite.',
  cepNotFound: 'CEP não encontrado. Preencha o endereço manualmente.',
  cepError: 'Não foi possível consultar o CEP. Preencha o endereço manualmente.',
  cepSuccess: 'Endereço localizado via CEP!',
  cnpjNotFound: 'CNPJ não encontrado. Preencha os dados manualmente.',
  cnpjError: 'Não foi possível consultar o CNPJ. Preencha os dados manualmente.',
  cnpjSuccess: 'Dados carregados via CNPJ!',
  nameRequired: 'O nome do fornecedor é obrigatório.',
  invalidEmail: 'E-mail inválido.',
  invalidCnpj: 'CNPJ inválido (deve conter 14 dígitos).',
  saveSuccessCreate: 'Cadastrado com sucesso!',
  saveSuccessUpdate: 'Atualizado com sucesso!',
  saveError: 'Erro ao salvar fornecedor.',
  deleteConfirm: 'Deseja excluir este fornecedor?',
  deleteSuccess: 'Excluído com sucesso!',
  deleteError: 'Erro ao excluir fornecedor.',
} as const;

// ==========================================
// 4. HOOK PRINCIPAL DE FORNECEDORES
// ==========================================
export function useSuppliers(
  companyId: string,
  onNotify?: (message: string, type: NotificationType) => void,
  onConfirm?: (message: string, onConfirmAction: () => void) => void
) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [fetchingCep, setFetchingCep] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Referências para cancelamento de requisições e timers
  const cepAbortControllerRef = useRef<AbortController | null>(null);
  const cnpjAbortControllerRef = useRef<AbortController | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const notify = useCallback((msg: string, type: NotificationType = 'error') => {
    if (onNotify) {
      onNotify(msg, type);
    }
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, [onNotify]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [supRes, connRes] = await Promise.all([
        apiFetch('/api/suppliers'),
        apiFetch('/api/portal/connections'),
      ]);

      if (supRes.ok) {
        const supData = await supRes.json();
        setSuppliers(Array.isArray(supData) ? supData : []);
      }
      if (connRes.ok) {
        const connData = await connRes.json();
        setConnections(Array.isArray(connData) ? connData : []);
      }
      setError(null);
    } catch (err) {
      setError(MESSAGES.loadError);
      console.error('[useSuppliers Error]:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  const handleConnectSupplier = useCallback(async (supplierId: string) => {
    if (!companyId || !supplierId) return;
    try {
      const res = await apiFetch('/api/portal/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, supplierId, initiatedBy: 'COMPANY' }),
      });
      if (!res.ok) throw new Error(MESSAGES.inviteError);
      notify(MESSAGES.inviteSuccess, 'success');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : MESSAGES.connectError;
      notify(msg, 'error');
    }
  }, [companyId, loadData, notify]);

  const handleUpdateConnection = useCallback(async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await apiFetch('/api/portal/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status }),
      });
      if (!res.ok) throw new Error(MESSAGES.processInviteError);
      notify(status === 'ACCEPTED' ? MESSAGES.acceptSuccess : MESSAGES.rejectSuccess, 'success');
      await loadData();
    } catch {
      notify(MESSAGES.processInviteError, 'error');
    }
  }, [loadData, notify]);

  // Consulta de CEP com AbortController
  const handleCepChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCepInput(e.target.value);
    setCep(formatted);

    const rawValue = formatted.replace(/\D/g, '');
    if (rawValue.length === 8) {
      if (cepAbortControllerRef.current) cepAbortControllerRef.current.abort();
      cepAbortControllerRef.current = new AbortController();

      try {
        setFetchingCep(true);
        const res = await fetch(`/api/proxy/cnpj?cep=${rawValue}`, { signal: cepAbortControllerRef.current.signal });
        const data = await res.json();
        if (res.ok && !data.erro) {
          const fullAddress = uppercaseText(
            `${data.street || data.logradouro || ''}, Bairro: ${data.neighborhood || data.bairro || ''}, ${data.city || data.localidade || ''}\n${data.state || data.uf || ''}`
          );
          setAddress(fullAddress);
          notify(MESSAGES.cepSuccess, 'success');
        } else {
          notify(MESSAGES.cepNotFound, 'warning');
        }
      } catch (error: unknown) {
        const err = error as Error;
        if (err.name !== 'AbortError') {
          console.error('Erro ao consultar CEP:', err);
          notify(MESSAGES.cepError, 'error');
        }
      } finally {
        setFetchingCep(false);
      }
    }
  }, [notify]);

  // Consulta de CNPJ com AbortController
  const handleCnpjChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpjInput(e.target.value);
    setCnpj(formatted);

    const rawValue = formatted.replace(/\D/g, '');
    if (rawValue.length === 14) {
      if (cnpjAbortControllerRef.current) cnpjAbortControllerRef.current.abort();
      cnpjAbortControllerRef.current = new AbortController();

      try {
        setFetchingCnpj(true);
        const res = await fetch(`/api/proxy/cnpj?cnpj=${rawValue}`, { signal: cnpjAbortControllerRef.current.signal });
        const data = await res.json();
        if (res.ok && !data.message) {
          if (data.nome_fantasia || data.razao_social) {
            setName(uppercaseText(data.nome_fantasia || data.razao_social));
          }
          if (data.cep) setCep(data.cep);
          if (data.logradouro) {
            setAddress(
              uppercaseText(`${data.logradouro}, Nº ${data.numero || 'S/N'}, Bairro: ${data.bairro || ''}, ${data.municipio}\n${data.uf}`)
            );
          }
          if (data.ddd_telefone_1) setPhone(data.ddd_telefone_1);
          if (data.email) setEmail(data.email.toLowerCase());
          notify(MESSAGES.cnpjSuccess, 'success');
        } else {
          notify(MESSAGES.cnpjNotFound, 'warning');
        }
      } catch (error: unknown) {
        const err = error as Error;
        if (err.name !== 'AbortError') {
          console.error('Erro ao consultar CNPJ:', err);
          notify(MESSAGES.cnpjError, 'error');
        }
      } finally {
        setFetchingCnpj(false);
      }
    }
  }, [notify]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName('');
    setCnpj('');
    setCep('');
    setAddress('');
    setContactPerson('');
    setPhone('');
    setEmail('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify(MESSAGES.nameRequired, 'warning');
      return;
    }
    if (email && !isValidEmail(email)) {
      notify(MESSAGES.invalidEmail, 'warning');
      return;
    }
    if (cnpj && !isValidCnpj(cnpj)) {
      notify(MESSAGES.invalidCnpj, 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const method = editingId ? 'PUT' : 'POST';
      const bodyData = { id: editingId, companyId, name, cnpj, address, contactPerson, phone, email };

      const res = await apiFetch('/api/suppliers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error(MESSAGES.saveError);
      resetForm();
      notify(editingId ? MESSAGES.saveSuccessUpdate : MESSAGES.saveSuccessCreate, 'success');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : MESSAGES.saveError;
      notify(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }, [editingId, companyId, name, cnpj, address, contactPerson, phone, email, resetForm, loadData, notify]);

  const handleEdit = useCallback((sup: Supplier) => {
    setEditingId(sup.id);
    setName(sup.name);
    setCnpj(sup.cnpj || '');
    setAddress(sup.address || '');
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setEmail(sup.email || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const executeDelete = async () => {
      try {
        const res = await apiFetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(MESSAGES.deleteError);
        notify(MESSAGES.deleteSuccess, 'success');
        await loadData();
      } catch {
        notify(MESSAGES.deleteError, 'error');
      }
    };

    if (onConfirm) {
      onConfirm(MESSAGES.deleteConfirm, executeDelete);
    } else {
      if (window.confirm(MESSAGES.deleteConfirm)) {
        await executeDelete();
      }
    }
  }, [loadData, notify, onConfirm]);

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.cnpj && s.cnpj.includes(term))
    );
  }, [suppliers, searchTerm]);

  return useMemo(() => ({
    suppliers,
    connections,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchingCep,
    fetchingCnpj,
    editingId,
    name,
    setName,
    cnpj,
    handleCnpjChange,
    cep,
    handleCepChange,
    address,
    setAddress,
    contactPerson,
    setContactPerson,
    phone,
    handlePhoneChange,
    email,
    setEmail,
    submitting,
    toastMessage,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    filteredSuppliers,
    handleConnectSupplier,
    handleUpdateConnection,
  }), [
    suppliers,
    connections,
    loading,
    error,
    searchTerm,
    fetchingCep,
    fetchingCnpj,
    editingId,
    name,
    cnpj,
    handleCnpjChange,
    cep,
    handleCepChange,
    address,
    contactPerson,
    phone,
    handlePhoneChange,
    email,
    submitting,
    toastMessage,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    filteredSuppliers,
    handleConnectSupplier,
    handleUpdateConnection,
  ]);
}