export interface TaxaItemValor {
  categoria?: string; // Usado em "conservacao" para COMUM/NOBRE
  valor: number;
  // Outros campos que possam existir em "valores"
}

export interface TaxaItem {
  tipo: string; // "titulo" ou o nome da taxa como "conservacao", "melhoramentos"
  label?: string; // Para "titulo"
  descricao?: string; // Para "titulo"
  valor_base?: number; // Usado em "melhoramentos", "transporte", "slim"
  valores?: TaxaItemValor[]; // Usado em "conservacao"
  // Outros campos que possam existir em cada item de taxa
}

export interface TaxasJson {
  conservacao: TaxaItem[];
  melhoramentos: TaxaItem[];
  transporte: TaxaItem[];
  slim: TaxaItem[];
  // Outras categorias de taxas que possam existir
}

// Tipos já definidos em calculationLogic.ts, mas podem ser centralizados aqui se preferir
// Por ora, manteremos a definição em calculationLogic.ts para evitar redundância imediata
// e focaremos nos tipos específicos para o JSON de taxas.

export type TipoLoteConservacao = "Comum" | "Nobre"; // Repetido de calculationLogic para uso em taxasMapper

export interface TaxasConfig {
  conservacaoComumValorBase: number;
  conservacaoNobreValorBase: number;
  taxaSlimValorBase: number;
  taxaMelhoramentosValorBase: number;
  taxaTransporteValorBase: number;
  taxasAdicionaisPorLote?: {
    melhoramentos: number;
    transporte: number;
    slim: number;
  };
}

