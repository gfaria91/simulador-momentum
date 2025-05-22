import React from 'react'

type SimulacaoCardProps = {
  titulo: string
  entrada: number
  juros: number
  prazo: number
  parcela: number
  totalMes: number
}

export const SimulacaoCard = ({
  titulo,
  entrada,
  juros,
  prazo,
  parcela,
  totalMes
}: SimulacaoCardProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-lg font-bold text-blue-700 mb-2">{titulo}</h2>
      <p><strong>Entrada:</strong> R$ {entrada.toLocaleString()}</p>
      <p><strong>Juros:</strong> {juros.toFixed(2)}% a.m.</p>
      <p><strong>Prazo:</strong> {prazo} meses</p>
      <p><strong>Parcela:</strong> R$ {parcela.toLocaleString()}</p>
      <p><strong>Total Mês:</strong> R$ {totalMes.toLocaleString()}</p>
    </div>
  )
}
