import { useState, useEffect, useCallback } from 'react';
import GoogleSheetsService, { LoteValidation } from '../services/googleSheetsService';

// URL do Google Sheets publicado como CSV
// Esta URL aponta para a planilha real de Alvarás 2025
const GOOGLE_SHEETS_CSV_URL = (window as any).REACT_APP_GOOGLE_SHEETS_URL || 
  'https://docs.google.com/spreadsheets/d/1NRpcuzuavSBnLrvbc-WMSdQAC0J3TMaZbW5u0LW-NXo/export?format=csv&gid=0';

const googleSheetsService = new GoogleSheetsService({
  csvUrl: GOOGLE_SHEETS_CSV_URL
});

export interface UseGoogleSheetsReturn {
  validations: LoteValidation[];
  loading: boolean;
  error: string | null;
  validateLote: (setor: string, quadra: string) => Promise<LoteValidation | null>;
  refreshData: () => Promise<void>;
}

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [validations, setValidations] = useState<LoteValidation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await googleSheetsService.fetchLoteValidations();
      setValidations(data);
    } catch (err) {
      setError('Erro ao carregar dados de validação dos lotes');
      console.error('Erro no useGoogleSheets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateLote = useCallback(async (setor: string, quadra: string): Promise<LoteValidation | null> => {
    try {
      return await googleSheetsService.validateLote(setor, quadra);
    } catch (err) {
      console.error('Erro ao validar lote:', err);
      return null;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    validations,
    loading,
    error,
    validateLote,
    refreshData
  };
};

