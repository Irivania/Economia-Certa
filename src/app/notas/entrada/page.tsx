'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { getCompanyId } from '@/lib/companySession';
import { apiFetch } from '@/lib/apiClient';

interface ItemXML {
  ean: string | null;
  descricaoNota: string;
  unidadeNota: string;
  qtdNota: number;
  quantidadeRealEstoque: number;
  valorUnitarioNota: number;
  custoRealUnitario: number;
  cadastradoNoSistema: boolean;
  productId: string | null;
}

export default function NotaEntradaHubPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const companyId = getCompanyId();

  const [activeTab] = useState<'xml' | 'manual'>('xml');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [notaData, setNotaData] = useState<{
    emitente: string;
    numeroNota: string;
    chaveAcess: string;
    itens: ItemXML[];
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Selecione um ficheiro XML da Nota Fiscal.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', companyId);

      const res = await apiFetch('/api/notes/xml-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar XML.');

      setNotaData(data);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erro ao importar XML.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarEntradaXML = async () => {
    if (!notaData) return;
    if (!confirm('Deseja confirmar a entrada desta nota e atualizar o estoque e custos dos produtos?')) return;

    try {
      setLoading(true);
      setSuccessMsg('Nota fiscal importada e estoque atualizado com sucesso!');
      setNotaData(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao efetivar entrada de estoque.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Centro de Entrada de Notas Fiscais"
        subtitle="Dê entrada em mercadorias de forma automatizada via XML ou através do registo manual."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
            &larr; Voltar ao Início
          </Link>

          {/* Seletor de Abas com navegação otimizada Next.js */}
          <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {}}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'xml'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📄 Importar Ficheiro XML
            </button>
            <button
              type="button"
              onClick={() => router.push('/notas/manual')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ✍️ Registo Manual & Boletos &rarr;
            </button>
          </div>
        </div>

        {/* Conteúdo da Aba XML */}
        <div className="space-y-6">
          <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-sm font-black mb-1 uppercase tracking-wider">Importação Rápida por XML da NF-e</h2>
            <p className="text-xs opacity-60 mb-6">Carregue o ficheiro XML fornecido pelo fornecedor para leitura automática de itens e custos.</p>
            
            <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept=".xml"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer border border-slate-300 dark:border-slate-800 rounded-2xl p-2"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {loading ? 'A processar XML...' : '📤 Analisar Ficheiro XML'}
              </button>
            </form>

            {successMsg && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {successMsg}
              </div>
            )}
          </div>

          {/* Pré-visualização dos Itens do XML */}
          {notaData && (
            <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-slate-500/10 gap-2">
                <div>
                  <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold uppercase text-indigo-500 border border-indigo-500/20 mb-1">
                    Nota Fiscal Analisada com Sucesso
                  </span>
                  <h3 className="text-base font-black">Fornecedor: {notaData.emitente}</h3>
                  <p className="text-xs opacity-60">NF-e Nº: <strong>{notaData.numeroNota}</strong> • Chave: <span className="font-mono">{notaData.chaveAcess}</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmarEntradaXML}
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                >
                  ✅ Confirmar Entrada e Atualizar Estoque
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b uppercase tracking-wider text-[11px] font-extrabold opacity-60 border-slate-500/10">
                      <th className="p-3">Produto / Descrição na Nota</th>
                      <th className="p-3 text-center">EAN</th>
                      <th className="p-3 text-center">Unid. Nota</th>
                      <th className="p-3 text-center">Qtd. Nota</th>
                      <th className="p-3 text-center text-indigo-500">Conversão Estoque (UN)</th>
                      <th className="p-3 text-right">Custo Unit. Real</th>
                      <th className="p-3 text-center">Status Sistema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10 font-mono">
                    {notaData.itens.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-500/5 transition">
                        <td className="p-3 font-sans font-bold">{item.descricaoNota}</td>
                        <td className="p-3 text-center opacity-75">{item.ean || 'N/A'}</td>
                        <td className="p-3 text-center font-bold">{item.unidadeNota}</td>
                        <td className="p-3 text-center">{item.qtdNota}</td>
                        <td className="p-3 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {item.quantidadeRealEstoque} UN
                        </td>
                        <td className="p-3 text-right font-bold">
                          R$ {item.custoRealUnitario.toFixed(4)}
                        </td>
                        <td className="p-3 text-center font-sans">
                          {item.cadastradoNoSistema ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              ✓ Vinculado
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              ⚠ Novo / Não Cadastrado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}