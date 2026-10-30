'use client';

interface POSPromoBannerProps {
  bannerUrl?: string | null;
  companyName?: string;
  isDarkMode: boolean;
}

export function POSPromoBanner({ bannerUrl, companyName, isDarkMode }: POSPromoBannerProps) {
  const activeImage = bannerUrl || '/pdv-centro-logo.png';

  return (
    <div className={`w-full h-full rounded-2xl border p-3.5 flex flex-col items-center justify-between text-center transition-all shadow-sm overflow-hidden ${
      isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Imagem a preencher o espaço central dinamicamente sem scroll */}
      <div className="w-full flex-1 rounded-xl overflow-hidden shadow-inner border border-purple-500/30 bg-purple-950 flex items-center justify-center relative my-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={activeImage} 
          alt="Melo Perfumaria - Caixa Livre" 
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      <div className="py-1 space-y-0.5 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
          {companyName || 'Melo Perfumaria'} • Caixa Livre
        </h3>
        <p className="text-[11px] opacity-70 italic font-medium">

        </p>
      </div>

      <div className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold shrink-0">
        ⚡ Pressione <kbd className="font-mono bg-purple-500/20 px-1 py-0.5 rounded">F2</kbd> ou bipe o código de barras para iniciar
      </div>
    </div>
  );
}