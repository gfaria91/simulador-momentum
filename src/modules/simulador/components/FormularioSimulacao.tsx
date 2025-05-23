import React, { useState } from 'react'
import ConfigMoeda from './ConfigMoeda'
import DadosLote from './DadosLote'


const FormularioSimulacao = () => {
const [tipoCliente, setTipoCliente] = useState('CCB')
const [setor, setSetor] = useState('Setor')
const [quadra, setQuadra] = useState('')
const [lote, setLote] = useState('')
const [tamanho, setTamanho] = useState('')
const [mostrarEmPes, setMostrarEmPes] = useState(false)
const [valorLote, setValorLote] = useState('')
const [moedaSelecionada, setMoedaSelecionada] = useState('BRL')
const [cotacaoManual, setCotacaoManual] = useState('')
const [cotacaoAPI, setCotacaoAPI] = useState('1.00')

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Formulário de Simulação</h2>
      <ConfigMoeda
  moedaSelecionada={moedaSelecionada}
  setMoedaSelecionada={setMoedaSelecionada}
  cotacaoManual={cotacaoManual}
  setCotacaoManual={setCotacaoManual}
  cotacaoAPI={cotacaoAPI}
  setCotacaoAPI={setCotacaoAPI}
/>
<ConfigMoeda
  moedaSelecionada={moedaSelecionada}
  setMoedaSelecionada={setMoedaSelecionada}
  cotacaoManual={cotacaoManual}
  setCotacaoManual={setCotacaoManual}
  cotacaoAPI={cotacaoAPI}
  setCotacaoAPI={setCotacaoAPI}
/>

<DadosLote
  tipoCliente={tipoCliente}
  setTipoCliente={setTipoCliente}
  setor={setor}
  setSetor={setSetor}
  quadra={quadra}
  setQuadra={setQuadra}
  lote={lote}
  setLote={setLote}
  tamanho={tamanho}
  setTamanho={setTamanho}
  mostrarEmPes={mostrarEmPes}
  setMostrarEmPes={setMostrarEmPes}
  valorLote={valorLote}
  setValorLote={setValorLote}
/>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Valor do Lote (R$)</label>
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="Ex: 150.000,00" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tamanho do Lote (m²)</label>
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="Ex: 450,00" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tipo de Cliente</label>
          <select className="border rounded px-3 py-2 w-full">
            <option>CCB</option>
            <option>Venda Direta</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Setor</label>
          <select className="border rounded px-3 py-2 w-full">
            <option>Setor</option>
            <option>Marina</option>
            <option>Iate</option>
          </select>
        </div>
        <div className="md:col-span-2 text-right">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            Simular
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioSimulacao
