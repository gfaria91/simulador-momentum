import React, { useEffect, useState } from 'react'

type Props = {
  valorLote: string
  setValorLote: (valor: string) => void
  tamanho: string
  setTamanho: (valor: string) => void
}

const ValorMetroQuadrado = ({ valorLote, setValorLote, tamanho, setTamanho }: Props) => {
  const [valorMetro, setValorMetro] = useState('')
  const [ultimoEditado, setUltimoEditado] = useState<'lote' | 'metro'>('lote')

  const parseValor = (valor: string) => parseFloat(valor.replace('.', '').replace(',', '.')) || 0
  const formatarMonetario = (valor: number) => valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  useEffect(() => {
    const tamanhoNum = parseValor(tamanho)
    const loteNum = parseValor(valorLote)
    if (ultimoEditado === 'lote' && tamanhoNum > 0) {
      const metro = loteNum / tamanhoNum
      setValorMetro(formatarMonetario(metro))
    }
  }, [valorLote, tamanho])

  useEffect(() => {
    const tamanhoNum = parseValor(tamanho)
    const metroNum = parseValor(valorMetro)
    if (ultimoEditado === 'metro' && tamanhoNum > 0) {
      const novoValorLote = tamanhoNum * metroNum
      setValorLote(formatarMonetario(novoValorLote))
    }
  }, [valorMetro, tamanho])

  const handleValorLoteChange = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    const numero = (parseInt(apenasNumeros || '0', 10) / 100).toFixed(2)
    const formatado = numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setUltimoEditado('lote')
    setValorLote(formatado)
  }

  const handleValorMetroChange = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    const numero = (parseInt(apenasNumeros || '0', 10) / 100).toFixed(2)
    const formatado = numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setUltimoEditado('metro')
    setValorMetro(formatado)
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Valor do Lote (R$)</label>
        <input
          type="text"
          value={valorLote}
          onChange={(e) => handleValorLoteChange(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Ex: 150.000,00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Valor do m² (R$)</label>
        <input
          type="text"
          value={valorMetro}
          onChange={(e) => handleValorMetroChange(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Calculado com base no tamanho"
        />
      </div>
    </>
  )
}

export default ValorMetroQuadrado
