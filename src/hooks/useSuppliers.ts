import { useState, useEffect, useCallback } from 'react';
import { uppercaseText } from '@/lib/text';

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

export function useSuppliers(companyId: string) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchingCep, setFetchingCep] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);

  // Estados do formulário (sem palavra-passe)
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [supRes, connRes] = await Promise.all([
        fetch(`/api/suppliers?companyId=${companyId}`),
        fetch(`/api/portal/connections?companyId=${companyId}`)
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
      setError('Não foi possível buscar os dados de fornecedores.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  const handleConnectSupplier = async (supplierId: string) => {
    try {
      const res = await fetch('/api/portal/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, supplierId, initiatedBy: 'COMPANY' })
      });
      if (!res.ok) throw new Error('Erro ao enviar convite.');
      showToast('Convite de parceria enviado ao fornecedor!');
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao conectar.');
    }
  };

  const handleUpdateConnection = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/portal/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status })
      });
      if (!res.ok) throw new Error();
      showToast(status === 'ACCEPTED' ? 'Parceria aceita com sucesso!' : 'Convite recusado.');
      await loadData();
    } catch {
      showToast('Erro ao processar convite.');
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').substring(0, 8);
    let formatted = rawValue;
    if (rawValue.length > 5) formatted = `${rawValue.slice(0, 5)}-${rawValue.slice(5)}`;
    setCep(formatted);

    if (rawValue.length === 8) {
      try {
        setFetchingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress(uppercaseText(`${data.logradouro}, Bairro: ${data.bairro}, ${data.localidade} - ${data.uf}`));
          showToast('Endereço localizado via CEP!');
        } else {
          alert('CEP não encontrado.');
        }
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 14);
    let formatted = value;
    if (value.length > 2 && value.length <= 5) formatted = `${value.slice(0, 2)}.${value.slice(2)}`;
    else if (value.length > 5 && value.length <= 8) formatted = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`;
    else if (value.length > 8 && value.length <= 12) formatted = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8)}`;
    else if (value.length > 12) formatted = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12)}`;
    setCnpj(formatted);

    if (value.length === 14) {
      try {
        setFetchingCnpj(true);
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${value}`);
        const data = await res.json();
        if (res.ok && !data.message) {
          if (data.nome_fantasia || data.razao_social) setName(uppercaseText(data.nome_fantasia || data.razao_social));
          if (data.cep) setCep(data.cep);
          if (data.logradouro) setAddress(uppercaseText(`${data.logradouro}, Nº ${data.numero || 'S/N'}, Bairro: ${data.bairro || ''}, ${data.municipio} - ${data.uf}`));
          if (data.ddd_telefone_1) setPhone(data.ddd_telefone_1);
          if (data.email) setEmail(data.email.toLowerCase());
          showToast('Dados carregados via CNPJ!');
        }
      } finally {
        setFetchingCnpj(false);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 11);
    let formatted = value;
    if (value.length > 2 && value.length <= 6) formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    else if (value.length > 6 && value.length <= 10) formatted = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    else if (value.length > 10) formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    else if (value.length > 0) formatted = `(${value}`;
    setPhone(formatted);
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setCnpj(''); setCep(''); setAddress('');
    setContactPerson(''); setPhone(''); setEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('O nome é obrigatório.');

    try {
      setSubmitting(true);
      const method = editingId ? 'PUT' : 'POST';
      // Removida a propriedade password do body
      const bodyData = { id: editingId, companyId, name, cnpj, address, contactPerson, phone, email };
      const res = await fetch('/api/suppliers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error('Erro ao salvar.');
      resetForm();
      showToast(editingId ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sup: Supplier) => {
    setEditingId(sup.id);
    setName(sup.name);
    setCnpj(sup.cnpj || '');
    setAddress(sup.address || '');
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setEmail(sup.email || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este fornecedor?')) return;
    try {
      const res = await fetch(`/api/suppliers?id=${id}&companyId=${companyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir.');
      showToast('Excluído com sucesso!');
      await loadData();
    } catch {
      alert('Erro ao excluir.');
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.cnpj && s.cnpj.includes(searchTerm))
  );

  return {
    suppliers, connections, loading, error, searchTerm, setSearchTerm,
    fetchingCep, fetchingCnpj, editingId, name, setName, cnpj, handleCnpjChange,
    cep, handleCepChange, address, setAddress, contactPerson, setContactPerson,
    phone, handlePhoneChange, email, setEmail, submitting, toastMessage,
    handleSubmit, handleEdit, handleDelete, resetForm, filteredSuppliers,
    handleConnectSupplier, handleUpdateConnection
  };
}