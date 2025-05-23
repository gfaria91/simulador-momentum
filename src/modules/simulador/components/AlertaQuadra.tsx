import React, { useEffect, useState } from 'react'
import alvarasData from './base_alvaras_simulada.json'

type Props = {
  quadra: string
  setor: string
}

const AlertaQuadra = ({ quadra, setor }: Props) => {
  const [responsavel, setResponsavel] = useState('')
  const [campanha, setCampanha] = useState('')

  useEffect(() => {
    if (quadra.length === 2) {
      const letra = quadra[1].toUpperCase()
      const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const index = alfabeto.indexOf(letra)

      if (index % 2 === 0) {
        setResponsavel('Laerte')
      } else {
        setResponsavel('Danilo')
      }

      const baseSetor = (alvarasData as any)[setor] || {}
      const qtd = baseSetor[quadra.toUpperCase()] ?? 0

      if (qtd <= 3) {
        setCampanha('Casa Pronta Lote Quitado')
      } else if (qtd <= 13) {
        setCampanha('Pontualidade Premiada')
      } else {
        setCampanha('Sem Campanha')
      }
    } else {
      setResponsavel('')
      setCampanha('')
    }
  }, [quadra, setor])

  return (
    <div className="mt-2 space-y-1">
      {responsavel && (
        <div className={responsavel === 'Danilo' ? 'text-blue-600 font-semibold' : 'text-red-600 font-semibold'}>
          Quadra {responsavel}
        </div>
      )}
      {campanha && (
        <div className={
          campanha === 'Casa Pronta Lote Quitado' ? 'text-green-600 font-medium' :
          campanha === 'Pontualidade Premiada' ? 'text-yellow-600 font-medium' :
          'text-gray-500 font-medium'
        }>
          {campanha}
        </div>
      )}
    </div>
  )
}

export default AlertaQuadra
