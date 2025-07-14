export type TipoCliente = "CCB" | "Venda Direta";
export type Moeda = "BRL" | "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF";
export type TipoLoteConservacao = "Comum" | "Nobre";
export type SetorLote = "Marina" | "Iate";

export interface SimulacaoInput {
  tipoCliente: TipoCliente;
  setor: string;
  quadra: string;
  lote: string;
  tamanhoLote: number;
  valorLote?: number;
  
  // Opção 1
  entradaPercentualOpcao1: number;
  entradaValorOpcao1?: number;
  parcelasOpcao1: number;
  taxaJurosMensalOpcao1: number;
  
  // Opção 2
  entradaPercentualOpcao2: number;
  entradaValorOpcao2?: number;
  parcelasOpcao2: number;
  taxaJurosMensalOpcao2: number;
  
  // Taxas
  tipoLoteConservacao: TipoLoteConservacao;
  taxaConservacaoComumEditada?: number;
  taxaConservacaoNobreEditada?: number;
  quantidadeLotesParaTaxas: number;
  
  // Checkboxes para taxas
  selecionadoSlim: boolean;
  valorSlim?: number;
  selecionadoMelhoramentos: boolean;
  valorMelhoramentos?: number;
  selecionadoTransporte: boolean;
  valorTransporte?: number;
  outrasTaxas?: number;
}

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

export interface FinanciamentoOutput {
  valorEntrada: number;
  entradaPercentual: number;
  valorFinanciado: number;
  parcelas: number;
  taxaJurosMensal: number;
  valorParcela: number;
  totalPago: number;
  totalJuros: number;
}

export interface TaxasDetalhadas {
  valorConservacao: number;
  valorSlim: number;
  valorMelhoramentos: number;
  valorTransporte: number;
  valorOutrasTaxas: number;
  totalTaxasAdicionaisMensais: number;
}

export interface ResultadoSimulacao {
  opcao1?: FinanciamentoOutput;
  opcao2?: FinanciamentoOutput;
  condominioTotal?: number;
  taxasDetalhadas?: TaxasDetalhadas;
}

export const TAXAS_JUROS_MENSAIS = [
  { value: 0.0000, label: "0,00%" },
  { value: 0.0033, label: "0,33%" },
  { value: 0.0029, label: "0,29%" },
  { value: 0.0025, label: "0,25%" },
  { value: 0.0021, label: "0,21%" },
  { value: 0.0017, label: "0,17%" }
];

export const taxasDeJurosMensalOpcoes = TAXAS_JUROS_MENSAIS;

export const TIPOS_LOTE_TAXA = [
  { value: "Comum", label: "Comum" },
  { value: "Nobre", label: "Nobre" }
];

export const SETORES = [
  { value: "Marina", label: "Marina" },
  { value: "Iate", label: "Iate" }
];

export const calcularPMT = (principal: number, taxaMensal: number, numParcelas: number): number => {
  if (taxaMensal === 0) {
    return principal / numParcelas;
  }
  const x = Math.pow(1 + taxaMensal, numParcelas);
  return principal * ((taxaMensal * x) / (x - 1));
};

export const formatCurrency = (value: number, currencyCode: string = 'BRL', decimalPlaces: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
};

