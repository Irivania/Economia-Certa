"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { AppHeader } from "@/components/AppHeader";
import { CommandMenu } from "@/components/CommandMenu";
import { getCompanyId } from "@/lib/companySession";

import { CompanyHeaderSection } from "@/components/company/CompanyHeaderSection";
import { CompanyContactSection } from "@/components/company/CompanyContactSection";
import { CompanyAddressSection } from "@/components/company/CompanyAddressSection";

const subscribeToHydration = () => () => {};

export default function CompanySettingsPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const [companyId] = useState<string>(() => getCompanyId());

  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [document, setDocument] = useState("");
  const [stateRegistration, setStateRegistration] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [type, setType] = useState("Matriz / Loja Principal");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setIsCmdOpen((open) => !open);
    }
    if (e.key === "Escape") {
      setIsCmdOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleCepChange = useCallback(async (rawInput: string) => {
    const cleanCep = rawInput.replace(/\D/g, "");
    setCep(rawInput);

    if (cleanCep.length === 8) {
      setFetchingCep(true);
      try {
        const res = await fetch(`/api/proxy/cnpj?cep=${cleanCep}`);
        if (res.ok) {
          const data = await res.json();
          if (data.street) setAddress(data.street);
          if (data.neighborhood) setNeighborhood(data.neighborhood);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);

          setToast("📍 Endereço preenchido pelo CEP!");
          setTimeout(() => setToast(null), 4000);
        } else {
          setToast("⚠ CEP não encontrado.");
          setTimeout(() => setToast(null), 4000);
        }
      } catch (err) {
        console.error("Erro ao consultar CEP:", err);
      } finally {
        setFetchingCep(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!companyId) {
      router.replace("/login");
      return;
    }

    async function loadCompany() {
      try {
        const res = await fetch(`/api/company?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setTradeName(data.tradeName || "");
          setDocument(data.document || "");
          setStateRegistration(data.stateRegistration || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setCep(data.cep || "");
          setAddress(data.address || "");
          setNumber(data.number || "");
          setNeighborhood(data.neighborhood || "");
          setCity(data.city || "");
          setState(data.state || "");
          setType(data.type || "Matriz");
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, [companyId, router]);

  const handleCnpjChange = async (rawInput: string) => {
    const cleanCnpj = rawInput.replace(/\D/g, "");
    setDocument(rawInput);

    if (cleanCnpj.length === 14) {
      setFetchingCnpj(true);
      try {
        const res = await fetch(`/api/proxy/cnpj?cnpj=${cleanCnpj}`);
        if (res.ok) {
          const data = await res.json();
          if (data.razao_social) setName(data.razao_social);
          if (data.nome_fantasia) setTradeName(data.nome_fantasia);
          const registration =
            data.inscricao_estadual ||
            data.inscricaoEstadual ||
            data.estabelecimento?.inscricoes_estaduais?.[0]
              ?.inscricao_estadual ||
            data.estabelecimento?.inscricoes_estaduais?.[0]?.inscricaoEstadual;
          if (typeof registration === "string" && registration.trim()) {
            setStateRegistration(registration.trim());
          }
          if (data.email) setEmail(data.email);
          if (data.ddd_telefone_1) setPhone(data.ddd_telefone_1);
          if (data.cep) {
            setCep(data.cep);
            void handleCepChange(String(data.cep));
          }
          if (data.logradouro) setAddress(data.logradouro);
          if (data.numero) setNumber(data.numero);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.municipio) setCity(data.municipio);
          if (data.uf) setState(data.uf);

          setToast("✨ Dados corporativos preenchidos via Receita Federal!");
          setTimeout(() => setToast(null), 4000);
        } else {
          setToast("⚠ CNPJ não encontrado. Preencha manualmente.");
          setTimeout(() => setToast(null), 4000);
        }
      } catch (err) {
        console.error("Erro ao consultar CNPJ:", err);
        setToast("⚠ Erro ao consultar CNPJ.");
        setTimeout(() => setToast(null), 4000);
      } finally {
        setFetchingCnpj(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          name,
          tradeName,
          document,
          stateRegistration,
          email,
          phone,
          cep,
          address,
          number,
          neighborhood,
          city,
          state,
          type,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setToast(
        "✅ Cadastro da empresa atualizado com sucesso! A retornar ao painel...",
      );

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast("❌ Erro ao atualizar dados da empresa.");
      setTimeout(() => setToast(null), 4000);
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      <AppHeader
        title="Economia Certa"
        subtitle="Gestão completa de dados cadastrais, fiscais e morada."
        onOpenCmd={() => setIsCmdOpen(true)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 relative z-20 space-y-6">
        <div
          className={`p-6 sm:p-7 rounded-xl shadow-xs border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"}`}
        >
          {loading ? (
            <div className="py-20 text-center text-xs font-medium text-slate-500">
              A carregar dados corporativos...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <CompanyHeaderSection
                document={document}
                onDocumentChange={handleCnpjChange}
                fetchingCnpj={fetchingCnpj}
                tradeName={tradeName}
                setTradeName={setTradeName}
                type={type}
                setType={setType}
                stateRegistration={stateRegistration}
                setStateRegistration={setStateRegistration}
                name={name}
                setName={setName}
                isDarkMode={isDarkMode}
              />

              <CompanyContactSection
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                isDarkMode={isDarkMode}
              />

              <CompanyAddressSection
                cep={cep}
                onCepChange={handleCepChange}
                fetchingCep={fetchingCep}
                address={address}
                setAddress={setAddress}
                number={number}
                setNumber={setNumber}
                neighborhood={neighborhood}
                setNeighborhood={setNeighborhood}
                city={city}
                setCity={setCity}
                state={state}
                setState={setState}
                isDarkMode={isDarkMode}
              />

              <div className="flex justify-between items-center pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={`px-4 py-2.5 font-semibold rounded-lg text-xs border transition cursor-pointer shadow-xs ${isDarkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                >
                  &larr; Voltar ao Dashboard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving
                    ? "A salvar alterações..."
                    : "Salvar Cadastro Completo"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold z-50">
          {toast}
        </div>
      )}

      <CommandMenu
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        isDarkMode={isDarkMode}
        latestQuotationId=""
      />
    </div>
  );
}
