import React, { useEffect, useState } from 'react'

const moedas = [
  { label: 'Real (BRL)', value: 'BRL' },
  { label: 'Dólar Americano (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'Libra Esterlina (GBP)', value: 'GBP' },
  { label: 'Dólar Canadense (CAD)', value: 'CAD' },
  { label: 'Dólar Australiano (AUD)', value: 'AUD' },
  { label: 'Franco Suíço (CHF)', value: 'CHF' },
  { label: 'Outra (Manual)', value: 'MANUAL' }
]

type Props = {
  moedaSelecionada: string
  setMoedaSelecionada: (moeda: string) => void
  cotacaoManual: string
  setCotacaoManual: (valor: string) => void
  cotacaoAPI: string
  setCotacaoAPI: (valor: string) => void
}

const ConfigMoeda = ({
  moedaSelecionada,
  setMoedaSelecionada,
  cotacaoManual,
  setCotacaoManual,
  cotacaoAPI,
  setCotacaoAPI
}: Props) => {
  useEffect(() => {
    if (moedaSelecionada !== 'BRL' && moedaSelecionada !== 'MANUAL') {
      fetch(`https://api.frankfurter.app/latest?from=${moedaSelecionada}&to=BRL`)
  .then(res => {
    if (!res.ok) throw new Error('Falha ao buscar cotação')
    return res.json()
  })
  .then(data => {
    const taxa = data.rates?.['BRL']
    if (taxa) {
      setCotacaoAPI(parseFloat(taxa).toFixed(2))
    } else {
      setCotacaoAPI('1.00')
      console.error('Resposta inesperada da API:', data)
    }
  })
  .catch((err) => {
    console.error('Erro ao buscar cotação:', err)
    setCotacaoAPI('1.00')
  })

  }, [moedaSelecionada, setCotacaoAPI])

  const formatarValorMonetario = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    const numero = (parseInt(apenasNumeros || '0', 10) / 100).toFixed(2)
    return numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleCotacaoManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValorMonetario(e.target.value)
    setCotacaoManual(valorFormatado)
  }

  return (
    <section className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Configuração da Moeda</h3>
      <label className="block text-sm mb-1">Moeda para Visualização (Impressão/Cliente)</label>
      <select
        className="border rounded px-3 py-2 w-full"
        value={moedaSelecionada}
        onChange={(e) => setMoedaSelecionada(e.target.value)}
      >
        {moedas.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {moedaSelecionada === 'MANUAL' && (
        <div className="mt-3">
          <label className="block text-sm mb-1">Cotação personalizada (1 unidade = ? BRL)</label>
          <input
            type="text"
            placeholder="Ex: 5,20"
            value={cotacaoManual}
            onChange={handleCotacaoManual}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      )}

      {moedaSelecionada !== 'BRL' && moedaSelecionada !== 'MANUAL' && (
        <p className="text-sm mt-2 text-gray-600 italic">
          Cotação atual: <strong>1 {moedaSelecionada} = {parseFloat(cotacaoAPI).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} BRL</strong>
        </p>
      )}
    </section>
  )
}

export default ConfigMoeda
