import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calcularSimulacao,
  SimulacaoInput,
  ResultadoSimulacao,
  TipoCliente,
  SetorLote,
  TipoLoteConservacao,
  taxasDeJurosMensalOpcoes,
  Moeda,
  formatCurrency,
  FinanciamentoOutput
} from "./logic/calculationLogic";
import QuadraValidationInfo from "./components/QuadraValidationInfo";
import { LoteValidation } from "./services/googleSheetsService";
import ResultadoCliente from "./components/ResultadoCliente";
import ResultadoClienteMobile from "./components/ResultadoClienteMobile";
import QuadraElegibilidadeIndicator from "./components/QuadraElegibilidadeIndicator";
import { mapTaxasJsonToTaxasConfig } from "./utils/taxasMapper";
import { TaxasConfig, TaxasJson } from "./types/taxas";
import CustomCurrencyInput from "./components/CurrencyInput";
import DecimalInput from "./components/DecimalInput";
import CasaProntaLoteQuitadoSimulacao from "./components/CasaProntaLoteQuitadoSimulacao";
import PontualidadePremiadaSimulacao from "./components/PontualidadePremiadaSimulacao";
import Campanha50PorcentoSimulacao from "./components/Campanha50PorcentoSimulacao";
import type { CheckedState } from '@radix-ui/react-checkbox';

const moedaDisplayNames: Record<Moeda, string> = {
  BRL: "Real (BRL)",
  USD: "Dólar Americano (USD)",
  EUR: "Euro (EUR)",
  GBP: "Libra Esterlina (GBP)",
  CAD: "Dólar Canadense (CAD)",
  AUD: "Dólar Australiano (AUD)",
  CHF: "Franco Suíço (CHF)",
};

