"use client";

interface CompanyHeaderSectionProps {
  document: string;
  onDocumentChange: (val: string) => void;
  fetchingCnpj: boolean;
  tradeName: string;
  setTradeName: (val: string) => void;
  type: string;
  setType: (val: string) => void;
  stateRegistration: string;
  setStateRegistration: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  isDarkMode: boolean;
}

export function CompanyHeaderSection({
  document,
  onDocumentChange,
  fetchingCnpj,
  tradeName,
  setTradeName,
  type,
  setType,
  stateRegistration,
  setStateRegistration,
  name,
  setName,
  isDarkMode,
}: CompanyHeaderSectionProps) {
  const inputClass = `w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${
    isDarkMode
      ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500"
      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600"
  }`;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
        1. Informações Corporativas e Fiscais
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            CNPJ{" "}
            {fetchingCnpj && (
              <span className="text-indigo-500 animate-pulse font-normal">
                | Buscando...
              </span>
            )}
          </label>
          <input
            type="text"
            value={document}
            onChange={(e) => void onDocumentChange(e.target.value)}
            placeholder="00.000.000/0001-00"
            maxLength={18}
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Nome Fantasia (Marca)
          </label>
          <input
            type="text"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            placeholder="Ex: Melo Perfumaria"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Tipo de Unidade
          </label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Matriz ou Filial"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Inscrição Estadual
          </label>
          <input
            type="text"
            value={stateRegistration}
            onChange={(e) => setStateRegistration(e.target.value)}
            placeholder="Ex: 123.456.789.110"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Razão Social
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
