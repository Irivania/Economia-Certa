'use client';

import { ShieldCheck } from 'lucide-react';

interface NotaUploadFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onUpload: (e: React.FormEvent) => void;
  loading: boolean;
  successMsg: string | null;
  isDarkMode: boolean;
}

export function NotaUploadForm({
  setFile,
  onUpload,
  loading,
  successMsg,
  isDarkMode,
}: NotaUploadFormProps) {
  return (
    <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h2 className="text-sm font-black mb-1 uppercase tracking-wider">Importação Rápida por XML da NF-e</h2>
      <p className="text-xs opacity-60 mb-6">Carregue o ficheiro XML fornecido pelo fornecedor para leitura automática de itens, custos, descontos e boletos financeiros.</p>
      
      <form onSubmit={onUpload} className="flex flex-col sm:flex-row items-center gap-4">
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
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> {successMsg}
        </div>
      )}
    </div>
  );
}