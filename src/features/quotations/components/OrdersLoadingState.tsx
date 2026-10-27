export function OrdersLoadingState() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50 shadow-xs animate-pulse">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            A carregar dados dos pedidos e cotação...
          </p>
        </div>
      </div>
    </div>
  );
}