const toNumber = (value: any, returnUndefinedOnError: boolean = false): number | undefined => {
  if (value === undefined || value === null || value === "") return returnUndefinedOnError ? undefined : 0;
  const stringValue = String(value);
  if (stringValue.includes('.') && !stringValue.includes(',')) {
    const num = parseFloat(stringValue);
    return isNaN(num) ? (returnUndefinedOnError ? undefined : 0) : num;
  }
  const num = parseFloat(stringValue.replace(/\./g, "").replace(",", "."));
  if (isNaN(num)) return returnUndefinedOnError ? undefined : 0;
  return num;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [taxasConfig, setTaxasConfig] = useState<TaxasConfig | null>(null);
  const [loadingTaxas, setLoadingTaxas] = useState(true);
  const [inputData, setInputData] = useState<SimulacaoInput | null>(null);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [mostrarResultadoCliente, setMostrarResultadoCliente] = useState(false);
  const [mostrarResultadoMobilePrint, setMostrarResultadoMobilePrint] = useState(false);

  // Estados para as campanhas
  const [mostrarCampanhaLoteQuitado, setMostrarCampanhaLoteQuitado] = useState(false);
  const [mostrarCampanhaPontualidade, setMostrarCampanhaPontualidade] = useState(false);
  const [mostrarCampanha50Porcento, setMostrarCampanha50Porcento] = useState(false);

  const [moedaSelecionada, setMoedaSelecionada] = useState<Moeda>("BRL");
  const [taxaCambio, setTaxaCambio] = useState<Record<Moeda, number>>({ BRL: 1, USD: 1, EUR: 1, GBP: 1, CAD: 1, AUD: 1, CHF: 1 });
  const [dataCotacao, setDataCotacao] = useState<string>(new Date().toISOString());
  const [mostrarPesQuadrados, setMostrarPesQuadrados] = useState<boolean>(false);
  const [quadraValidation, setQuadraValidation] = useState<LoteValidation | null>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const buttonsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAppConfigAndRates = async () => {
      setLoadingTaxas(true);
      try {
        const responseTaxas = await fetch("/taxas.json");
        if (!responseTaxas.ok) throw new Error(`HTTP error! status: ${responseTaxas.status} ao buscar taxas.json`);
        const jsonData: TaxasJson = await responseTaxas.json();
        const mappedData = mapTaxasJsonToTaxasConfig(jsonData);
        setTaxasConfig(mappedData);

        const moedasParaBuscar = ["USD-BRL", "USDT-BRL", "EUR-BRL", "GBP-BRL", "CAD-BRL", "AUD-BRL", "CHF-BRL"];
        const responseCambio = await fetch(`https://economia.awesomeapi.com.br/json/last/${moedasParaBuscar.join(",")}`);
        if (!responseCambio.ok) throw new Error(`HTTP error! status: ${responseCambio.status} ao buscar cotações`);
        const cambioData = await responseCambio.json();
        
        const novasTaxasCambio: Record<Moeda, number> = { BRL: 1, USD: 1, EUR: 1, GBP: 1, CAD: 1, AUD: 1, CHF: 1 };
        let cotacaoTimestampGlobal = new Date(0).toISOString();
        let dolarComercial: number | undefined = undefined;
        let dolarTurismo: number | undefined = undefined;

        for (const pair of moedasParaBuscar) {
          const [moedaCodigoApi] = pair.split("-");
          const chaveApi = pair.replace("-", "");
          
          if (cambioData[chaveApi] && cambioData[chaveApi].bid) {
            const valorBid = parseFloat(cambioData[chaveApi].bid);
            if (isNaN(valorBid)) continue;

            if (moedaCodigoApi === "USD") dolarComercial = valorBid;
            else if (moedaCodigoApi === "USDT") dolarTurismo = valorBid;
            else novasTaxasCambio[moedaCodigoApi as Moeda] = valorBid;
            
            const createDateStr = cambioData[chaveApi].create_date;
            if (createDateStr) {
                const currentCotacaoDate = new Date(createDateStr).toISOString();
                if (currentCotacaoDate > cotacaoTimestampGlobal) cotacaoTimestampGlobal = currentCotacaoDate;
            } else if (cambioData[chaveApi].timestamp) {
                const ts = parseInt(cambioData[chaveApi].timestamp, 10) * 1000;
                if (!isNaN(ts)){
                    const currentCotacaoDate = new Date(ts).toISOString();
                    if (currentCotacaoDate > cotacaoTimestampGlobal) cotacaoTimestampGlobal = currentCotacaoDate;
                }
            }
          }
        }

        if (dolarTurismo !== undefined && dolarComercial !== undefined) novasTaxasCambio["USD"] = Math.max(dolarComercial, dolarTurismo);
        else if (dolarComercial !== undefined) novasTaxasCambio["USD"] = dolarComercial;
        else if (dolarTurismo !== undefined) novasTaxasCambio["USD"] = dolarTurismo;
        
        setTaxaCambio(novasTaxasCambio);
        setDataCotacao(cotacaoTimestampGlobal > new Date(0).toISOString() ? cotacaoTimestampGlobal : new Date().toISOString());

      } catch (error) {
        console.error("Erro ao buscar configurações ou cotações:", error);
        setTaxasConfig(null); 
      } finally {
        setLoadingTaxas(false);
      }
    };
    fetchAppConfigAndRates();
  }, []);

  useEffect(() => {
    if (taxasConfig) {
      const valorLoteInicial = 150000;
      const initialFormData: SimulacaoInput = {
        tipoCliente: "CCB",
        setor: "Marina",
        quadra: "", 
        lote: "", 
        tamanhoLote: 450,
        valorLote: valorLoteInicial,
        entradaValorOpcao1: valorLoteInicial * 0.015,
        entradaPercentualOpcao1: 1.5,
        parcelasOpcao1: 180,
        taxaJurosMensalOpcao1: 0.0033,
        entradaValorOpcao2: valorLoteInicial * 0.015, 
        entradaPercentualOpcao2: 1.5, 
        parcelasOpcao2: 24,
        taxaJurosMensalOpcao2: 0.00,
        selecionadoSlim: true,
        valorSlim: toNumber(taxasConfig.taxaSlimValorBase) || 103,
        selecionadoMelhoramentos: true,
        valorMelhoramentos: toNumber(taxasConfig.taxaMelhoramentosValorBase) || 240,
        selecionadoTransporte: true,
        valorTransporte: toNumber(taxasConfig.taxaTransporteValorBase) || 9,
        taxaConservacaoComumEditada: toNumber(taxasConfig.conservacaoComumValorBase) || 434.11,
        taxaConservacaoNobreEditada: toNumber(taxasConfig.conservacaoNobreValorBase) || 1085.28,
        tipoLoteConservacao: "Comum",
        quantidadeLotesParaTaxas: 1,
        outrasTaxas: 0,
      };
      setInputData(initialFormData);
    }
  }, [taxasConfig]);

  const handleNumericInputChange = useCallback((name: string, value: number | undefined) => {
    const fieldName = name as keyof SimulacaoInput;
    setInputData(prev => {
      if (!prev) return null;
      const numericValue = value === undefined ? 0 : value;

      if (fieldName === "valorLote") {
        const novoValorLote = numericValue;
        const novaEntradaValorOpcao1 = novoValorLote * (prev.entradaPercentualOpcao1 / 100);
        const novaEntradaValorOpcao2 = novoValorLote * (prev.entradaPercentualOpcao2 / 100);
        return {
          ...prev,
          valorLote: novoValorLote,
          entradaValorOpcao1: novaEntradaValorOpcao1,
          entradaValorOpcao2: novaEntradaValorOpcao2,
        };
      } else {
        return {
          ...prev,
          [fieldName]: numericValue,
        };
      }
    });
  }, []);

  const handleEntradaChange = useCallback((option: "Opcao1" | "Opcao2", type: "valor" | "percentual", value: number | undefined) => {
    setInputData(prev => {
      if (!prev) return null;
      const valorLote = prev.valorLote;
      const numericValue = value === undefined ? 0 : value;

      let newValor: number = 0;
      let newPercentual: number = 0;

      if (type === "valor") {
        newValor = numericValue;
        const valorLoteSeguro = valorLote ?? 0;
        if (valorLoteSeguro > 0) {
          newPercentual = (newValor / valorLoteSeguro) * 100;
        } else {
          newPercentual = 0;
        }
      } else { 
        newPercentual = numericValue;
        const valorLoteSeguro = valorLote ?? 0;
        newValor = valorLoteSeguro * (newPercentual / 100);
      }
      
      if (option === "Opcao1") {
        return { ...prev, entradaValorOpcao1: newValor, entradaPercentualOpcao1: newPercentual };
      }
      return { ...prev, entradaValorOpcao2: newValor, entradaPercentualOpcao2: newPercentual };
    });
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setInputData(prev => {
      if (!prev) return null;
      let finalValue: string | number | boolean | undefined;

      if (type === "checkbox") {
        finalValue = checked;
      } else if (name === "quadra" || name === "lote") { 
        finalValue = value;
        if (name === "quadra") {
            const processedValue = value.toUpperCase().substring(0, 2);
            finalValue = processedValue;
        }
      } else {
        finalValue = toNumber(value) ?? 0; 
      }

      return {
        ...prev,
        [name]: finalValue,
      } as SimulacaoInput;
    });
  };

  const handleSelectChange = (name: keyof SimulacaoInput, value: string | number) => {
    const finalValue = (typeof value === 'string' && (name.includes("taxaJurosMensal") || name === "parcelasOpcao1" || name === "parcelasOpcao2")) 
                        ? (toNumber(value) ?? 0) 
                        : value;
    setInputData(prev => prev ? { ...prev, [name]: finalValue } as SimulacaoInput : null);
  };

  const handleCheckboxChange = (name: keyof SimulacaoInput, checked: boolean) => {
    setInputData(prev => prev ? { ...prev, [name]: checked } : null);
  };

  const handleMostrarPesQuadradosChange = (checked: CheckedState) => {
    setMostrarPesQuadrados(checked === true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputData || !taxasConfig) return;
    const dataToCalculate: SimulacaoInput = {
      ...inputData,
      valorLote: inputData.valorLote ?? 0,
      tamanhoLote: inputData.tamanhoLote ?? 0,
      entradaValorOpcao1: inputData.entradaValorOpcao1 ?? 0,
      entradaPercentualOpcao1: inputData.entradaPercentualOpcao1 ?? 0,
      entradaValorOpcao2: inputData.entradaValorOpcao2 ?? 0,
      entradaPercentualOpcao2: inputData.entradaPercentualOpcao2 ?? 0,
      valorSlim: inputData.valorSlim ?? 0,
      valorMelhoramentos: inputData.valorMelhoramentos ?? 0,
      valorTransporte: inputData.valorTransporte ?? 0,
      taxaConservacaoComumEditada: inputData.taxaConservacaoComumEditada ?? 0,
      taxaConservacaoNobreEditada: inputData.taxaConservacaoNobreEditada ?? 0,
      quantidadeLotesParaTaxas: inputData.quantidadeLotesParaTaxas ?? 1, 
      outrasTaxas: inputData.outrasTaxas ?? 0,
    };
    const res = calcularSimulacao(dataToCalculate);
    setResultado(res);
    setTimeout(() => {
      previewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePrintClientView = () => {
    if (resultado) {
      setMostrarResultadoCliente(true);
    }
  };

  const handleMobilePrintClientView = () => {
    if (resultado) {
      setMostrarResultadoMobilePrint(true);
    }
  };
  
  const handleVoltarParaSimulacao = () => {
    setMostrarResultadoCliente(false);
    setMostrarResultadoMobilePrint(false);
  }
  
  const navegarParaCampanha50Porcento = () => {
    if (resultado && inputData) {
      sessionStorage.setItem('simulacaoResultado', JSON.stringify(resultado));
      sessionStorage.setItem('simulacaoInputData', JSON.stringify(inputData));
      navigate('/campanha-50-porcento');
    }
  }

  if (loadingTaxas || !inputData || !taxasConfig) {
    return <div className="container mx-auto p-4 text-center">Carregando configurações e dados iniciais...</div>;
  }

  if (mostrarResultadoMobilePrint && resultado && inputData && taxasConfig) {
    return <ResultadoClienteMobile
              resultado={resultado} 
              inputData={inputData} 
              onVoltar={handleVoltarParaSimulacao}
              dataSimulacao={new Date().toLocaleDateString("pt-BR")}
              moedaSelecionada={moedaSelecionada} 
              taxaCambio={taxaCambio[moedaSelecionada]} 
              dataCotacao={dataCotacao}
              taxasConfig={taxasConfig} 
              mostrarPesQuadrados={mostrarPesQuadrados}
              quadraValidation={quadraValidation}
            />;
  }

  if (mostrarResultadoCliente && resultado && inputData && taxasConfig) {
    return <ResultadoCliente 
              resultado={resultado} 
              inputData={inputData} 
              onVoltar={handleVoltarParaSimulacao}
              dataSimulacao={new Date().toLocaleDateString("pt-BR")}
              moedaSelecionada={moedaSelecionada} 
              taxaCambio={taxaCambio[moedaSelecionada]} 
              dataCotacao={dataCotacao}
              taxasConfig={taxasConfig} 
              mostrarPesQuadrados={mostrarPesQuadrados}
              quadraValidation={quadraValidation}
            />;
  }

  const opcao1Titulo = inputData.tipoCliente === "CCB" ? "PICK MONEY" : "MOMENTUM (Opção 1)";
  const opcao2Titulo = inputData.tipoCliente === "CCB" ? "MOMENTUM (Opção 2)" : "MOMENTUM (Opção 2)";

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Simulador Financeiro de Lotes</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Moeda para Visualização (Impressão/Cliente)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="moedaVisualizacao">Moeda para Visualização (Impressão/Cliente)</Label>
              <Select
                value={moedaSelecionada}
                onValueChange={(value) => setMoedaSelecionada(value as Moeda)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(moedaDisplayNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dados Iniciais do Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                <Select
                  value={inputData.tipoCliente}
                  onValueChange={(value) => handleSelectChange("tipoCliente", value as TipoCliente)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CCB">CCB</SelectItem>
                    <SelectItem value="Venda Direta">Venda Direta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="setor">Setor</Label>
                <Select
                  value={inputData.setor}
                  onValueChange={(value) => handleSelectChange("setor", value as SetorLote)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marina">Marina</SelectItem>
                    <SelectItem value="Iate">Iate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="quadra">Quadra</Label>
                <input
                  id="quadra"
                  name="quadra"
                  value={inputData.quadra}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Quadra"
                  maxLength={2}
                />
                <QuadraValidationInfo
                  setor={inputData.setor}
                  quadra={inputData.quadra}
                  onValidationChange={setQuadraValidation}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lote">Lote</Label>
                <input
                  id="lote"
                  name="lote"
                  value={inputData.lote}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Lote"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tamanhoLote">Tamanho do Lote (m²)</Label>
                <DecimalInput
                  id="tamanhoLote"
                  name="tamanhoLote"
                  value={inputData.tamanhoLote}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Tamanho em m²"
                />
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox
                    id="mostrarPesQuadrados"
                    checked={mostrarPesQuadrados}
                    onCheckedChange={handleMostrarPesQuadradosChange}
                  />
                  <label
                    htmlFor="mostrarPesQuadrados"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mostrar em Pés Quadrados (ft²)
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="valorLote">Valor do Lote (R$)</Label>
                <CustomCurrencyInput
                  id="valorLote"
                  name="valorLote"
                  value={inputData.valorLote}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor do lote"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Taxas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tipoLoteConservacao">Tipo de Lote para Taxa de Conservação</Label>
                <Select
                  value={inputData.tipoLoteConservacao}
                  onValueChange={(value) => handleSelectChange("tipoLoteConservacao", value as TipoLoteConservacao)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comum">Comum</SelectItem>
                    <SelectItem value="Nobre">Nobre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="quantidadeLotesParaTaxas">Qtd. Lotes para Taxas</Label>
                <input
                  type="number"
                  id="quantidadeLotesParaTaxas"
                  name="quantidadeLotesParaTaxas"
                  value={inputData.quantidadeLotesParaTaxas}
                  onChange={handleChange}
                  min="1"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="taxaConservacaoComumEditada">Valor Conservação Comum (R$ Mensal)</Label>
                <DecimalInput
                  id="taxaConservacaoComumEditada"
                  name="taxaConservacaoComumEditada"
                  value={inputData.taxaConservacaoComumEditada}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor da taxa"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="taxaConservacaoNobreEditada">Valor Conservação Nobre (R$ Mensal)</Label>
                <DecimalInput
                  id="taxaConservacaoNobreEditada"
                  name="taxaConservacaoNobreEditada"
                  value={inputData.taxaConservacaoNobreEditada}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor da taxa"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selecionadoSlim"
                  checked={inputData.selecionadoSlim}
                  onCheckedChange={(checked) => handleCheckboxChange("selecionadoSlim", checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="selecionadoSlim"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Taxa SLIM (R$)
                  </label>
                </div>
                <DecimalInput
                  id="valorSlim"
                  name="valorSlim"
                  value={inputData.valorSlim}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor da taxa"
                  disabled={!inputData.selecionadoSlim}
                  className="ml-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selecionadoMelhoramentos"
                  checked={inputData.selecionadoMelhoramentos}
                  onCheckedChange={(checked) => handleCheckboxChange("selecionadoMelhoramentos", checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="selecionadoMelhoramentos"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Taxa Melhoramentos (R$)
                  </label>
                </div>
                <DecimalInput
                  id="valorMelhoramentos"
                  name="valorMelhoramentos"
                  value={inputData.valorMelhoramentos}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor da taxa"
                  disabled={!inputData.selecionadoMelhoramentos}
                  className="ml-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selecionadoTransporte"
                  checked={inputData.selecionadoTransporte}
                  onCheckedChange={(checked) => handleCheckboxChange("selecionadoTransporte", checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="selecionadoTransporte"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Taxa Transporte (R$)
                  </label>
                </div>
                <DecimalInput
                  id="valorTransporte"
                  name="valorTransporte"
                  value={inputData.valorTransporte}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor da taxa"
                  disabled={!inputData.selecionadoTransporte}
                  className="ml-2"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="outrasTaxas">Outras Taxas (R$ Mensal)</Label>
                <CustomCurrencyInput
                  id="outrasTaxas"
                  name="outrasTaxas"
                  value={inputData.outrasTaxas}
                  onValueChange={(name, value) => handleNumericInputChange(name, value)}
                  placeholder="Valor de outras taxas"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{opcao1Titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="entradaPercentualOpcao1">Entrada (%)</Label>
                <DecimalInput
                  id="entradaPercentualOpcao1"
                  name="entradaPercentualOpcao1"
                  value={inputData.entradaPercentualOpcao1}
                  onChange={(name, value) => handleEntradaChange("Opcao1", "percentual", value)}
                  onValueChange={(name, value) => handleEntradaChange("Opcao1", "percentual", value)}
                  placeholder="Percentual de entrada"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="entradaValorOpcao1">Entrada (R$)</Label>
                <CustomCurrencyInput
                  id="entradaValorOpcao1"
                  name="entradaValorOpcao1"
                  value={inputData.entradaValorOpcao1}
                  onValueChange={(name, value) => handleEntradaChange("Opcao1", "valor", value)}
                  placeholder="Valor da entrada"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="parcelasOpcao1">Número de Parcelas</Label>
                <DecimalInput
                  id="parcelasOpcao1"
                  name="parcelasOpcao1"
                  value={inputData.parcelasOpcao1}
                  onChange={(name, value) => handleNumericInputChange("parcelasOpcao1", value)}
                  onValueChange={(name, value) => handleNumericInputChange("parcelasOpcao1", value)}
                  placeholder="Número de parcelas"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="taxaJurosMensalOpcao1">Taxa de Juros Mensal (%)</Label>
                <Select
                  value={String(inputData.taxaJurosMensalOpcao1 * 100)}
                  onValueChange={(value) => handleSelectChange("taxaJurosMensalOpcao1", parseFloat(value) / 100)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a taxa" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxasDeJurosMensalOpcoes.map((option) => (
                      <SelectItem key={option.value} value={String(option.value * 100)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{opcao2Titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="entradaPercentualOpcao2">Entrada (%)</Label>
                <DecimalInput
                  id="entradaPercentualOpcao2"
                  name="entradaPercentualOpcao2"
                  value={inputData.entradaPercentualOpcao2}
                  onChange={(name, value) => handleEntradaChange("Opcao2", "percentual", value)}
                  onValueChange={(name, value) => handleEntradaChange("Opcao2", "percentual", value)}
                  placeholder="Percentual de entrada"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="entradaValorOpcao2">Entrada (R$)</Label>
                <CustomCurrencyInput
                  id="entradaValorOpcao2"
                  name="entradaValorOpcao2"
                  value={inputData.entradaValorOpcao2}
                  onValueChange={(name, value) => handleEntradaChange("Opcao2", "valor", value)}
                  placeholder="Valor da entrada"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="parcelasOpcao2">Número de Parcelas</Label>
                <DecimalInput
                  id="parcelasOpcao2"
                  name="parcelasOpcao2"
                  value={inputData.parcelasOpcao2}
                  onChange={(name, value) => handleNumericInputChange("parcelasOpcao2", value)}
                  onValueChange={(name, value) => handleNumericInputChange("parcelasOpcao2", value)}
                  placeholder="Número de parcelas"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="taxaJurosMensalOpcao2">Taxa de Juros Mensal (%)</Label>
                <Select
                  value={String(inputData.taxaJurosMensalOpcao2 * 100)}
                  onValueChange={(value) => handleSelectChange("taxaJurosMensalOpcao2", parseFloat(value) / 100)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a taxa" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxasDeJurosMensalOpcoes.map((option) => (
                      <SelectItem key={option.value} value={String(option.value * 100)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto">
          Gerar Prévia
        </Button>
      </form>

      {resultado && (
        <div ref={previewSectionRef} className="mt-8 p-6 border rounded-lg shadow-lg bg-white printable-area">
          <h2 className="text-2xl font-semibold mb-4 text-center">Resultado da Simulação</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {resultado.opcao1 && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-700">{opcao1Titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resultado.opcao1 ? (
                    <>
                      <p><strong>Valor da Parcela:</strong> {formatCurrency(resultado.opcao1.valorParcela, "BRL", 1)}</p>
                      <p><strong>Valor Financiado:</strong> {formatCurrency(resultado.opcao1.valorFinanciado, "BRL", 1)}</p>
                      <p><strong>Total Pago (com juros):</strong> {formatCurrency(resultado.opcao1.totalPago, "BRL", 1)}</p>
                      <p><strong>Total de Juros:</strong> {formatCurrency(resultado.opcao1.totalJuros, "BRL", 1)}</p>
                    </>
                  ) : (
                    <p className="text-red-600">Opção inválida.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {resultado.opcao2 && (
              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700">{opcao2Titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resultado.opcao2 ? (
                    <>
                      <p><strong>Valor da Parcela:</strong> {formatCurrency(resultado.opcao2.valorParcela, "BRL", 1)}</p>
                      <p><strong>Valor Financiado:</strong> {formatCurrency(resultado.opcao2.valorFinanciado, "BRL", 1)}</p>
                      <p><strong>Total Pago (com juros):</strong> {formatCurrency(resultado.opcao2.totalPago, "BRL", 1)}</p>
                      <p><strong>Total de Juros:</strong> {formatCurrency(resultado.opcao2.totalJuros, "BRL", 1)}</p>
                    </>
                  ) : (
                    <p className="text-red-600">Opção inválida.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="mb-6 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-700">Custos Adicionais Mensais Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Total das Taxas Mensais:</strong> {formatCurrency(resultado.taxasDetalhadas?.totalTaxasAdicionaisMensais || 0, "BRL", 1)}</p>
              <p className="text-xs text-gray-600 mt-1">
                Este valor inclui: Taxa de Conservação ({inputData.tipoLoteConservacao}), 
                {inputData.selecionadoSlim ? " SLIM, " : ""}
                {inputData.selecionadoMelhoramentos ? "Melhoramentos, " : ""}
                {inputData.selecionadoTransporte ? "Transporte, " : ""}
                e Outras Taxas, multiplicadas por {inputData.quantidadeLotesParaTaxas} lote(s).
              </p>
            </CardContent>
          </Card>

          {/* Seção das Campanhas */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-center">Campanhas Disponíveis</h3>
            
            {/* Campanha Casa Pronta, Lote Quitado - Sempre disponível */}
            <div className="border rounded-lg p-4">
              <Button 
                onClick={() => setMostrarCampanhaLoteQuitado(!mostrarCampanhaLoteQuitado)}
                variant="outline"
                className="w-full justify-between"
              >
                Casa Pronta, Lote Quitado
                {mostrarCampanhaLoteQuitado ? "▲" : "▼"}
              </Button>
              {mostrarCampanhaLoteQuitado && (
                <div className="mt-4">
                  <CasaProntaLoteQuitadoSimulacao 
                    valorLoteOriginal={inputData.valorLote || 0}
                    valorEntrada={resultado.opcao1?.valorEntrada || 0}
                    valorParcelaMensalInicial={resultado.opcao1?.valorParcela || 0}
                    igpmInicial={0}
                  />
                </div>
              )}
            </div>

            {/* Campanha Pontualidade Premiada - Sempre disponível */}
            <div className="border rounded-lg p-4">
              <Button 
                onClick={() => setMostrarCampanhaPontualidade(!mostrarCampanhaPontualidade)}
                variant="outline"
                className="w-full justify-between"
              >
                Pontualidade Premiada
                {mostrarCampanhaPontualidade ? "▲" : "▼"}
              </Button>
              {mostrarCampanhaPontualidade && (
                <div className="mt-4">
                  <PontualidadePremiadaSimulacao 
                    valorLoteOriginal={inputData.valorLote || 0}
                    valorEntradaPrincipal={resultado.opcao1?.valorEntrada || 0}
                    taxaJurosMensalReferencia={inputData.taxaJurosMensalOpcao1}
                  />
                </div>
              )}
            </div>

            {/* Campanha 50% - Sempre disponível */}
            <div className="border rounded-lg p-4">
              <Button 
                onClick={() => setMostrarCampanha50Porcento(!mostrarCampanha50Porcento)}
                variant="outline"
                className="w-full justify-between"
              >
                Campanha de 50%
                {mostrarCampanha50Porcento ? "▲" : "▼"}
              </Button>
              {mostrarCampanha50Porcento && (
                <div className="mt-4">
                  <Campanha50PorcentoSimulacao 
                    valorLoteOriginal={inputData.valorLote || 0}
                    valorEntrada={resultado.opcao1?.valorEntrada || 0}
                    valorParcelaMensalInicial={resultado.opcao1?.valorParcela || 0}
                    numeroParcelas={inputData.parcelasOpcao1}
                    igpmInicial={0}
                  />
                </div>
              )}
            </div>
          </div>

          <div ref={buttonsSectionRef} className="mt-6 flex flex-col md:flex-row gap-4 justify-center no-print">
            <Button onClick={handlePrintClientView} variant="outline">
              Versão Computador
            </Button>
            <Button onClick={handleMobilePrintClientView} variant="outline">
              Versão Celular
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
