'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Quotation {
  id: string;
  token?: string;
  title: string;
  supplierName?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  closingTime?: string;
}

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  useEffect(() => {
    async function fetchQuotations() {
      try {
        const res = await fetch(`/api/quotations?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setQuotations(Array.isArray(data) ? data : data.quotations || []);
        }
      } catch (error) {
        console.error('Erro ao buscar cotações', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotations();
  }, []);

  const handleDeleteQuotation = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente excluir a cotação "${title}"?`)) return;

    try {
      const res = await fetch(`/api/quotations?id=${id}&companyId=${companyId}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 404) {
        setQuotations(prev => prev.filter(q => q.id !== id));
        alert('Cotação excluída com sucesso!');
      } else {
        alert('Não foi possível excluir a cotação.');
      }
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      alert('Erro de conexão ao tentar excluir.');
    }
  };

  const handleShareWhatsApp = (quotation: Quotation) => {
    if (!quotation.token) {
      alert('Esta cotação não possui um token válido gerado.');
      return;
    }

    const publicUrl = `${window.location.origin}/cotacao/${quotation.token}`;
    const message = encodeURIComponent(
      `Olá! Segue o link para preenchimento da cotação *${quotation.title}*: \n\n${publicUrl}`
    );

    // Copia o link para a área de transferência e abre o WhatsApp
    navigator.clipboard.writeText(publicUrl);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between text-sm text-slate-500 pb-2 border-b border-slate-100">
        <Link href="/" className="hover:text-indigo-600 transition font-medium">
          ← Voltar para a Página Principal
        </Link>
      </div>

      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Cotações</h1>
          <p className="text-sm text-slate-500">Visualize cotações em andamento, edite, exclua ou envie para representantes.</p>
        </div>
        <div>
          <Link
            href="/cotacoes/nova"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition shadow-sm text-sm inline-block"
          >
            + Nova Cotação
          </Link>
        </div>
      </div>

      {/* Listagem de Cotações */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="font-bold text-slate-700 text-sm">Cotações Cadastradas</h2>

        {loading ? (
          <p className="text-sm text-slate-400 py-6 text-center">Carregando cotações...</p>
        ) : quotations.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-sm text-slate-400">Nenhuma cotação cadastrada no momento.</p>
            <Link
              href="/cotacoes/nova"
              className="inline-block text-xs bg-indigo-50 text-indigo-600 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
            >
              Criar minha primeira cotação
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                  <th className="p-3 font-semibold">Título</th>
                  <th className="p-3 font-semibold">Representante / Distribuidora</th>
                  <th className="p-3 font-semibold text-center">Início</th>
                  <th className="p-3 font-semibold text-center">Término</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                  <th className="p-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">{q.title}</td>
                    <td className="p-3 text-slate-600">{q.supplierName || 'Não informado'}</td>
                    <td className="p-3 text-center text-slate-500">{q.startDate ? new Date(q.startDate).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-center text-slate-500">{q.endDate ? new Date(q.endDate).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {q.status || 'Aberta'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/cotacoes/editar/${q.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium text-xs bg-amber-50 px-2.5 py-1.5 rounded-md transition"
                      >
                        ✏️ Editar
                      </Link>
                      <button 
                        onClick={() => handleDeleteQuotation(q.id, q.title)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 px-2.5 py-1.5 rounded-md transition"
                      >
                        🗑️ Excluir
                      </button>
                      <button 
                        onClick={() => handleShareWhatsApp(q)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-2.5 py-1.5 rounded-md transition"
                      >
                        📤 WhatsApp / Copiar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}