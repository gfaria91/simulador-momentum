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
  const [ultimoEditado, setUltimoEditado] = useState<'percentual' | 'valor'>('percentual')

  const nomeBloco = tipoCliente === 'CCB' ? 'Pick Money' : 'Momentum - Opção 1'

  const parseValor = (valor: string) => parseFloat(valor.replace('.', '').replace(',', '.')) || 0
  const formatarMonetario = (valor: number) => valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  useEffect(() => {
    if (ultimoEditado === 'percentual') {
      const vl = parseValor(valorLote)
      const perc = parseValor(entradaPercentual)
      const entrada = vl * (perc / 100)
      if (!isNaN(entrada)) {
        setValorEntrada(formatarMonetario(entrada))
      }
    }
  }, [entradaPercentual, valorLote])

  useEffect(() => {
    if (ultimoEditado === 'valor') {
      const vl = parseValor(valorLote)
      const entrada = parseValor(valorEntrada)
      if (!isNaN(vl) && vl > 0 && entrada > 0) {
        const percentual = (entrada / vl) * 100
        setEntradaPercentual(formatarMonetario(percentual))
      }
    }
  }, [valorEntrada, valorLote])

  const handlePercentualChange = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    const numero = (parseInt(apenasNumeros || '0', 10) / 100).toFixed(2)
    const formatado = numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setUltimoEditado('percentual')
    setEntradaPercentual(formatado)
  }

  const handleValorChange = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    const numero = (parseInt(apenasNumeros || '0', 10) / 100).toFixed(2)
    const formatado = numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setUltimoEditado('valor')
    setValorEntrada(formatado)
  }

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
              onChange={(e) => handlePercentualChange(e.target.value)}
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
            onChange={(e) => handleValorChange(e.target.value)}
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
            {[180, 48, 36, 24, 12, 6, 2, 1].map(m => (
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
