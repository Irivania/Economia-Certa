"use client";

interface SalesFiltersProps {
  filterType: "all" | "today" | "biweekly" | "month" | "custom";
  setFilterType: (
    type: "all" | "today" | "biweekly" | "month" | "custom",
  ) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedOperator: string;
  setSelectedOperator: (op: string) => void;
  selectedRegister: string;
  setSelectedRegister: (reg: string) => void;
  operators: string[];
  registers: string[];
  totalFaturado: number;
}

export function SalesFilters({
  filterType,
  setFilterType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedOperator,
  setSelectedOperator,
  selectedRegister,
  setSelectedRegister,
  operators,
  registers,
  totalFaturado,
}: SalesFiltersProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Períodos */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            Período:
          </span>
          {(["all", "today", "biweekly", "month", "custom"] as const).map(
            (type) => {
              const labels = {
                all: "Todas",
                today: "Hoje",
                biweekly: "Quinzenal",
                month: "Este Mês",
                custom: "📅 Calendário",
              };
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === type
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:opacity-80"
                  }`}
                >
                  {labels[type]}
                </button>
              );
            },
          )}
        </div>

        {/* Filtros por Caixa e Operador */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold opacity-70">Caixa:</span>
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
            >
              <option value="all">Todos os Caixas</option>
              {registers.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold opacity-70">Operador(a):</span>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
            >
              <option value="all">Todos os Operadores</option>
              {operators.map((op, i) => (
                <option key={i} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block font-mono">
              Faturamento
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              R$ {totalFaturado.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Seletor de Datas Personalizado */}
      {filterType === "custom" && (
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">De:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">Até:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
            />
          </div>
          <span className="text-[11px] text-slate-400">
            (Filtro por calendário ativo)
          </span>
        </div>
      )}
    </div>
  );
}
