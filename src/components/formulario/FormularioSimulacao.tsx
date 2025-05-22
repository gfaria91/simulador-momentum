import React from 'react'

export const FormularioSimulacao = () => {
  return (
    <form className="space-y-6 bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Simulador Financeiro de Lotes
      </h2>

      {/* Configurações de Moeda */}
      <section>
        <h3 className="font-semibold text-lg mb-2">Configurações de Moeda</h3>
        <select className="border rounded px-3 py-2 w-full">
          <option>Real (R$)</option>
          <option>Dólar (US$)</option>
          <option>Euro (€)</option>
        </select>
      </section>

      {/* Dados do Lote */}
      <section>
        <h3 className="font-semibold text-lg mb-2">Dados Iniciais do Lote</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Tipo de Cliente" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Setor" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Quadra" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Lote" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Tamanho do Lote (m²)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Valor do Lote (R$)" className="border rounded px-3 py-2 w-full" />
        </div>
      </section>

      {/* Taxas Adicionais */}
      <section>
        <h3 className="font-semibold text-lg mb-2">Taxas Adicionais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Taxa de Conservação Comum (R$)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Taxa SLIM (R$)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Taxa de Melhoramentos (R$)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Taxa de Transporte (R$)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Outras Taxas (R$)" className="border rounded px-3 py-2 w-full" />
        </div>
      </section>

      {/* Simulação PICK MONEY */}
      <section>
        <h3 className="font-semibold text-lg mb-2">PICK MONEY</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input placeholder="Entrada (%)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Prazo (meses)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Taxa de Juros Mensal (%)" className="border rounded px-3 py-2 w-full" />
        </div>
      </section>

      {/* Simulação MOMENTUM */}
      <section>
        <h3 className="font-semibold text-lg mb-2">MOMENTUM (Opção 2)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input placeholder="Entrada (%)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Prazo (meses)" className="border rounded px-3 py-2 w-full" />
          <input placeholder="Taxa de Juros Mensal (%)" className="border rounded px-3 py-2 w-full" />
        </div>
      </section>

      <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded shadow">
        Calcular Simulação
      </button>
    </form>
  )
}
