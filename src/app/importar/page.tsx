'use client';

import { useState } from 'react';

interface ImportErrorItem {
  row: number;
  error: string;
}

interface SuccessfulImportItem {
  description: string;
  unit: string;
  internalCode?: string;
  brand?: string;
  costPrice?: string;
  salePrice?: string;
}

interface ImportResponse {
  totalProcessed: number;
  successfulImports: SuccessfulImportItem[];
  errors: ImportErrorItem[];
  savedToDatabaseCount?: number;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UUID real e oficial da Melo Perfumaria
  const companyId = '915a8bc1-5db7-4605-93a9-b78090e75679';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo Excel ou CSV.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', companyId); // Vincula diretamente à Melo Perfumaria

      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao processar o arquivo no servidor.');
      }

      const data: ImportResponse = await response.json();
      setResult(data);
    } catch {
      setError('Erro ao enviar ou processar o arquivo. Verifique o formato.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📥 Importação de Produtos</h1>
            <p className="text-slate-600 text-sm">Melo Perfumaria - Cadastro em massa via planilha.</p>
          </div>
          <a
            href="/produtos"
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
          >
            Ver Catálogo &rarr;
          </a>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-slate-50">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-2">Formatos aceitos: .XLSX, .XLS, .CSV</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando e salvando no banco...' : 'Validar e Importar para a Melo Perfumaria'}
          </button>
        </form>

        {result && (
          <div className="mt-8 border-t border-slate-200 pt-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800">📊 Relatório da Importação</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <p className="text-sm text-slate-500 font-medium">Total Processado</p>
                <p className="text-2xl font-bold text-slate-800">{result.totalProcessed}</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Salvos no Banco</p>
                <p className="text-2xl font-bold text-green-800">{result.savedToDatabaseCount ?? result.successfulImports.length}</p>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Erros</p>
                <p className="text-2xl font-bold text-red-800">{result.errors.length}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 text-sm mb-2">Inconsistências encontradas:</h3>
                <ul className="list-disc list-inside text-xs text-amber-700 space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>Linha {err.row}: {err.error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <a
                href="/produtos"
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Acessar Produtos Cadastrados &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}