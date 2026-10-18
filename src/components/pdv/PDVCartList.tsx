'use client';

interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

interface PDVCartListProps {
  cart: CartItem[];
  onRequestAction: (type: 'REMOVE' | 'EDIT', productId: string) => void;
  editingProductId: string | null;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editQty: string;
  setEditQty: (val: string) => void;
  onSaveEdit: (productId: string) => void;
  onCancelEdit: () => void;
}

export function PDVCartList({
  cart,
  onRequestAction,
  editingProductId,
  editPrice,
  setEditPrice,
  editQty,
  setEditQty,
  onSaveEdit,
  onCancelEdit,
}: PDVCartListProps) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-wider border-b pb-3 border-slate-500/10">Carrinho da Venda</h3>

      <div className="divide-y divide-slate-500/10 max-h-60 overflow-y-auto my-3 font-mono text-xs pr-1">
        {cart.length === 0 ? (
          <div className="text-center py-12 opacity-40 font-sans space-y-2">
            <div className="text-3xl">🛒</div>
            <p className="text-xs font-bold">Caixa Livre</p>
            <p className="text-[10px]">Aguardando leitura de produtos...</p>
          </div>
        ) : (
          cart.map((item) => {
            const isEditing = editingProductId === item.productId;

            return (
              <div key={item.productId} className="py-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-500/20">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.description} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">📦</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold font-sans text-xs line-clamp-1">{item.description}</div>
                      <div className="text-[10px] opacity-60 font-bold text-indigo-600 dark:text-indigo-400">
                        {item.quantity} un x R$ {item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-xs shrink-0">
                    R$ {item.subtotal.toFixed(2)}
                  </div>
                </div>

                {!isEditing ? (
                  <div className="flex justify-end gap-3 text-[10px]">
                    <button
                      type="button"
                      onClick={() => onRequestAction('EDIT', item.productId)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      ⚙️ Alterar (Gerente)
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestAction('REMOVE', item.productId)}
                      className="text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] opacity-70 block">Preço (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-950 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] opacity-70 block">Qtd</span>
                        <input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-950 font-bold text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-2 py-1 text-[10px] opacity-70"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveEdit(item.productId)}
                        className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-extrabold rounded"
                      >
                        Salvar ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}