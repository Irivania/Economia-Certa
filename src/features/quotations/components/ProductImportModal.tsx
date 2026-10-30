'use client';

import { ProductImportModalProps } from './import/types';
import { useProductImport } from './import/useProductImport';
import { ImportHeader } from './import/ImportHeader';
import { ImportResultsList } from './import/ImportResultsList';
import { useTheme } from '@/context/ThemeContext';

export function ProductImportModal({ products, onImportComplete }: ProductImportModalProps) {
  const { isDarkMode } = useTheme();
  
  const {
    rawImportText,
    itensReconhecidos,
    itensPendentes,
    isProcessing,
    progress,
    handleTextChange,
    handleProcessImport,
    handleFileUpload,
    handleUpdatePendingItem,
    handleFinalizarImportacao,
  } = useProductImport(products, onImportComplete);

  return (
    <div className={`rounded-2xl border p-6 space-y-6 transition-all ${
      isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50/60 border-slate-200/80 text-slate-900'
    }`}>
      <ImportHeader
        rawImportText={rawImportText}
        onTextChange={handleTextChange}
        isProcessing={isProcessing}
        progress={progress}
        onProcessImport={handleProcessImport}
        onFileUpload={handleFileUpload}
      />

      {(itensReconhecidos.length > 0 || itensPendentes.length > 0) && !isProcessing && (
        <ImportResultsList
          itensReconhecidos={itensReconhecidos}
          itensPendentes={itensPendentes}
          onUpdatePendingItem={handleUpdatePendingItem}
          onFinalizarImportacao={handleFinalizarImportacao}
        />
      )}
    </div>
  );
}