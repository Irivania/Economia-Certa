'use client';

import { useTheme, ThemeColor } from '@/context/ThemeContext';
import Link from 'next/link';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  onOpenCmd: () => void;
}

export function AppHeader({ title, subtitle, onOpenCmd }: AppHeaderProps) {
  const { themeColor, setThemeColor, isDarkMode, toggleDarkMode } = useTheme();

  const themeStyles = {
    emerald: {
      header: 'bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 border-emerald-700/40 text-white',
      badge: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100',
      dot: 'bg-emerald-300',
      accentText: 'text-emerald-300',
      button: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 border-emerald-300/50',
    },
    'emerald-light': {
      header: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 border-emerald-400/40 text-white',
      badge: 'bg-white/20 border-white/30 text-white',
      dot: 'bg-emerald-200',
      accentText: 'text-emerald-100',
      button: 'bg-white hover:bg-emerald-50 text-emerald-900 shadow-emerald-600/20 border-white',
    },
    blue: {
      header: 'bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-950 border-blue-700/40 text-white',
      badge: 'bg-blue-500/20 border-blue-400/40 text-blue-100',
      dot: 'bg-blue-300',
      accentText: 'text-blue-300',
      button: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 border-blue-400/50',
    },
    'blue-light': {
      header: 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 border-blue-400/40 text-white',
      badge: 'bg-white/20 border-white/30 text-white',
      dot: 'bg-blue-200',
      accentText: 'text-blue-100',
      button: 'bg-white hover:bg-blue-50 text-blue-900 shadow-blue-600/20 border-white',
    },
    purple: {
      header: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border-purple-800/40 text-white',
      badge: 'bg-purple-500/20 border-purple-400/40 text-purple-100',
      dot: 'bg-purple-300',
      accentText: 'text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25 border-purple-400/50',
    },
    'purple-light': {
      header: 'bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-700 border-purple-400/40 text-white',
      badge: 'bg-white/20 border-white/30 text-white',
      dot: 'bg-purple-200',
      accentText: 'text-purple-100',
      button: 'bg-white hover:bg-purple-50 text-purple-900 shadow-purple-600/20 border-white',
    },
  }[themeColor];

  return (
    <header className={`${themeStyles.header} pb-20 pt-10 px-6 sm:px-12 shadow-xl relative overflow-hidden border-b`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase backdrop-blur-md ${themeStyles.badge}`}>
              <span className={`w-2 h-2 rounded-full ${themeStyles.dot} animate-pulse`} />
              Ambiente Ativo • Melo Perfumaria
            </div>

            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
              <span className="text-white/80 font-medium mr-1">Temas:</span>
              {(['emerald', 'emerald-light', 'blue', 'blue-light', 'purple', 'purple-light'] as ThemeColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setThemeColor(c)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    c.includes('emerald') ? 'bg-emerald-500' : c.includes('blue') ? 'bg-blue-500' : 'bg-purple-500'
                  } ${themeColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`}
                />
              ))}
              
              <span className="text-white/30 mx-1">|</span>
              
              <button onClick={toggleDarkMode} className="text-white hover:text-white transition-colors mr-1">
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <button
                onClick={onOpenCmd}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider transition-colors border border-white/20"
              >
                ⌘K
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              {title} <span className={`${themeStyles.accentText} font-light text-2xl`}>ERP</span>
            </h1>
            <p className="text-sm text-white/95 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all border border-white/20">
            &larr; Dashboard
          </Link>
          <Link href="/cotacoes/nova" className={`${themeStyles.button} font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg`}>
            Nova Cotação
          </Link>
        </div>
      </div>
    </header>
  );
}