export const calcularSimulacao = (input: SimulacaoInput): ResultadoSimulacao => {
  const resultado: ResultadoSimulacao = {};
  
  // Validação de entrada
  if (!input.valorLote || input.valorLote <= 0) {
    return resultado;
  }

  // Calcular opção 1 (padrão)
  const valorEntradaOpcao1 = input.entradaValorOpcao1 || (input.valorLote * (input.entradaPercentualOpcao1 / 100));
  const valorFinanciadoOpcao1 = input.valorLote - valorEntradaOpcao1;
  
  if (valorFinanciadoOpcao1 <= 0) {
    // Caso especial: pagamento à vista (sem financiamento)
    resultado.opcao1 = {
      valorEntrada: input.valorLote,
      entradaPercentual: 100,
      valorFinanciado: 0,
      parcelas: 0,
      taxaJurosMensal: 0,
      valorParcela: 0,
      totalPago: input.valorLote,
      totalJuros: 0
    };
  } else {
    const valorParcelaOpcao1 = calcularPMT(valorFinanciadoOpcao1, input.taxaJurosMensalOpcao1, input.parcelasOpcao1);
    const totalPagoOpcao1 = valorEntradaOpcao1 + (valorParcelaOpcao1 * input.parcelasOpcao1);
    const totalJurosOpcao1 = totalPagoOpcao1 - input.valorLote;
    
    resultado.opcao1 = {
      valorEntrada: valorEntradaOpcao1,
      entradaPercentual: input.entradaPercentualOpcao1,
      valorFinanciado: valorFinanciadoOpcao1,
      parcelas: input.parcelasOpcao1,
      taxaJurosMensal: input.taxaJurosMensalOpcao1,
      valorParcela: valorParcelaOpcao1,
      totalPago: totalPagoOpcao1,
      totalJuros: totalJurosOpcao1
    };
  }

  // Calcular opção 2 (sempre disponível - MOMENTUM)
  const valorEntradaOpcao2 = input.entradaValorOpcao2 || (input.valorLote * (input.entradaPercentualOpcao2 / 100));
  const valorFinanciadoOpcao2 = input.valorLote - valorEntradaOpcao2;
  
  if (valorFinanciadoOpcao2 <= 0) {
    resultado.opcao2 = {
      valorEntrada: input.valorLote,
      entradaPercentual: 100,
      valorFinanciado: 0,
      parcelas: 0,
      taxaJurosMensal: 0,
      valorParcela: 0,
      totalPago: input.valorLote,
      totalJuros: 0
    };
  } else {
    const valorParcelaOpcao2 = calcularPMT(valorFinanciadoOpcao2, input.taxaJurosMensalOpcao2, input.parcelasOpcao2);
    const totalPagoOpcao2 = valorEntradaOpcao2 + (valorParcelaOpcao2 * input.parcelasOpcao2);
    const totalJurosOpcao2 = totalPagoOpcao2 - input.valorLote;
    
    resultado.opcao2 = {
      valorEntrada: valorEntradaOpcao2,
      entradaPercentual: input.entradaPercentualOpcao2,
      valorFinanciado: valorFinanciadoOpcao2,
      parcelas: input.parcelasOpcao2,
      taxaJurosMensal: input.taxaJurosMensalOpcao2,
      valorParcela: valorParcelaOpcao2,
      totalPago: totalPagoOpcao2,
      totalJuros: totalJurosOpcao2
    };
  }

  // Calcular valor total do condomínio e taxas detalhadas
  let condominioTotal = 0;
  const taxasDetalhadas: TaxasDetalhadas = {
    valorConservacao: 0,
    valorSlim: 0,
    valorMelhoramentos: 0,
    valorTransporte: 0,
    valorOutrasTaxas: 0,
    totalTaxasAdicionaisMensais: 0
  };
  
  // Adicionar taxa de conservação (comum ou nobre)
  if (input.tipoLoteConservacao === "Comum" && input.taxaConservacaoComumEditada) {
    taxasDetalhadas.valorConservacao = input.taxaConservacaoComumEditada * input.quantidadeLotesParaTaxas;
  } else if (input.tipoLoteConservacao === "Nobre" && input.taxaConservacaoNobreEditada) {
    taxasDetalhadas.valorConservacao = input.taxaConservacaoNobreEditada * input.quantidadeLotesParaTaxas;
  }
  
  // Adicionar outras taxas
  if (input.selecionadoSlim && input.valorSlim) {
    taxasDetalhadas.valorSlim = input.valorSlim * input.quantidadeLotesParaTaxas;
  }
  
  if (input.selecionadoMelhoramentos && input.valorMelhoramentos) {
    taxasDetalhadas.valorMelhoramentos = input.valorMelhoramentos * input.quantidadeLotesParaTaxas;
  }
  
  if (input.selecionadoTransporte && input.valorTransporte) {
    taxasDetalhadas.valorTransporte = input.valorTransporte * input.quantidadeLotesParaTaxas;
  }
  
  if (input.outrasTaxas) {
    taxasDetalhadas.valorOutrasTaxas = input.outrasTaxas * input.quantidadeLotesParaTaxas;
  }
  
  // Calcular total de taxas
  taxasDetalhadas.totalTaxasAdicionaisMensais = 
    taxasDetalhadas.valorConservacao + 
    taxasDetalhadas.valorSlim + 
    taxasDetalhadas.valorMelhoramentos + 
    taxasDetalhadas.valorTransporte + 
    taxasDetalhadas.valorOutrasTaxas;
  
  condominioTotal = taxasDetalhadas.totalTaxasAdicionaisMensais;
  
  resultado.condominioTotal = condominioTotal;
  resultado.taxasDetalhadas = taxasDetalhadas;
  
  return resultado;
};
