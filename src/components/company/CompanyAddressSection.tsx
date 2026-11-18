"use client";

interface CompanyAddressSectionProps {
  cep: string;
  onCepChange: (val: string) => void;
  fetchingCep: boolean;
  address: string;
  setAddress: (val: string) => void;
  number: string;
  setNumber: (val: string) => void;
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  setState: (val: string) => void;
  isDarkMode: boolean;
}

export function CompanyAddressSection({
  cep,
  onCepChange,
  fetchingCep,
  address,
  setAddress,
  number,
  setNumber,
  neighborhood,
  setNeighborhood,
  city,
  setCity,
  state,
  setState,
  isDarkMode,
}: CompanyAddressSectionProps) {
  const inputClass = `w-full p-2.5 text-xs font-bold rounded-lg border outline-none transition shadow-xs ${
    isDarkMode
      ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500"
      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600"
  }`;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
        3. Endereço Comercial
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            CEP{" "}
            {fetchingCep && (
              <span className="text-indigo-500 animate-pulse font-normal">
                | Buscando...
              </span>
            )}
          </label>
          <input
            type="text"
            value={cep}
            onChange={(e) => void onCepChange(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Logradouro (Rua, Avenida...)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Rua das Flores"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Número
          </label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="123"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Bairro
          </label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Ex: Centro"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Cidade
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: São Paulo"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Estado (UF)
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Ex: SP"
            maxLength={2}
            className={`${inputClass} font-mono uppercase`}
          />
        </div>
      </div>
    </div>
  );
}
