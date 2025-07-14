import React from 'react';
import useQuadraElegibilidadeGoogleSheets from '../hooks/useQuadraElegibilidadeGoogleSheets';

interface QuadraElegibilidadeIndicatorProps {
  quadra: string;
  setor: string;
}

const QuadraElegibilidadeIndicator: React.FC<QuadraElegibilidadeIndicatorProps> = ({ quadra, setor }) => {
  const { tipoQuadra, campanha, loading, error } = useQuadraElegibilidadeGoogleSheets(quadra, setor);

  if (!quadra || quadra.length < 2) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-col space-y-1">
      {tipoQuadra && (
        <span className={`text-sm font-medium ${tipoQuadra === 'Quadra Laerte' ? 'text-red-600' : 'text-blue-600'}`}>
          {tipoQuadra}
        </span>
      )}
      
      {loading ? (
        <span className="text-sm text-gray-500">Carregando informações de campanha...</span>
      ) : error ? (
        <span className="text-sm text-red-500">Erro ao carregar informações de campanha</span>
      ) : campanha && (
        <span className={`text-sm font-medium ${
          campanha === 'Casa Pronta, Lote Quitado' 
            ? 'text-green-600' 
            : campanha === 'Pontualidade Premiada' 
              ? 'text-purple-600' 
              : 'text-gray-600'
        }`}>
          Campanha: {campanha}
        </span>
      )}
    </div>
  );
};

export default QuadraElegibilidadeIndicator;
