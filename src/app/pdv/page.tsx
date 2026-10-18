'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { ManagerAuthModal } from '@/components/pdv/ManagerAuthModal';
import { PDVProductSearch } from '@/components/pdv/PDVProductSearch';
import { PDVCartList } from '@/components/pdv/PDVCartList';
import { PDVCheckoutPanel } from '@/components/pdv/PDVCheckoutPanel';
import { usePDV } from '@/hooks/usePDV';
import { Lock, Coffee, ShoppingCart } from 'lucide-react';

export default function PDVPage() {
  const { isDarkMode } = useTheme();
  const {
    cart,
    partners,
    searchTerm,
    setSearchTerm,
    isRegisterOpen,
    isPaused,
    registerLoading,
    isOperator,
    paymentMethod,
    setPaymentMethod,
    selectedPartnerId,
    setSelectedPartnerId,
    customerName,
    setCustomerName,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setPendingAction,
    editingProductId,
    setEditingProductId,
    editPrice,
    setEditPrice,
    editQty,
    setEditQty,
    searchInputRef,
    filteredProducts,
    totalCart,
    handleAddToCart,
    requestManagerAction,
    handleManagerAuthorized,
    handleSaveItemEdit,
    handleKeyDown,
    handleCheckout,
  } = usePDV();

  if (registerLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <p className="text-xs font-bold animate-pulse">A verificar estado do turno de caixa...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AppHeader
        title="PDV - Frente de Caixa Profissional"
        subtitle="Atendimento ágil, convênios e controlo operacional."
        onOpenCmd={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20 space-y-6">
        <div className="flex justify-between items-center">
          {!isOperator ? (
            <Link href="/" className="font-bold text-xs bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-flex items-center gap-2">
              &larr; Voltar ao Início
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              ⚡ Terminal de Caixa Exclusivo
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link href="/pdv/caixa" className="font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-md inline-flex items-center gap-1.5 transition">
              <Coffee className="w-3.5 h-3.5" /> Gestão de Turno / Pausa / Fecho 💵
            </Link>
          </div>
        </div>

        {/* SE O CAIXA ESTIVER FECHADO, EXIBIR AVISO OBRIGATÓRIO PARA ABRIR O TURNO */}
        {!isRegisterOpen ? (
          <div className={`max-w-md mx-auto p-10 text-center rounded-3xl border shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-bold border border-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black uppercase tracking-wider">Caixa Fechado</h3>
              <p className="text-xs opacity-60">Para aceder ao painel de vendas e passar compras, é obrigatório abrir o turno com o fundo de troco.</p>
            </div>
            <Link
              href="/pdv/caixa"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition inline-flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Ir para Abertura de Caixa &rarr;
            </Link>
          </div>
        ) : isPaused ? (
          /* SE O CAIXA ESTIVER EM PAUSA (ALMOÇO/CAFÉ) */
          <div className={`max-w-md mx-auto p-12 text-center rounded-3xl border shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Coffee className="w-12 h-12 mx-auto text-amber-500 animate-bounce" />
            <h3 className="text-base font-black uppercase tracking-wider">Caixa Pausado (Intervalo)</h3>
            <p className="text-xs opacity-60">O atendimento está temporariamente suspenso para almoço/café.</p>
            <Link
              href="/pdv/caixa"
              className="inline-block mt-4 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg transition"
            >
              Retornar ao Atendimento na Gestão de Caixa &rarr;
            </Link>
          </div>
        ) : (
          /* CAIXA ABERTO E ATIVO - EXIBE EXCLUSIVAMENTE O PAINEL DE VENDAS */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PDVProductSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredProducts={filteredProducts}
              onSelectProduct={(p) => handleAddToCart(p)}
              inputRef={searchInputRef}
              onKeyDown={handleKeyDown}
              isDarkMode={isDarkMode}
              isOperator={isOperator}
            />

            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <PDVCartList
                cart={cart}
                onRequestAction={requestManagerAction}
                editingProductId={editingProductId}
                editPrice={editPrice}
                setEditPrice={setEditPrice}
                editQty={editQty}
                setEditQty={setEditQty}
                onSaveEdit={handleSaveItemEdit}
                onCancelEdit={() => setEditingProductId(null)}
              />

              <PDVCheckoutPanel
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                partners={partners}
                selectedPartnerId={selectedPartnerId}
                setSelectedPartnerId={setSelectedPartnerId}
                customerName={customerName}
                setCustomerName={setCustomerName}
                totalCart={totalCart}
                loading={loading}
                onCheckout={handleCheckout}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}
      </main>

      <ManagerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onAuthorized={handleManagerAuthorized}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}