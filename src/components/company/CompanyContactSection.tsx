"use client";

interface CompanyContactSectionProps {
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  isDarkMode: boolean;
}

export function CompanyContactSection({
  email,
  setEmail,
  phone,
  setPhone,
  isDarkMode,
}: CompanyContactSectionProps) {
  const inputClass = `w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${
    isDarkMode
      ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500"
      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600"
  }`;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
        2. Canais de Contacto
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            E-mail Corporativo
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@sualoja.com.br"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Telefone / WhatsApp
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
