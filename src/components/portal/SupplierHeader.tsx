'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface SupplierHeaderProps {
  title: string;
  representativeName: string;
  representativeEmail: string;
  activeBrand: string;
  onLogout: () => void;
}

export function SupplierHeader({
  title,
  representativeName,
  representativeEmail,
  activeBrand,
  onLogout,
}: SupplierHeaderProps) {
  const { themeColor, setThemeColor, isDarkMode, toggleDarkMode } = useTheme();

  // Mapeamento dinâmico de gradientes baseado na cor escolhida no seletor global
  const themeHeaderStyles = {
    emerald: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-slate-950',
    'emerald-light': 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white',
    blue: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white',
    'blue-light': 'bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white',
    purple: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white',
    'purple-light': 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 text-white',
  }[themeColor] || 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white';

  const isBrandEmpty = !activeBrand || activeBrand === 'SELECIONE UMA MARCA' || activeBrand === 'GERAL';

  return (
    <header className={`w-full py-8 px-6 sm:px-12 shadow-2xl relative z-30 transition-colors duration-500 ${themeHeaderStyles}`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Bloco esquerdo com informações principais */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>AMBIENTE ATIVO • {activeBrand}</span>
          </div>
          
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">{title}</h1>
            <span className="text-lg font-bold opacity-80 font-mono">B2B</span>
          </div>

          <p className="text-xs sm:text-sm font-medium opacity-90 flex flex-wrap items-center gap-2">
            <span>Representante: <strong className="font-bold underline">{representativeName}</strong> ({representativeEmail})</span>
            <span className="opacity-60">•</span>
            <span>
              Contexto:{' '}
              <strong className={`font-mono uppercase px-2 py-0.5 rounded-md ${isBrandEmpty ? 'bg-amber-400 text-slate-950 font-black animate-pulse' : 'bg-black/20 text-white'}`}>
                {isBrandEmpty ? '⚠️ Registe a sua marca' : activeBrand}
              </strong>
            </span>
          </p>
        </div>

        {/* Bloco direito: Seletor de Cores de Tema & Terminar Sessão */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Seletor de Temas idêntico à referência */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 mr-1">Temas:</span>
            
            <button 
              onClick={() => setThemeColor('emerald')} 
              className={`w-4 h-4 rounded-full bg-emerald-500 transition hover:scale-125 cursor-pointer ${themeColor === 'emerald' ? 'ring-2 ring-white scale-110' : ''}`}
              title="Tema Esmeralda"
            />
            <button 
              onClick={() => setThemeColor('blue')} 
              className={`w-4 h-4 rounded-full bg-blue-600 transition hover:scale-125 cursor-pointer ${themeColor === 'blue' ? 'ring-2 ring-white scale-110' : ''}`}
              title="Tema Azul"
            />
            <button 
              onClick={() => setThemeColor('purple')} 
              className={`w-4 h-4 rounded-full bg-purple-600 transition hover:scale-125 cursor-pointer ${themeColor === 'purple' ? 'ring-2 ring-white scale-110' : ''}`}
              title="Tema Roxo"
            />

            <div className="h-4 w-[1px] bg-white/30 mx-1" />

            <button 
              onClick={toggleDarkMode}
              className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-sm"
              title="Alternar Modo Escuro/Claro"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>

          {/* Botão de Terminar Sessão */}
          <button
            onClick={onLogout}
            className="bg-black/20 hover:bg-black/30 text-white border border-white/25 font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg backdrop-blur-md whitespace-nowrap active:scale-95"
          >
            Terminar Sessão
          </button>

        </div>

      </div>
    </header>
  );
}