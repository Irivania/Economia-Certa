"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import type { NotificationState } from "@/types/pdv";

interface PaymentNotificationProps {
  notification: NotificationState | null;
  onDismiss: () => void;
  isDarkMode: boolean;
}

export function PaymentNotification({
  notification,
  onDismiss,
  isDarkMode,
}: PaymentNotificationProps) {
  if (!notification) return null;

  const message = notification.message.toLowerCase();

  const isSuccess =
    notification.type === "success" ||
    message.includes("troco") ||
    message.includes("quitada");

  const isWarning =
    notification.type === "warning" ||
    message.includes("falta") ||
    message.includes("inválido");

  const styles = isSuccess
    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
    : isWarning
      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300";

  const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertCircle : Info;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs font-semibold ${styles}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{notification.message}</span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className={`p-1 rounded-lg shrink-0 ${
          isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
        }`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
