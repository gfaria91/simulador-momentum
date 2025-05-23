import React from 'react'
import QuadraAlerta from './QuadraAlerta'

type Props = {
  tipoCliente: string
  setTipoCliente: (value: string) => void
  setor: string
  setSetor: (value: string) => void
  quadra: string
  setQuadra: (value: string) => void
  lote: string
  setLote: (value: string) => void
  tamanho: string
  setTamanho: (value: string) => void
  mostrarEmPes: boolean
  setMostrarEmPes: (value: boolean) => void
  valorLote: string
  setValorLote: (value: string) => void
}

const DadosLote = ({
  tipoCliente, setTipoCliente,
  setor, setSetor,
  quadra, setQuadra,
  lote, setLote,
  tamanho, setTamanho,
  mostrarEmPes, setMostrarEmPes,
  valorLote, setValorLote
}: Props) => {

  const formatarMoeda = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    const numero = (parseInt(apenasNumeros || '0', 10) / 100).toFixed(2)
    return numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleValor = (value: string, setFn: (v: string) => void) => {
    setFn(formatarMoeda(value))
  }

  const handleQuadra = (value: string) => {
    setQuadra(value.replace(/[^A-Z]/g, '').slice(0, 2))
  }

  return (
    <section className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Dados Iniciais do Lote</h3>

      <label className="block text-sm mb-1">Tipo de Cliente</label>
      <select value={tipoCliente} onChange={e => setTipoCliente(e.target.value)} className="border rounded px-3 py-2 w-full mb-3">
        <option value="CCB">CCB</option>
        <option value="Venda Direta">Venda Direta</option>
      </select>

      <label className="block text-sm mb-1">Setor</label>
      <select value={setor} onChange={e => setSetor(e.target.value)} className="border rounded px-3 py-2 w-full mb-3">
        <option value="Setor">Setor</option>
        <option value="Marina">Marina</option>
        <option value="Iate">Iate</option>
      </select>

      <label className="block text-sm mb-1">Quadra</label>
      <input
        type="text"
        value={quadra}
        onChange={(e) => {
          const valor = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
          if (valor.length <= 2) setQuadra(valor)
        }}
        className="border rounded px-3 py-2 w-full uppercase"
        placeholder="Ex: AB"
      />
      {setor && setor !== 'Setor' ? (
        <QuadraAlerta quadra={quadra} setor={setor} />
      ) : (
        <p className="text-sm text-red-600 mt-1">Selecione um setor para exibir o alerta da quadra.</p>
      )}

      <label className="block text-sm mb-1">Lote</label>
      <input
        type="text"
        value={lote}
        onChange={e => setLote(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-3"
        placeholder="Número ou nome do lote"
      />

      <label className="block text-sm mb-1">Tamanho do Lote (m²)</label>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={tamanho}
          onChange={e => handleValor(e.target.value, setTamanho)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Ex: 450,00"
        />
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={mostrarEmPes} onChange={e => setMostrarEmPes(e.target.checked)} />
          Mostrar em ft²
        </label>
      </div>

      <label className="block text-sm mb-1">Valor do Lote (R$)</label>
      <input
        type="text"
        value={valorLote}
        onChange={e => handleValor(e.target.value, setValorLote)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ex: 150.000,00"
      />
    </section>
  )
}

export default DadosLote
