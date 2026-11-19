"use client";

import React from "react";
import { PDVProductSearch } from "@/components/pdv/PDVProductSearch";
import { PDVCartList } from "@/components/pdv/PDVCartList";
import { PDVCheckoutPanel } from "@/components/pdv/PDVCheckoutPanel";
import { POSPromoBanner } from "@/components/pdv/POSPromoBanner";
import { usePDV } from "@/hooks/usePDV";
import { useProductSearchKeyboard } from "@/hooks/pdv/useProductSearchKeyboard";
import { useCheckoutPanel } from "@/hooks/pdv/useCheckoutPanel";
import { ShoppingCart, ScanBarcode, Receipt } from "lucide-react";

interface PDVActiveStateProps {
  pdv: ReturnType<typeof usePDV>;
  isDarkMode: boolean;
  productSearchKeyboard: ReturnType<typeof useProductSearchKeyboard>;
  checkoutPanel: ReturnType<typeof useCheckoutPanel>;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function CardHeader({
  icon,
  title,
  subtitle,
  right,
  isDarkMode,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={`shrink-0 flex items-center justify-between gap-3 border-b px-5 py-4 ${
        isDarkMode ? "border-slate-800" : "border-slate-100"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${
            isDarkMode
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              : "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h2
            className={`truncate text-sm font-semibold tracking-tight ${isDarkMode ? "text-slate-50" : "text-slate-900"}`}
          >
            {title}
          </h2>
          <p
            className={`truncate text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {right}
    </div>
  );
}

export const PDVActiveState = React.memo(function PDVActiveState({
  pdv,
  isDarkMode,
  productSearchKeyboard,
  checkoutPanel,
}: PDVActiveStateProps) {
  const card = `rounded-2xl border transition-colors duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] ${
    isDarkMode
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-slate-200/80"
  }`;
  const itemCount = pdv.cart.length;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-y-auto pb-1 lg:grid-cols-[minmax(0,1fr)_400px] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_440px]">
      {/* ESQUERDA — busca + carrinho */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:h-full">
        <section className={`shrink-0 ${card}`}>
          <CardHeader
            isDarkMode={isDarkMode}
            icon={<ScanBarcode className="h-[18px] w-[18px]" />}
            title="Lançamento de produtos"
            subtitle="Pesquise pelo nome ou leia o código de barras"
            right={
              <span
                className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset sm:inline-flex ${
                  isDarkMode
                    ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                }`}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Leitor pronto
              </span>
            }
          />
          <div className="p-5">
            <PDVProductSearch
              searchTerm={pdv.searchTerm}
              setSearchTerm={pdv.setSearchTerm}
              filteredProducts={pdv.filteredProducts}
              inputRef={pdv.searchInputRef}
              selectedIndex={productSearchKeyboard.selectedIndex}
              setSelectedIndex={productSearchKeyboard.setSelectedIndex}
              itemRefs={productSearchKeyboard.itemRefs}
              onKeyDown={productSearchKeyboard.handleKeyDown}
              selectProduct={productSearchKeyboard.selectProduct}
              isDarkMode={isDarkMode}
              isOperator={pdv.isOperator}
            />
          </div>
        </section>

        <section
          className={`flex min-h-[320px] flex-1 flex-col overflow-hidden lg:min-h-0 ${card}`}
        >
          <CardHeader
            isDarkMode={isDarkMode}
            icon={<ShoppingCart className="h-[18px] w-[18px]" />}
            title="Carrinho"
            subtitle="Produtos da venda atual"
            right={
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-200 ring-slate-700"
                    : "bg-slate-100 text-slate-700 ring-slate-200"
                }`}
              >
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </span>
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {itemCount === 0 ? (
              <div className="flex h-full min-h-[220px] items-center justify-center p-5">
                <div className="w-full max-w-3xl">
                  <POSPromoBanner
                    isDarkMode={isDarkMode}
                    companyName="Melo Perfumaria"
                    bannerUrl={null}
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-full flex-col p-4 sm:p-5">
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

      {/* DIREITA — resumo e pagamento (fixo) */}
      <aside className="flex min-h-0 min-w-0 flex-col lg:h-full">
        <section
          className={`flex flex-1 min-h-0 flex-col overflow-hidden ${card}`}
        >
          <div
            className={`shrink-0 px-5 py-5 ${
              isDarkMode
                ? "bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800"
                : "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-emerald-300/90">
              <Receipt className="h-4 w-4" /> Resumo da venda
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-400">
              Total a pagar
            </p>
            <p className="mt-0.5 text-4xl font-semibold tracking-tight tabular-nums text-white">
              {brl.format(Number(pdv.totalCart) || 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400 tabular-nums">
              {itemCount}{" "}
              {itemCount === 1 ? "item no carrinho" : "itens no carrinho"}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
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
              checkoutPanel={checkoutPanel}
            />
          </div>
        </section>
      </aside>
    </div>
  );
});
