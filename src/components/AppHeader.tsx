'use client';

import { useTheme, ThemeColor } from '@/context/ThemeContext';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import type { CompanySession } from '@/lib/companySession';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  onOpenCmd: () => void;
  hideQuotationButton?: boolean;
}

const colorMap = {
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
};

const emptyCompanySession: CompanySession = {};
let sessionSnapshot: CompanySession = emptyCompanySession;
let sessionRawValue: string | null | undefined;

function readCompanySession(): CompanySession {
  if (typeof window === 'undefined') {
    return emptyCompanySession;
  }

  const rawSession = sessionStorage.getItem('melo_company_session');
  if (rawSession === sessionRawValue) {
    return sessionSnapshot;
  }

  sessionRawValue = rawSession;

  if (!rawSession) {
    sessionSnapshot = emptyCompanySession;
    return sessionSnapshot;
  }

  try {
    sessionSnapshot = JSON.parse(rawSession) as CompanySession;
  } catch {
    sessionSnapshot = emptyCompanySession;
  }

  return sessionSnapshot;
}

function subscribeToCompanySession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('company-session-change', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('company-session-change', onStoreChange);
  };
}

export function AppHeader({ title, subtitle, onOpenCmd, hideQuotationButton }: AppHeaderProps) {
  const { themeColor, setThemeColor, isDarkMode, toggleDarkMode, mounted } = useTheme();
  const session = useSyncExternalStore(
    subscribeToCompanySession,
    readCompanySession,
    () => emptyCompanySession,
  );
  const companyName = session.tradeName || session.name || 'Melo Perfumaria';
  const userName = session.name || '';
  const userRole = session.role ? String(session.role).toUpperCase() : '';

  const roleLower = String(session.role || '').toLowerCase();
  const isOperator = roleLower === 'geral' || roleLower === 'operador';

  const activeThemeKey: ThemeColor = mounted && themeColor ? themeColor : 'blue-light';
  const themeStyles = colorMap[activeThemeKey] || colorMap['blue-light'];

  return (
    <header className={`${themeStyles.header} py-3.5 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden border-b transition-colors duration-300 shrink-0`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative z-10">
        <div className="space-y-1.5 w-full md:w-auto">
          {/* Informações de Contexto Organizadas */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md ${themeStyles.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.dot} animate-pulse`} />
              Loja • {companyName}
            </div>

            {userName && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/20 bg-black/20 backdrop-blur-md text-[11px] font-semibold text-white uppercase tracking-wider">
                👤 {userName} {userRole && `• ${userRole}`}
              </div>
            )}

            {/* Controles Rápidos Compactos (Tema, Modo Escuro e Busca) */}
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 text-xs ml-auto sm:ml-0">
              <div className="flex items-center gap-1.5">
                {(['emerald', 'blue', 'purple'] as ThemeColor[]).map((baseColor) => {
                  const isSelected = activeThemeKey.startsWith(baseColor);
                  return (
                    <button
                      key={baseColor}
                      onClick={() => setThemeColor(isSelected && activeThemeKey.includes('light') ? (baseColor as ThemeColor) : (`${baseColor}-light` as ThemeColor))}
                      title="Alternar tonalidade do tema"
                      className={`w-3 h-3 rounded-full transition-transform cursor-pointer ${
                        baseColor === 'emerald' ? 'bg-emerald-500' : baseColor === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      } ${isSelected ? 'scale-110 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                    />
                  );
                })}
              </div>
              
              <span className="text-white/30">|</span>
              
              <button 
                onClick={toggleDarkMode} 
                title="Alternar Modo Escuro / Claro"
                className="text-white/90 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <span className="text-white/30">|</span>

              <button
                onClick={onOpenCmd}
                title="Busca Rápida (Ctrl + K)"
                className="bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider transition-colors border border-white/20 cursor-pointer"
              >
                ⌘K
              </button>
            </div>
          </div>

          {/* Título e Subtítulo */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              {title} <span className={`${themeStyles.accentText} font-light text-base`}>ERP</span>
            </h1>
            <span className="text-xs text-white/80 font-medium hidden sm:inline">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Botões de Ação Global (Ocultos para Operador) ou Badge Elegante de Caixa */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {isOperator ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ⚡ Terminal de Caixa Exclusivo
            </div>
          ) : (
            <>
              <Link href="/" className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all border border-white/20 whitespace-nowrap">
                &larr; Dashboard
              </Link>
              {!hideQuotationButton && (
                <Link href="/cotacoes/nova" className={`${themeStyles.button} font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md whitespace-nowrap`}>
                  Nova Cotação
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}