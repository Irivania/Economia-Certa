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
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25',
    'emerald-light': 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25',
    'blue-light': 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
    'purple-light': 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
  }[themeColor];

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="Gestão de Fornecedores"
        subtitle="Diretório avançado de parceiros B2B da empresa."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 pb-20 relative z-20 space-y-8">
        {fetchingCnpj && (
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse text-center shadow-lg">
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

        <div className={`p-8 rounded-3xl shadow-2xl border space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/80'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-500/10">
            <div>
              <h2 className="text-base font-black tracking-tight">Diretório de Fornecedores e Conexões B2B</h2>
              <p className="text-xs opacity-60 mt-0.5">Conecte a Melo Perfumaria aos canais digitais dos representantes.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Pesquisar fornecedor ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 text-xs border rounded-xl outline-none w-full sm:w-64 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
              <span className="text-xs font-mono font-bold opacity-70 bg-slate-500/10 px-3 py-2 rounded-xl whitespace-nowrap">
                {filteredSuppliers.length} ativos
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-16 opacity-60 text-xs font-medium">A carregar diretório de parceiros...</p>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-semibold">{error}</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-500/20 rounded-3xl">
              <p className="opacity-60 text-xs font-medium">Nenhum fornecedor encontrado com os critérios informados.</p>
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
        <div className="fixed bottom-5 right-5 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold transition-all z-50">
          {toastMessage}
        </div>
      )}

      <CommandMenu isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDarkMode={isDarkMode} latestQuotationId={latestQuotationId} />
    </div>
  );
}