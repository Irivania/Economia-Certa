'use client';

import React from 'react';
import { PDVProductSearch } from '@/components/pdv/PDVProductSearch';
import { PDVCartList } from '@/components/pdv/PDVCartList';
import { PDVCheckoutPanel } from '@/components/pdv/PDVCheckoutPanel';
import { usePDV } from '@/hooks/usePDV';

interface PDVActiveStateProps {
  pdv: ReturnType<typeof usePDV>;
  isDarkMode: boolean;
}

export const PDVActiveState = React.memo(function PDVActiveState({ pdv, isDarkMode }: PDVActiveStateProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
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