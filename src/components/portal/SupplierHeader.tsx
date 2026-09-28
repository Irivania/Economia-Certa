'use client';

interface SupplierHeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
}

export function SupplierHeader({ title, subtitle, onLogout }: SupplierHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white py-8 px-6 sm:px-12 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Portal Exclusivo do Fornecedor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
          <p className="text-xs text-indigo-100/80 font-medium">{subtitle}</p>
        </div>

        <div>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-lg shadow-rose-950/50 cursor-pointer flex items-center gap-2"
          >
            <span>🚪 Terminar Sessão</span>
          </button>
        </div>
      </div>
    </header>
  );
}