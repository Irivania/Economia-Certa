'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface QuotationTimerProps {
  endDate?: string | null;
  closingTime?: string | null;
  isDarkMode: boolean;
}

export function QuotationTimer({ endDate, closingTime, isDarkMode }: QuotationTimerProps) {
  const getTimeRemaining = useCallback(() => {
    const targetDateStr = closingTime || endDate;
    let targetTime = 0;

    if (targetDateStr) {
      if (endDate && closingTime && !endDate.includes('T') && closingTime.includes(':')) {
        const fullDateStr = `${endDate}T${closingTime.length === 5 ? closingTime + ':00' : closingTime}`;
        const parsed = new Date(fullDateStr).getTime();
        if (!isNaN(parsed)) targetTime = parsed;
      }

      if (!targetTime) {
        const parsed = new Date(targetDateStr).getTime();
        if (!isNaN(parsed)) targetTime = parsed;
      }
    }

    if (!targetTime) return null;

    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }, [endDate, closingTime]);

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  if (!timeLeft) {
    return (
      <div className="text-xs font-mono font-bold opacity-60">
        Prazo: {closingTime || endDate || 'Até fechar'}
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
        ⏰ Cotação Expirada
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-mono text-xs ${
      isDarkMode ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
    }`}>
      <span className="animate-pulse">⏳</span>
      <div className="font-bold flex items-center gap-1">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
      <span className="text-[10px] opacity-70 uppercase font-sans font-semibold">restantes</span>
    </div>
  );
}