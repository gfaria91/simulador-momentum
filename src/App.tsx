import React from 'react'
import { SimulacaoCard } from './components/SimulacaoCard'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Simulador de Financiamento
      </h1>

      <div className="max-w-xl mx-auto">
        <SimulacaoCard
          titulo="BMP Pick Money"
          entrada={2250}
          juros={0.33}
          prazo={180}
          parcela={1091.02}
          totalMes={1877.13}
        />

        <SimulacaoCard
          titulo="Momentum"
          entrada={2250}
          juros={0.0}
          prazo={24}
          parcela={6162.41}
          totalMes={6948.52}
        />
      </div>
    </div>
  )
}

export default App
