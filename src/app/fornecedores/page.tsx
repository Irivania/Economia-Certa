'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { useSuppliers } from '@/hooks/useSuppliers';
import { getCompanyId } from '@/lib/companySession';

export default function SuppliersPage() {
  const { isDarkMode, mounted, themeColor } = useTheme();
  const companyId = getCompanyId();
  const latestQuotationId = '';
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const {
    connections, loading, error, searchTerm, setSearchTerm,
    fetchingCep, fetchingCnpj, editingId, name, setName, cnpj, handleCnpjChange,
    cep, handleCepChange, address, setAddress, contactPerson, setContactPerson,
    phone, handlePhoneChange, email, setEmail, submitting, toastMessage,
    handleSubmit, handleEdit, handleDelete, resetForm, filteredSuppliers,
    handleConnectSupplier, handleUpdateConnection
  } = useSuppliers(companyId);

  const themeButtonStyles = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',
    'emerald-light': 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
    'blue-light': 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20',
    'purple-light': 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20',
  }[themeColor];

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Gestão de Fornecedores"
        subtitle="Diretório avançado de parceiros B2B da empresa."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-6">
        {fetchingCnpj && (
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold animate-pulse text-center shadow-xs">
            🔍 A consultar dados do CNPJ na Receita Federal...
          </div>
        )}

        <SupplierForm
          editingId={editingId} name={name} setName={setName} cnpj={cnpj}
          handleCnpjChange={handleCnpjChange} cep={cep} handleCepChange={handleCepChange}
          fetchingCep={fetchingCep} address={address} setAddress={setAddress}
          contactPerson={contactPerson} setContactPerson={setContactPerson}
          phone={phone} handlePhoneChange={handlePhoneChange} email={email} setEmail={setEmail}
          submitting={submitting} onSubmit={handleSubmit}
          onReset={resetForm} isDarkMode={isDarkMode} themeButtonStyles={themeButtonStyles}
        />

        <div className={`p-6 sm:p-7 rounded-xl shadow-xs border space-y-5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/90'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold tracking-tight">Diretório de Fornecedores e Conexões B2B</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Conecte a Melo Perfumaria aos canais digitais dos representantes.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Pesquisar fornecedor ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3.5 py-2 text-xs border rounded-lg outline-none w-full sm:w-64 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950/85 border-slate-800 text-slate-100 focus:border-indigo-500' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-2 rounded-lg whitespace-nowrap">
                {filteredSuppliers.length} ativos
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-12 text-xs text-slate-500 font-medium">A carregar diretório de parceiros...</p>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs font-semibold">{error}</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-xs text-slate-500 font-medium">Nenhum fornecedor encontrado com os critérios informados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.map((sup) => {
                const conn = connections.find(c => c.supplierId === sup.id);
                const rawStatus = conn?.status?.toUpperCase();
                const connectionStatus = rawStatus === 'ACCEPTED' ? 'ACCEPTED' : (rawStatus === 'PENDING' || rawStatus === 'PENDENTE') ? 'PENDING' : 'NONE';

                return (
                  <SupplierCard
                    key={sup.id}
                    supplier={sup}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDarkMode={isDarkMode}
                    themeColor={themeColor}
                    connectionStatus={connectionStatus}
                    initiatedBy={conn?.initiatedBy}
                    connectionId={conn?.id}
                    onConnect={handleConnectSupplier}
                    onUpdateConnection={handleUpdateConnection}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-xl text-xs font-semibold transition-all z-50">
          {toastMessage}
        </div>
      )}

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={latestQuotationId} />
    </div>
  );
}