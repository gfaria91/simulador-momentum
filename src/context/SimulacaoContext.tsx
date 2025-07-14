import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SimulacaoInput, ResultadoSimulacao } from '../logic/calculationLogic';

interface SimulacaoContextType {
  resultado: ResultadoSimulacao | null;
  inputData: SimulacaoInput | null;
  setSimulacaoData: (resultado: ResultadoSimulacao | null, inputData: SimulacaoInput | null) => void;
}

const SimulacaoContext = createContext<SimulacaoContextType | undefined>(undefined);

export const SimulacaoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [inputData, setInputData] = useState<SimulacaoInput | null>(null);

  const setSimulacaoData = (resultado: ResultadoSimulacao | null, inputData: SimulacaoInput | null) => {
    setResultado(resultado);
    setInputData(inputData);
  };

  return (
    <SimulacaoContext.Provider value={{ resultado, inputData, setSimulacaoData }}>
      {children}
    </SimulacaoContext.Provider>
  );
};

export const useSimulacao = (): SimulacaoContextType => {
  const context = useContext(SimulacaoContext);
  if (context === undefined) {
    throw new Error('useSimulacao must be used within a SimulacaoProvider');
  }
  return context;
};
