import React from 'react';
import Campanha50PorcentoSimulacao from '../components/Campanha50PorcentoSimulacao';
import { useNavigate } from 'react-router-dom';
import { useSimulacao } from '../context/SimulacaoContext';
import type { SimulacaoInput, ResultadoSimulacao } from '../logic/calculationLogic';

const Campanha50PorcentoPage: React.FC = () => {
  const navigate = useNavigate();
  const { resultado, inputData } = useSimulacao();

  const handleVoltar = () => {
    navigate('/');
  };

  // Determinar qual opção de financiamento usar para a campanha
  let valorEntrada = 0;
  let valorParcelaMensal = 0;
  let numeroParcelas = 0;
  let valorLote = 0;

  if (resultado && inputData) {
    valorLote = inputData.valorLote || 0;
    
    if (resultado.opcao1 && (resultado.opcao1.valorParcela > 0 || (resultado.opcao1.valorParcela === 0 && resultado.opcao1.valorFinanciado === 0))) {
      valorEntrada = resultado.opcao1.valorEntrada;
      valorParcelaMensal = resultado.opcao1.valorParcela;
      numeroParcelas = resultado.opcao1.parcelas;
    } else if (resultado.opcao2 && (resultado.opcao2.valorParcela > 0 || (resultado.opcao2.valorParcela === 0 && resultado.opcao2.valorFinanciado === 0))) {
      valorEntrada = resultado.opcao2.valorEntrada;
      valorParcelaMensal = resultado.opcao2.valorParcela;
      numeroParcelas = resultado.opcao2.parcelas;
    }
  }

  return (
    <div className="container mx-auto p-4 pb-20 md:pb-12">
      <h1 className="text-3xl font-bold text-center mb-6">Simulador Financeiro de Lotes</h1>
      
      {resultado && inputData ? (
        <Campanha50PorcentoSimulacao
          valorLoteOriginal={valorLote}
          valorEntrada={valorEntrada}
          valorParcelaMensalInicial={valorParcelaMensal}
          numeroParcelas={numeroParcelas}
          igpmInicial={0}
          onVoltar={handleVoltar}
        />
      ) : (
        <div className="text-center p-8">
          <p className="text-lg mb-4">Nenhuma simulação disponível. Por favor, retorne à página principal e realize uma simulação primeiro.</p>
          <button
            onClick={handleVoltar}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar para Simulação
          </button>
        </div>
      )}
    </div>
  );
};

export default Campanha50PorcentoPage;
