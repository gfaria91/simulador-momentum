// Hook para verificar elegibilidade de campanhas usando Google Sheets
import { useState, useEffect } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import GoogleSheetsService from '../services/googleSheetsService';

// Hook personalizado para verificar elegibilidade
export const useQuadraElegibilidadeGoogleSheets = (quadra: string, setor: string) => {
  const [tipoQuadra, setTipoQuadra] = useState<string | null>(null);
  const [campanha, setCampanha] = useState<string | null>(null);
  const [dataAtualizacao, setDataAtualizacao] = useState<string | null>(null);
  const { validateLote, loading, error } = useGoogleSheets();

  useEffect(() => {
    const performValidation = async () => {
      // Determinar o tipo de quadra (Laerte/Danilo)
      if (quadra && quadra.length >= 2) {
        const tipoQuadraLocal = GoogleSheetsService.determinarTipoQuadra(quadra);
        setTipoQuadra(`Quadra ${tipoQuadraLocal}`);
      } else {
        setTipoQuadra(null);
      }

      // Verificar elegibilidade para campanhas via Google Sheets
      if (quadra && setor) {
        try {
          const validation = await validateLote(setor, quadra);
          
          if (validation) {
            setCampanha(validation.campanhaDisponivel);
            setDataAtualizacao(new Date().toISOString());
          } else {
            setCampanha('Sem Campanha');
            setDataAtualizacao(new Date().toISOString());
          }
        } catch (error) {
          console.error('Erro ao verificar elegibilidade:', error);
          setCampanha('Sem Campanha');
          setDataAtualizacao(null);
        }
      } else {
        setCampanha(loading ? 'Carregando...' : null);
      }
    };

    performValidation();
  }, [quadra, setor, validateLote, loading]);

  return { tipoQuadra, campanha, dataAtualizacao, loading, error };
};

export default useQuadraElegibilidadeGoogleSheets;

