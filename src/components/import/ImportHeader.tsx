'use client';

interface ImportHeaderProps {
  rawImportText: string;
  onTextChange: (text: string) => void;
  isProcessing: boolean;
  progress: number;
  onProcessImport: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportHeader({
  rawImportText,
  onTextChange,
  isProcessing,
  progress,
  onProcessImport,
  onFileUpload,
}: ImportHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-bold text-indigo-700 flex items-center gap-2 mb-1">
          <span className="text-xl">🔄</span> Central de Importação Inteligente
        </h2>
        <p className="text-xs text-indigo-500 font-medium">
          Importe ficheiros (.xlsx, .xls, .csv) ou cole os dados. O sistema valida os produtos já cadastrados e separa os novos para cadastro rápido.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer transition flex items-center gap-2">
          📁 Carregar Ficheiro (Excel / CSV)
          <input type="file" accept=".xlsx, .xls, .csv, .txt" onChange={onFileUpload} className="hidden" />
        </label>
        <span className="text-xs text-slate-400 font-medium">ou cole os dados abaixo:</span>
      </div>

      <textarea
        rows={4}
        placeholder="Cole aqui os dados (Ex: 7891001234567  Shampoo Anticaspa...)"
        value={rawImportText}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={isProcessing}
        className="w-full p-4 text-xs border border-indigo-100 rounded-lg bg-white text-slate-600 font-mono disabled:opacity-50 focus:outline-none focus:border-indigo-300"
      />
      
      <div className="flex items-center gap-3">
        <button
          onClick={onProcessImport}
          disabled={isProcessing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? `Analisando... (${progress}%)` : 'Analisar e Cruzar Dados'}
        </button>
      </div>

      {isProcessing && (
        <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden mt-4">
          <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}