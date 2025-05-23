import React, { useState } from 'react'
import taxasData from '../data/valoresTaxas.json'

const TaxasAdicionais = () => {
  const [quantidadeLotes, setQuantidadeLotes] = useState(1)
  const [tipoLote, setTipoLote] = useState('comum')
  const [valorComum, setValorComum] = useState(taxasData.valorBase.comum)
  const [valorNobre, setValorNobre] = useState(taxasData.valorBase.nobre)
  const [slim, setSlim] = useState(taxasData.taxas.slim)
  const [melhoramentos, setMelhoramentos] = useState(taxasData.taxas.melhoramentos)
  const [transporte, setTransporte] = useState(taxasData.taxas.transporte)
  const [outras, setOutras] = useState(taxasData.taxas.outras)

  return (
    <section className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Taxas Adicionais</h3>
      <p className="text-sm text-gray-600 mb-4 italic">
        Taxas atualizadas em {taxasData.ultimaAtualizacao}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantidade de Lotes</label>
          <input
            type="number"
            min={1}
            value={quantidadeLotes}
            onChange={(e) => setQuantidadeLotes(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Lote para Taxa de Conservação</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={tipoLote}
            onChange={(e) => setTipoLote(e.target.value)}
          >
            <option value="comum">Comum</option>
            <option value="nobre">Nobre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valor Base Taxa Conserv. Comum (R$)</label>
          <input
            type="text"
            value={valorComum}
            onChange={(e) => setValorComum(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valor Base Taxa Conserv. Nobre (R$)</label>
          <input
            type="text"
            value={valorNobre}
            onChange={(e) => setValorNobre(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" className="form-checkbox" defaultChecked />
          <label className="text-sm font-medium">Taxa SLIM (R$):</label>
          <input
            type="text"
            value={slim}
            onChange={(e) => setSlim(e.target.value)}
            className="border rounded px-3 py-1 w-24"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" className="form-checkbox" defaultChecked />
          <label className="text-sm font-medium">Melhoramentos:</label>
          <input
            type="text"
            value={melhoramentos}
            onChange={(e) => setMelhoramentos(e.target.value)}
            className="border rounded px-3 py-1 w-24"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" className="form-checkbox" defaultChecked />
          <label className="text-sm font-medium">Transporte:</label>
          <input
            type="text"
            value={transporte}
            onChange={(e) => setTransporte(e.target.value)}
            className="border rounded px-3 py-1 w-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Outras Taxas (R$)</label>
          <input
            type="text"
            value={outras}
            onChange={(e) => setOutras(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>
    </section>
  )
}

export default TaxasAdicionais
