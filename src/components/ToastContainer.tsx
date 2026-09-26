'use client';

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  isDarkMode: boolean;
}

export function ToastContainer({ toasts, isDarkMode }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-80 p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-top-5 duration-300 ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-700 text-white' 
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div className={`p-2 rounded-xl text-sm ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
            toast.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
          }`}>
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold">{toast.title}</h4>
            <p className="text-[11px] opacity-70 mt-0.5">{toast.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}