import { TaxasJson, TaxasConfig } from "../types/taxas";

export function mapTaxasJsonToTaxasConfig(jsonData: TaxasJson): TaxasConfig {
  console.log("[DEBUG] mapTaxasJsonToTaxasConfig: Starting mapping. jsonData:", JSON.parse(JSON.stringify(jsonData)));

  // Default values
  let taxaConservacaoComumValorBase = 0;
  let taxaConservacaoNobreValorBase = 0;
  let taxaMelhoramentosValorBase = 0;
  let taxaTransporteValorBase = 0;
  let taxaSlimValorBase = 0;

  // Process 'conservacao'
  if (jsonData && Array.isArray(jsonData.conservacao)) {
    const conservacaoConfig = jsonData.conservacao.find(c => c.tipo !== "titulo");
    console.log("[DEBUG] mapTaxasJsonToTaxasConfig: conservacaoConfig:", conservacaoConfig);
    if (conservacaoConfig && conservacaoConfig.valores && Array.isArray(conservacaoConfig.valores)) {
      const comum = conservacaoConfig.valores.find(v => v.categoria === "COMUM");
      const nobre = conservacaoConfig.valores.find(v => v.categoria === "NOBRE");
      if (comum && typeof comum.valor === 'number') {
        taxaConservacaoComumValorBase = comum.valor;
        console.log("[DEBUG] mapTaxasJsonToTaxasConfig: taxaConservacaoComumValorBase set to:", comum.valor);
      } else {
        console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: 'COMUM' category or its value not found/invalid in conservacaoConfig.valores");
      }
      if (nobre && typeof nobre.valor === 'number') {
        taxaConservacaoNobreValorBase = nobre.valor;
        console.log("[DEBUG] mapTaxasJsonToTaxasConfig: taxaConservacaoNobreValorBase set to:", nobre.valor);
      } else {
        console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: 'NOBRE' category or its value not found/invalid in conservacaoConfig.valores");
      }
    } else {
      console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: conservacaoConfig.valores is not an array or conservacaoConfig is missing.");
    }
  } else {
    console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: jsonData.conservacao is not an array or jsonData is missing.");
  }

  // Process 'melhoramentos'
  if (jsonData && Array.isArray(jsonData.melhoramentos)) {
    const melhoramentosConfig = jsonData.melhoramentos.find(m => m.tipo !== "titulo");
    console.log("[DEBUG] mapTaxasJsonToTaxasConfig: melhoramentosConfig:", melhoramentosConfig);
    if (melhoramentosConfig && typeof melhoramentosConfig.valor_base === 'number') {
      taxaMelhoramentosValorBase = melhoramentosConfig.valor_base;
      console.log("[DEBUG] mapTaxasJsonToTaxasConfig: taxaMelhoramentosValorBase set to:", melhoramentosConfig.valor_base);
    } else {
      console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: melhoramentosConfig or valor_base not found/invalid.");
    }
  } else {
    console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: jsonData.melhoramentos is not an array or jsonData is missing.");
  }

  // Process 'transporte'
  if (jsonData && Array.isArray(jsonData.transporte)) {
    const transporteConfig = jsonData.transporte.find(t => t.tipo !== "titulo");
    console.log("[DEBUG] mapTaxasJsonToTaxasConfig: transporteConfig:", transporteConfig);
    if (transporteConfig && typeof transporteConfig.valor_base === 'number') {
      taxaTransporteValorBase = transporteConfig.valor_base;
      console.log("[DEBUG] mapTaxasJsonToTaxasConfig: taxaTransporteValorBase set to:", transporteConfig.valor_base);
    } else {
      console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: transporteConfig or valor_base not found/invalid.");
    }
  } else {
    console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: jsonData.transporte is not an array or jsonData is missing.");
  }

  // Process 'slim'
  if (jsonData && Array.isArray(jsonData.slim)) {
    const slimConfig = jsonData.slim.find(s => s.tipo !== "titulo");
    console.log("[DEBUG] mapTaxasJsonToTaxasConfig: slimConfig:", slimConfig);
    if (slimConfig && typeof slimConfig.valor_base === 'number') {
      taxaSlimValorBase = slimConfig.valor_base;
      console.log("[DEBUG] mapTaxasJsonToTaxasConfig: taxaSlimValorBase set to:", slimConfig.valor_base);
    } else {
      console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: slimConfig or valor_base not found/invalid.");
    }
  } else {
    console.warn("[DEBUG] mapTaxasJsonToTaxasConfig: jsonData.slim is not an array or jsonData is missing.");
  }
  
  const taxasAdicionaisPorLote = {
    melhoramentos: taxaMelhoramentosValorBase,
    transporte: taxaTransporteValorBase,
    slim: taxaSlimValorBase,
  };
  console.log("[DEBUG] mapTaxasJsonToTaxasConfig: taxasAdicionaisPorLote:", taxasAdicionaisPorLote);

  const result = {
    conservacaoComumValorBase: taxaConservacaoComumValorBase,
    conservacaoNobreValorBase: taxaConservacaoNobreValorBase,
    taxaMelhoramentosValorBase,
    taxaTransporteValorBase,
    taxaSlimValorBase,
    taxasAdicionaisPorLote,
  };
  console.log("[DEBUG] mapTaxasJsonToTaxasConfig: Mapping finished. Result:", result);
  return result;
}

