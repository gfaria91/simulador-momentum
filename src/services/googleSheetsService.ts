import axios from 'axios';

export interface LoteValidation {
  setor: string;
  quadra: string;
  qntAlvaras: number;
  tipoQuadra: 'Laerte' | 'Danilo';
  campanhaDisponivel: 'Pontualidade Premiada' | 'Casa Pronta Lote Quitado' | 'Sem Campanha';
}

export interface GoogleSheetsConfig {
  csvUrl: string;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  private parseCSV(csvText: string): LoteValidation[] {
    const rows = csvText.split(/\r?\n/);
    const data: LoteValidation[] = [];
    
    // Pular a primeira linha (cabeçalhos)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue; // Pular linhas vazias
      
      const columns = row.split(',');
      if (columns.length >= 3) {
        const setor = columns[0]?.trim() || '';
        const quadra = columns[1]?.trim() || '';
        const qntAlvaras = parseInt(columns[2]?.trim() || '0', 10);
        
        // Determinar tipo de quadra baseado na segunda letra
        const tipoQuadra = GoogleSheetsService.determinarTipoQuadra(quadra);
        
        // Determinar campanha baseada na quantidade de alvarás
        const campanhaDisponivel = GoogleSheetsService.determinarCampanha(qntAlvaras);
        
        data.push({
          setor,
          quadra,
          qntAlvaras,
          tipoQuadra,
          campanhaDisponivel
        });
      }
    }
    
    return data;
  }

  async fetchLoteValidations(): Promise<LoteValidation[]> {
    try {
      const response = await axios.get(this.config.csvUrl);
      return this.parseCSV(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do Google Sheets:', error);
      return [];
    }
  }

  async validateLote(setor: string, quadra: string): Promise<LoteValidation | null> {
    try {
      const validations = await this.fetchLoteValidations();
      
      // Buscar por setor e quadra específicos
      const validation = validations.find(v => 
        v.setor.toLowerCase() === setor.toLowerCase() && 
        v.quadra.toLowerCase() === quadra.toLowerCase()
      );
      
      // Se não encontrar na planilha, criar validação padrão (0 alvarás = Casa Pronta)
      if (!validation) {
        return {
          setor,
          quadra,
          qntAlvaras: 0,
          tipoQuadra: GoogleSheetsService.determinarTipoQuadra(quadra),
          campanhaDisponivel: 'Casa Pronta Lote Quitado' // 0 alvarás = Casa Pronta
        };
      }
      
      return validation;
    } catch (error) {
      console.error('Erro ao validar lote:', error);
      // Fallback: criar validação padrão
      return {
        setor,
        quadra,
        qntAlvaras: 0,
        tipoQuadra: GoogleSheetsService.determinarTipoQuadra(quadra),
        campanhaDisponivel: 'Casa Pronta Lote Quitado'
      };
    }
  }

  // Método para determinar tipo de quadra baseado na segunda letra
  static determinarTipoQuadra(quadra: string): 'Laerte' | 'Danilo' {
    if (quadra.length < 2) return 'Danilo';
    
    const segundaLetra = quadra.charAt(1).toUpperCase();
    const letrasLaerte = ['A', 'C', 'E', 'G', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y'];
    
    return letrasLaerte.includes(segundaLetra) ? 'Laerte' : 'Danilo';
  }

  // Método para determinar campanha baseado na quantidade de alvarás
  static determinarCampanha(qntAlvaras: number): 'Pontualidade Premiada' | 'Casa Pronta Lote Quitado' | 'Sem Campanha' {
    if (qntAlvaras >= 4 && qntAlvaras <= 13) {
      return 'Pontualidade Premiada';
    } else if (qntAlvaras <= 3) {
      return 'Casa Pronta Lote Quitado';
    } else {
      return 'Sem Campanha';
    }
  }
}

export default GoogleSheetsService;

