import Link from 'next/link';

export function ComparisonErrorState({ error, isDarkMode }: { error: string | null; isDarkMode: boolean }) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border rounded-xl p-6 text-center max-w-md shadow-xs space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <p className="text-xs font-semibold text-rose-500">{error || 'Cotação não encontrada.'}</p>
        <Link href="/cotacoes" className="inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs">
          Voltar para listagem
        </Link>
      </div>
    </div>
  );
}