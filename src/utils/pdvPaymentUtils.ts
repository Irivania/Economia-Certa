const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  const safeVal = Number.isFinite(value) ? value : 0;
  return currencyFormatter.format(safeVal);
}

export function formatMethodName(method: string): string {
  switch (method) {
    case 'CASH': return 'Dinheiro';
    case 'PIX': return 'PIX';
    case 'CREDIT_CARD': return 'Cartão de Crédito';
    case 'DEBIT_CARD': return 'Cartão de Débito';
    case 'CONVENIO': return 'Convênio';
    default: return method;
  }
}

export function calculatePaymentTotals(splits: Array<{ method: string; amount: number }>, totalCart: number) {
  const safeTotalCart = Number.isFinite(totalCart) ? Math.max(0, totalCart) : 0;
  
  const totalPaid = splits.reduce((acc, s) => {
    const amt = Number(s.amount);
    return acc + (Number.isFinite(amt) ? amt : 0);
  }, 0);

  const remainingAmount = Math.max(0, safeTotalCart - totalPaid);

  const cashSplitsTotal = splits
    .filter(s => s.method === 'CASH')
    .reduce((acc, s) => acc + s.amount, 0);

  const nonCashPaidTotal = totalPaid - cashSplitsTotal;
  const cashNeededForRemaining = Math.max(0, safeTotalCart - nonCashPaidTotal);

  const changeAmount = cashSplitsTotal > cashNeededForRemaining ? cashSplitsTotal - cashNeededForRemaining : 0;

  return {
    totalPaid: Number(totalPaid.toFixed(2)),
    remainingAmount: Number(remainingAmount.toFixed(2)),
    changeAmount: Number(changeAmount.toFixed(2)),
  };
}

export function validateSplitAmount(
  method: string = 'CASH',
  amount: number = 0,
  remainingAmount: number = 0,
  totalPaid: number = 0,
  totalCart: number = 0
): { isValid: boolean; error?: string } {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { isValid: false, error: 'Informe um valor válido para o pagamento.' };
  }

  if (totalPaid >= totalCart || remainingAmount <= 0) {
    return { isValid: false, error: 'Venda já está totalmente quitada.' };
  }

  if (method !== 'CASH') {
    if (numericAmount > remainingAmount) {
      const methodName = formatMethodName(method);
      return { isValid: false, error: `${methodName} não pode exceder o saldo restante da venda.` };
    }
  }

  return { isValid: true };
}