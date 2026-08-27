export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-600">Economia Certa</span>
          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">ERP B2B</span>
        </div>
        <div className="text-sm text-slate-600">
          Módulo de Cotações & Gestão
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Bem-vindo ao <span className="text-blue-600">Economia Certa ERP</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Plataforma inteligente para otimização de compras B2B, gestão de catálogos e cotações automatizadas entre Lojas e Fornecedores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">📦 Gestão de Produtos</h3>
            <p className="text-sm text-slate-600">Controle completo de catálogo, preços de custo/venda e conversão de unidades (Caixa/Unidade).</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">📊 Importação em Massa</h3>
            <p className="text-sm text-slate-600">Validação automática de planilhas Excel/CSV com detecção instantânea de inconsistências.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">🤝 Cotações B2B</h3>
            <p className="text-sm text-slate-600">Envio e comparação ágil de orçamentos para fornecedores com foco em economia.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Economia Certa ERP © 2026 — Todos os direitos reservados.
      </footer>
    </div>
  );
}