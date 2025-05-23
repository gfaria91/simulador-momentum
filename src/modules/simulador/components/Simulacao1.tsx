import React, { useEffect, useState } from 'react'

type Props = {
  tipoCliente: string
  valorLote: string
}

const Simulacao1 = ({ tipoCliente, valorLote }: Props) => {
  const [entradaPercentual, setEntradaPercentual] = useState('1,50')
  const [valorEntrada, setValorEntrada] = useState('')
  const [prazo, setPrazo] = useState(180)
  const [taxaJuros, setTaxaJuros] = useState('0,33')

  const nomeBloco = tipoCliente === 'CCB' ? 'Pick Money' : 'Momentum - Opção 1'

  const parseValor = (valor: string) => {
    return parseFloat(valor.replace('.', '').replace(',', '.')) || 0
  }

  const formatarMonetario = (valor: number) => {
    return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  useEffect(() => {
    const vl = parseValor(valorLote)
    const perc = parseValor(entradaPercentual)
    const entrada = vl * (perc / 100)
    if (!isNaN(entrada)) {
      setValorEntrada(formatarMonetario(entrada))
    }
  }, [valorLote, entradaPercentual])

  useEffect(() => {
    const vl = parseValor(valorLote)
    const entrada = parseValor(valorEntrada)
    if (!isNaN(vl) && entrada > 0) {
      const percentual = (entrada / vl) * 100
      setEntradaPercentual(formatarMonetario(percentual))
    }
  }, [valorEntrada])

  return (
    <section className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{nomeBloco}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Entrada (%)</label>
          <div className="flex items-center">
            <input
              type="text"
              value={entradaPercentual}
              onChange={(e) => setEntradaPercentual(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
            <span className="ml-2 font-semibold">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valor da Entrada (R$)</label>
          <input
            type="text"
            value={valorEntrada}
            onChange={(e) => setValorEntrada(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prazo em Meses</label>
          <select
            value={prazo}
            onChange={(e) => setPrazo(parseInt(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          >
            {[...Array(180)].map((_, i) => 180 - i).filter(m => [1, 2, 6, 12, 24, 36, 48, 180].includes(m)).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Taxa de Juros Mensal</label>
          <select
            value={taxaJuros}
            onChange={(e) => setTaxaJuros(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            {['0,33', '0,29', '0,25', '0,21', '0,17', '0,00'].map(t => (
              <option key={t} value={t}>{t}%</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}

export default Simulacao1
