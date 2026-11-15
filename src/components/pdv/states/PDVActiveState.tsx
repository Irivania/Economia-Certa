"use client";

import React from "react";
import { PDVProductSearch } from "@/components/pdv/PDVProductSearch";
import { PDVCartList } from "@/components/pdv/PDVCartList";
import { PDVCheckoutPanel } from "@/components/pdv/PDVCheckoutPanel";
import { POSPromoBanner } from "@/components/pdv/POSPromoBanner";
import { usePDV } from "@/hooks/usePDV";
import { ShoppingCart, ScanBarcode, Sparkles } from "lucide-react";

interface PDVActiveStateProps {
  pdv: ReturnType<typeof usePDV>;
  isDarkMode: boolean;
}

export const PDVActiveState = React.memo(function PDVActiveState({
  pdv,
  isDarkMode,
}: PDVActiveStateProps) {
  const surface = isDarkMode
    ? "bg-[#151522] border-slate-800"
    : "bg-white border-slate-200";

  const muted = isDarkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-4 h-full min-h-0 overflow-y-auto lg:overflow-hidden pb-1">
      {/* COLUNA ESQUERDA: PRODUTOS E CARRINHO */}
      <div className="lg:col-span-7 flex flex-col gap-3 min-h-0 lg:h-full">
        {/* BUSCA DE PRODUTOS */}
        <section
          className={`shrink-0 rounded-2xl border overflow-hidden transition-colors duration-200 ${surface}`}
        >
          <div
            className={`px-4 pt-4 pb-2 flex items-center justify-between ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDarkMode
                    ? "bg-purple-500/15 text-purple-400"
                    : "bg-purple-50 text-purple-700"
                }`}
              >
                <ScanBarcode className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold tracking-tight">
                  Lançamento de produtos
                </h2>
                <p className={`text-[10px] mt-0.5 ${muted}`}>
                  Pesquise pelo nome ou código de barras
                </p>
              </div>
            </div>

            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${
                isDarkMode
                  ? "bg-purple-500/10 text-purple-300"
                  : "bg-purple-50 text-purple-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Busca inteligente
            </span>
          </div>

          <div className="px-4 pb-4">
            <PDVProductSearch
              searchTerm={pdv.searchTerm}
              setSearchTerm={pdv.setSearchTerm}
              filteredProducts={pdv.filteredProducts}
              onSelectProduct={pdv.handleAddToCart}
              inputRef={pdv.searchInputRef}
              onKeyDown={pdv.handleKeyDown}
              isDarkMode={isDarkMode}
              isOperator={pdv.isOperator}
            />
          </div>
        </section>

        {/* CARRINHO / BANNER */}
        <section
          className={`flex-1 min-h-0 rounded-2xl border overflow-hidden flex flex-col transition-colors duration-200 ${surface}`}
        >
          {/* CABEÇALHO DO CARRINHO */}
          <div
            className={`shrink-0 px-4 py-3 border-b flex items-center justify-between ${
              isDarkMode ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDarkMode
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
              </div>

              <div>
                <h2
                  className={`text-sm font-extrabold ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Carrinho de compras
                </h2>

                <p className={`text-[10px] mt-0.5 ${muted}`}>
                  Produtos da venda atual
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${
                isDarkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {pdv.cart.length} {pdv.cart.length === 1 ? "ITEM" : "ITENS"}
            </span>
          </div>

          {/* CONTEÚDO DINÂMICO */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {pdv.cart.length === 0 ? (
              <div className="h-full min-h-[180px] flex items-center justify-center p-3">
                <div className="w-full max-w-3xl">
                  <POSPromoBanner
                    isDarkMode={isDarkMode}
                    companyName="Melo Perfumaria"
                    bannerUrl={null}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 min-h-full flex flex-col">
                <PDVCartList
                  cart={pdv.cart}
                  onRequestAction={pdv.requestManagerAction}
                  editingProductId={pdv.editingProductId}
                  editPrice={pdv.editPrice}
                  setEditPrice={pdv.setEditPrice}
                  editQty={pdv.editQty}
                  setEditQty={pdv.setEditQty}
                  onSaveEdit={pdv.handleSaveItemEdit}
                  onCancelEdit={() => pdv.setEditingProductId(null)}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* COLUNA DIREITA: CHECKOUT */}
      <div className="lg:col-span-5 flex flex-col min-h-0 lg:h-full">
        <section
          className={`flex-1 min-h-0 rounded-2xl border overflow-y-auto shadow-sm transition-colors duration-200 ${surface}`}
        >
          <div
            className={`px-4 py-3 border-b ${
              isDarkMode ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <h2
              className={`text-sm font-extrabold ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              Resumo da venda
            </h2>

            <p className={`text-[10px] mt-1 ${muted}`}>
              Cliente, convênios e pagamento
            </p>
          </div>

          <div className="p-3 sm:p-4">
            <PDVCheckoutPanel
              partners={pdv.partners}
              selectedPartnerId={pdv.selectedPartnerId}
              setSelectedPartnerId={pdv.setSelectedPartnerId}
              customerName={pdv.customerName}
              setCustomerName={pdv.setCustomerName}
              customerDocument={pdv.customerDocument}
              setCustomerDocument={pdv.setCustomerDocument}
              totalCart={pdv.totalCart}
              loading={pdv.loading}
              onCheckout={pdv.handleCheckout}
              isDarkMode={isDarkMode}
            />
          </div>
        </section>
      </div>
    </div>
  );
});
