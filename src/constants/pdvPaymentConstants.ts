export type PaymentMethodId = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CONVENIO';

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  label: string;
  shortcut: string;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'CASH', label: 'Dinheiro', shortcut: '1' },
  { id: 'PIX', label: 'PIX', shortcut: '2' },
  { id: 'CREDIT_CARD', label: 'Cartão de Crédito', shortcut: '3' },
  { id: 'DEBIT_CARD', label: 'Cartão de Débito', shortcut: '4' },
  { id: 'CONVENIO', label: 'Convênio', shortcut: '5' },
];

export const QUICK_CASH_AMOUNTS = [10, 20, 50, 100, 200] as const;

export const PDV_PAYMENT_TEXTS = {
  modalTitle: "Gestão de Pagamento & Troco 💵",
  modalSubtitle: "Use as Setas ↕ ou números [1-5] para escolher e Enter para ir ao valor.",
  totalSale: "Total da Venda",
  remaining: "Restante",
  change: "Troco",
  selectMethodHeader: "Selecione a Forma de Pagamento (Pressione Enter para Avançar)",
  amountLabel: (methodName: string) => `2. Informe o Valor para ${methodName} (Enter para Adicionar)`,
  quickCashLabel: "Notas Rápidas:",
  exactCash: (amount: string) => `Exato (R$ ${amount})`,
  addSplitButton: "Adicionar",
  addedSplitsHeader: (count: number) => `Formas Adicionadas (${count})`,
  emptySplitsText: "Nenhum pagamento adicionado ainda.",
  cancelButton: "Cancelar",
  finishButton: (change: string) => `[F10] Concluir Venda & Imprimir (Troco: R$ ${change})`,
  ariaClose: "Fechar modal de pagamento",
  ariaRemoveSplit: (method: string) => `Remover pagamento ${method}`,
} as const;