'use client';

import React from 'react';
import { PDVProductSearch } from '@/components/pdv/PDVProductSearch';
import { PDVCartList } from '@/components/pdv/PDVCartList';
import { PDVCheckoutPanel } from '@/components/pdv/PDVCheckoutPanel';
import { POSPromoBanner } from '@/components/pdv/POSPromoBanner'; // 🌸 Nosso novo banner dinâmico
import { usePDV } from '@/hooks/usePDV';

interface PDVActiveStateProps {
  pdv: ReturnType<typeof usePDV>;
  isDarkMode: boolean;
}

export const PDVActiveState = React.memo(function PDVActiveState({ pdv, isDarkMode }: PDVActiveStateProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full items-start overflow-hidden pb-1">
      
      {/* Coluna Esquerda (7 Colunas): Busca de Produtos + Carrinho / Banner Dinâmico */}
      <div className="lg:col-span-7 flex flex-col space-y-3 h-full overflow-hidden">
        
        {/* Componente de Busca / Lançamento de Produtos */}
        <div className={`p-4 rounded-3xl border shadow-lg shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
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

        {/* Área Dinâmica: Se o carrinho estiver vazio, exibe o Banner de Marca / Promoção. Se tiver itens, exibe a lista do carrinho. */}
        <div className={`rounded-3xl border shadow-lg flex-1 overflow-y-auto flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {pdv.cart.length === 0 ? (
            <POSPromoBanner 
              isDarkMode={isDarkMode} 
              companyName="Melo Perfumaria"
              bannerUrl={null} // Aqui poderá futuramente passar a URL vinda das configurações da empresa
            />
          ) : (
            <div className="p-4 flex-1 flex flex-col">
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
      </div>

      {/* Coluna Direita (5 Colunas): Painel de Checkout / F9 */}
      <div className="lg:col-span-5 flex flex-col h-full">
        <PDVCheckoutPanel
          partners={pdv.partners}
          selectedPartnerId={pdv.selectedPartnerId}
          setSelectedPartnerId={pdv.setSelectedPartnerId}
          customerName={pdv.customerName}
          setCustomerName={pdv.setCustomerName}
          totalCart={pdv.totalCart}
          loading={pdv.loading}
          onCheckout={pdv.handleCheckout}
          isDarkMode={isDarkMode}
        />
      </div>

    </div>
  );
});