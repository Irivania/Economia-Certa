"use client";

import { useState } from "react";
import {
  Sparkles,
  Percent,
  Plus,
  Tag,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  scope: string;
  percentage: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export function CashbackManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Cashback Geral Kits Capilares",
      scope: "CATEGORY",
      percentage: "5.0",
      startDate: "2026-11-01",
      endDate: "2026-12-31",
      active: true,
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    scope: "GLOBAL",
    targetId: "",
    percentage: "5.00",
    startDate: "",
    endDate: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Atualizar campanha existente
      setCampaigns(
        campaigns.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: form.name,
                scope: form.scope,
                percentage: form.percentage,
                startDate: form.startDate,
                endDate: form.endDate,
              }
            : c,
        ),
      );
      setEditingId(null);
    } else {
      // Criar nova campanha
      const newCamp: Campaign = {
        id: crypto.randomUUID(),
        name: form.name,
        scope: form.scope,
        percentage: form.percentage,
        startDate: form.startDate,
        endDate: form.endDate,
        active: true,
      };
      setCampaigns([newCamp, ...campaigns]);
    }
    setForm({
      name: "",
      scope: "GLOBAL",
      targetId: "",
      percentage: "5.00",
      startDate: "",
      endDate: "",
    });
  };

  const handleEdit = (camp: Campaign) => {
    setEditingId(camp.id);
    setForm({
      name: camp.name,
      scope: camp.scope,
      targetId: "",
      percentage: camp.percentage,
      startDate: camp.startDate,
      endDate: camp.endDate,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns(
      campaigns.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta regra de cashback?")) {
      setCampaigns(campaigns.filter((c) => c.id !== id));
    }
  };

  const activeCount = campaigns.filter((c) => c.active).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Cabeçalho Padrão do ERP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Programa de Cashback & Fidelidade 🌸
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure regras automáticas por produto, categoria ou loja
              inteira para fidelizar suas clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Nova Regra / Edição */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {editingId
                ? "Editar Regra de Cashback"
                : "Nova Regra de Cashback"}
            </h3>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  name: "",
                  scope: "GLOBAL",
                  targetId: "",
                  percentage: "5.00",
                  startDate: "",
                  endDate: "",
                });
              }}
              className="text-xs text-red-500 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
            >
              <X className="w-3.5 h-3.5" /> Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nome da Campanha
              </label>
              <input
                type="text"
                placeholder="Ex: Cashback Verão Skala & Kolene"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Aplicabilidade (Escopo)
              </label>
              <select
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="GLOBAL">Loja Inteira (Todos os produtos)</option>
                <option value="CATEGORY">
                  Categoria Específica (Ex: Kits Capilares)
                </option>
                <option value="PRODUCT">Produto Específico</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Percentual de Cashback (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={form.percentage}
                  onChange={(e) =>
                    setForm({ ...form, percentage: e.target.value })
                  }
                  className="w-full p-3 pl-9 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <Percent className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Início
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Fim
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 transition"
            >
              <Plus className="w-4 h-4" />{" "}
              {editingId ? "Salvar Alterações" : "Criar Regra de Cashback"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Campanhas Registradas */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Campanhas Registradas
          </h3>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold">
            {activeCount} ativa(s) / {campaigns.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
            >
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{c.name}</span>
                  {c.active ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ativa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <PauseCircle className="w-3 h-3" /> Pausada
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap gap-4">
                  <span>
                    Escopo:{" "}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {c.scope}
                    </strong>
                  </span>
                  <span>
                    Retorno:{" "}
                    <strong className="text-purple-600 dark:text-purple-400">
                      {c.percentage}%
                    </strong>
                  </span>
                  <span>
                    Validade:{" "}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {c.startDate} até {c.endDate}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Botões de Ação: Editar, Pausar/Ativar, Excluir */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleEdit(c)}
                  className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer"
                  title="Editar Campanha"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(c.id)}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    c.active
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                  title={c.active ? "Pausar Campanha" : "Ativar Campanha"}
                >
                  {c.active ? (
                    <PauseCircle className="w-4 h-4" />
                  ) : (
                    <PlayCircle className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                  title="Excluir Campanha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
