interface EmptyQuotationsStateProps {
  loading: boolean;
}

export function EmptyQuotationsState({ loading }: EmptyQuotationsStateProps) {
  return (
    <p className="px-6 py-12 text-center text-xs text-slate-500 font-medium" role="status">
      {loading ? 'Carregando cotações...' : 'Nenhuma cotação cadastrada.'}
    </p>
  );
}