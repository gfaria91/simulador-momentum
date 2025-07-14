import React, { useEffect, useState } from 'react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import GoogleSheetsService, { LoteValidation } from '../services/googleSheetsService';

interface QuadraValidationInfoProps {
  setor: string;
  quadra: string;
  onValidationChange?: (validation: LoteValidation | null) => void;
}

const QuadraValidationInfo: React.FC<QuadraValidationInfoProps> = ({
  setor,
  quadra,
  onValidationChange
}) => {
  const { validateLote, loading } = useGoogleSheets();
  const [validation, setValidation] = useState<LoteValidation | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const performValidation = async () => {
      if (!setor || !quadra || quadra.length < 2) {
        setValidation(null);
        onValidationChange?.(null);
        return;
      }

      setLocalLoading(true);
      
      try {
        // Primeiro, tentar validar via Google Sheets
        const sheetValidation = await validateLote(setor, quadra);
        
        if (sheetValidation) {
          setValidation(sheetValidation);
          onValidationChange?.(sheetValidation);
        } else {
          // Se não encontrar na planilha, usar lógica local para determinar tipo de quadra
          const tipoQuadra = GoogleSheetsService.determinarTipoQuadra(quadra);
          const fallbackValidation: LoteValidation = {
            setor,
            quadra,
            qntAlvaras: 0, // Lotes não encontrados = 0 alvarás = Casa Pronta
            tipoQuadra,
            campanhaDisponivel: 'Casa Pronta Lote Quitado'
          };
          setValidation(fallbackValidation);
          onValidationChange?.(fallbackValidation);
        }
      } catch (error) {
        console.error('Erro na validação:', error);
        // Em caso de erro, usar lógica local
        const tipoQuadra = GoogleSheetsService.determinarTipoQuadra(quadra);
        const fallbackValidation: LoteValidation = {
          setor,
          quadra,
          qntAlvaras: 0, // Em caso de erro = 0 alvarás = Casa Pronta
          tipoQuadra,
          campanhaDisponivel: 'Casa Pronta Lote Quitado'
        };
        setValidation(fallbackValidation);
        onValidationChange?.(fallbackValidation);
      } finally {
        setLocalLoading(false);
      }
    };

    performValidation();
  }, [setor, quadra, validateLote, onValidationChange]);

  if (!quadra || quadra.length < 2) {
    return null;
  }

  if (loading || localLoading) {
    return (
      <div className="mt-2 text-sm text-gray-500">
        Validando quadra...
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  const getTipoQuadraColor = (tipo: 'Laerte' | 'Danilo') => {
    return tipo === 'Laerte' ? 'text-red-600' : 'text-blue-600';
  };

  const getCampanhaColor = (campanha: string) => {
    switch (campanha) {
      case 'Pontualidade Premiada':
        return 'text-purple-600';
      case 'Casa Pronta Lote Quitado':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
      <div className="space-y-1 text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Tipo de Quadra:</span>
          <span className={`font-semibold ${getTipoQuadraColor(validation.tipoQuadra)}`}>
            Quadra {validation.tipoQuadra}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">Campanha Disponível:</span>
          <span className={`font-semibold ${getCampanhaColor(validation.campanhaDisponivel)}`}>
            {validation.campanhaDisponivel}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">Quantidade de Alvarás:</span>
          <span className="font-semibold text-gray-700">
            {validation.qntAlvaras}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuadraValidationInfo;

