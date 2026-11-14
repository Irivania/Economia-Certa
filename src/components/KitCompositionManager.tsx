"use client";

import { useState, useEffect } from "react";

interface ComponentItem {
  componentProductId: string;
  quantity: number;
  description?: string;
}

interface ProductOption {
  id: string;
  description: string;
  stockCurrent: number;
}

interface KitManagerProps {
  productId: string;
  companyId: string;
}

export function KitCompositionManager({ productId, companyId }: KitManagerProps) {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para o seletor de adicionar item
  const [selectedComponentId, setSelectedComponentId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // 1. Carregar a composição atual do kit e a lista de todos os produtos da empresa
  useEffect(() => {
    async function loadData() {
      try {
        const [compRes, prodRes] = await Promise.all([
          fetch(`/api/products/composition?productId=${productId}`),
          fetch(`/api/products?companyId=${companyId}`), // Ajuste a rota se necessário para listar produtos
        ]);

        const compData = await compRes.json();
        const prodData = await prodRes.json();

        if (compData.success) {
          setComponents(compData.items);
        }
        if (prodData) {
          // Filtra para não deixar o kit compor a si mesmo
          setAllProducts(Array.isArray(prodData) ? prodData.filter((p: ProductOption) => p.id !== productId) : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do kit:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId, companyId]);

  // 2. Adicionar item à lista local do kit
  const handleAddComponent = () => {
    if (!selectedComponentId) return;

    const existingIndex = components.findIndex(
      (c) => c.componentProductId === selectedComponentId
    );

    if (existingIndex >= 0) {
      // Se já existe, atualiza a quantidade
      const updated = [...components];
      updated[existingIndex].quantity += Number(selectedQuantity);
      setComponents(updated);
    } else {
      // Adiciona novo
      const productObj = allProducts.find((p) => p.id === selectedComponentId);
      setComponents([
        ...components,
        {
          componentProductId: selectedComponentId,
          quantity: Number(selectedQuantity),
          description: productObj?.description || "Produto",
        },
      ]);
    }

    setSelectedComponentId("");
    setSelectedQuantity(1);
  };

  // 3. Remover item da lista
  const handleRemoveComponent = (componentProductId: string) => {
    setComponents(components.filter((c) => c.componentProductId !== componentProductId));
  };

  // 4. Salvar na API
  const handleSaveComposition = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/products/composition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          companyId,
          components: components.map((c) => ({
            componentProductId: c.componentProductId,
            quantity: c.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Composição do kit salva com sucesso!");
      } else {
        alert("❌ Erro ao salvar: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("❌ Erro de conexão ao salvar composição.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">A carregar estrutura do kit...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Composição do Kit (Itens Filhos)</h3>
        <p className="text-sm text-gray-500">
          Configure os itens individuais que formam este kit. Quando o kit for vendido, o estoque de cada componente abaixo será baixado automaticamente em cascata.
        </p>
      </div>

      {/* Adicionar novo componente */}
      <div className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Selecionar Produto Individual</label>
          <select
            value={selectedComponentId}
            onChange={(e) => setSelectedComponentId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Selecione um produto...</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.description} (Estoque atual: {p.stockCurrent})
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Quantidade</label>
          <input
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAddComponent}
          className="w-full sm:w-auto px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
        >
          Adicionar Item
        </button>
      </div>

      {/* Tabela de componentes atuais */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <th className="p-3">Produto Componente</th>
              <th className="p-3 text-center">Qtd no Kit</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {components.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-400 italic">
                  Nenhum componente adicionado a este kit ainda.
                </td>
              </tr>
            ) : (
              components.map((item) => {
                const prodInfo = allProducts.find((p) => p.id === item.componentProductId);
                return (
                  <tr key={item.componentProductId} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">
                      {prodInfo?.description || item.description || "Item do Kit"}
                    </td>
                    <td className="p-3 text-center font-semibold text-blue-600">
                      {item.quantity} un
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(item.componentProductId)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Botão de Gravar Geral */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveComposition}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar Composição do Kit"}
        </button>
      </div>
    </div>
  );
}