import React, { useState } from 'react'
import ConfigMoeda from './ConfigMoeda'
import DadosLote from './DadosLote'
import TaxasAdicionais from './TaxasAdicionais'
import Simulacao1 from './Simulacao1'
import Simulacao2 from './Simulacao2'

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

<TaxasAdicionais />

<Simulacao1 tipoCliente={tipoCliente} valorLote={valorLote} />

<Simulacao2 valorLote={valorLote} />

  </div>
  )
}

export default FormularioSimulacao
