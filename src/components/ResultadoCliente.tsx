import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResultadoSimulacao, SimulacaoInput, Moeda, TaxasConfig, FinanciamentoOutput } from "../logic/calculationLogic";
import PontualidadePremiadaSimulacao from "./PontualidadePremiadaSimulacao";
import CasaProntaLoteQuitadoSimulacao from "./CasaProntaLoteQuitadoSimulacao";
import Campanha50PorcentoSimulacao from "./Campanha50PorcentoSimulacao";
import { ChevronDown, ChevronUp } from "lucide-react"; // Ícones para expandir/recolher
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { LoteValidation } from '../services/googleSheetsService';

interface ResultadoClienteProps {
  resultado: ResultadoSimulacao;
  inputData: SimulacaoInput;
  onVoltar: () => void;
  dataSimulacao: string;
  moedaSelecionada: Moeda;
  taxaCambio: number;
  dataCotacao: string;
  taxasConfig: TaxasConfig;
  mostrarPesQuadrados: boolean;
  quadraValidation: LoteValidation | null;
}

const ResultadoCliente: React.FC<ResultadoClienteProps> = ({ 
  resultado,
  inputData,
  onVoltar,
  dataSimulacao,
  moedaSelecionada,
  taxaCambio, 
  dataCotacao,
  taxasConfig, 
  mostrarPesQuadrados,
  quadraValidation
}) => {
  const { t } = useTranslation();
  const [mostrarCampanhaLoteQuitado, setMostrarCampanhaLoteQuitado] = useState(false);
  const [mostrarCampanhaPontualidade, setMostrarCampanhaPontualidade] = useState(false);
  const [mostrarCampanha50Porcento, setMostrarCampanha50Porcento] = useState(false);

  // Função para determinar quais campanhas devem ser exibidas baseado na validação
  const getCampanhasDisponiveis = () => {
    if (!quadraValidation) {
      // Se não há validação, mostrar todas as campanhas (comportamento padrão)
      return {
        casaPronta: true,
        pontualidade: true,
        cinquentaPorcento: true
      };
    }

    const { campanhaDisponivel } = quadraValidation;
    
    switch (campanhaDisponivel) {
      case 'Casa Pronta Lote Quitado':
        return {
          casaPronta: true,
          pontualidade: false,
          cinquentaPorcento: true // Campanha de 50% sempre disponível
        };
      case 'Pontualidade Premiada':
        return {
          casaPronta: false,
          pontualidade: true,
          cinquentaPorcento: true // Campanha de 50% sempre disponível
        };
      case 'Sem Campanha':
      default:
        return {
          casaPronta: false,
          pontualidade: false,
          cinquentaPorcento: true // Apenas campanha de 50% disponível
        };
    }
  };

  const campanhasDisponiveis = getCampanhasDisponiveis();

  const toggleCampanhaLoteQuitado = () => setMostrarCampanhaLoteQuitado(!mostrarCampanhaLoteQuitado);
  const toggleCampanhaPontualidade = () => setMostrarCampanhaPontualidade(!mostrarCampanhaPontualidade);
  const toggleCampanha50Porcento = () => setMostrarCampanha50Porcento(!mostrarCampanha50Porcento);

  const formatDisplayCurrency = (value: number | undefined): React.ReactNode => {
    if (value === undefined || isNaN(value)) return "N/A";

    const valorEmBRL = value;
    const valorEmBRLFormatado = valorEmBRL.toLocaleString("pt-BR", { 
      style: "currency", 
      currency: "BRL", 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });

    if (moedaSelecionada !== "BRL" && taxaCambio && taxaCambio !== 0) {
      const valorNaMoedaDisplay = valorEmBRL / taxaCambio;
      
      let localeDisplay = "en-US";
      let simboloDisplay = "$";

      switch (moedaSelecionada) {
        case "USD": localeDisplay = "en-US"; simboloDisplay = "$"; break;
        case "EUR": localeDisplay = "de-DE"; simboloDisplay = "€"; break;
        case "GBP": localeDisplay = "en-GB"; simboloDisplay = "£"; break;
        case "CAD": localeDisplay = "en-CA"; simboloDisplay = "C$"; break;
        case "AUD": localeDisplay = "en-AU"; simboloDisplay = "A$"; break;
        case "CHF": localeDisplay = "de-CH"; simboloDisplay = "Fr"; break;
      }
      
      const valorDisplayFormatado = valorNaMoedaDisplay.toLocaleString(localeDisplay, {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return (
        <>
          {valorEmBRLFormatado} (<em className="italic">{simboloDisplay} {valorDisplayFormatado}</em>)
        </>
      );
    }
    return valorEmBRLFormatado;
  };

  const tituloOpcao1 = inputData.tipoCliente === "CCB" ? t('simulation.pickMoney') : `${t('simulation.momentum')} (Opção 1)`;

  const calcularParcelaMaisCondominio = (opcaoOutput: FinanciamentoOutput | undefined) => {
    if (!opcaoOutput || resultado.condominioTotal === undefined) return undefined;
    return opcaoOutput.valorParcela + resultado.condominioTotal;
  };

  const parcelaOpcao1MaisCondominio = calcularParcelaMaisCondominio(resultado.opcao1);
  const parcelaOpcao2MaisCondominio = calcularParcelaMaisCondominio(resultado.opcao2);

  // Determinar valores de entrada e parcela para a campanha
  let valorEntradaParaCampanha = 0;
  let valorParcelaMensalInicialParaCampanha = 0;
  let numeroParcelasParaCampanha = 0;

  if (resultado.opcao1 && (resultado.opcao1.valorParcela > 0 || (resultado.opcao1.valorParcela === 0 && resultado.opcao1.valorFinanciado === 0))) {
    valorEntradaParaCampanha = resultado.opcao1.valorEntrada || 0;
    valorParcelaMensalInicialParaCampanha = resultado.opcao1.valorParcela || 0;
    numeroParcelasParaCampanha = resultado.opcao1.parcelas || 0;
  } else if (resultado.opcao2 && (resultado.opcao2.valorParcela > 0 || (resultado.opcao2.valorParcela === 0 && resultado.opcao2.valorFinanciado === 0))) {
    valorEntradaParaCampanha = resultado.opcao2.valorEntrada || 0;
    valorParcelaMensalInicialParaCampanha = resultado.opcao2.valorParcela || 0;
    numeroParcelasParaCampanha = resultado.opcao2.parcelas || 0;
  }

  // Validações de segurança para prevenir erros
  const valorLoteSeguro = inputData.valorLote ?? 0;
  const valorEntradaSeguro = Math.max(0, valorEntradaParaCampanha);
  const valorParcelaSeguro = Math.max(0, valorParcelaMensalInicialParaCampanha);
  const numeroParcelasSeguro = Math.max(1, numeroParcelasParaCampanha); // Mínimo 1 para evitar divisão por zero

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto my-8 print-area">
      <div className="text-center mb-6 print-only">
        <img src="/assets/logos/logo-riviera-xiii-azul.png" alt="Riviera de Santa Cristina XIII" className="mx-auto h-16 object-contain print-logo" />
      </div>

      {/* Seletor de idioma - apenas visível na tela, não na impressão */}
      <div className="mb-4 flex justify-end print-hide-on-print">
        <LanguageSelector />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">{t('simulation.title')}</h1>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50 print-section-card">
        <h2 className="text-xl font-semibold text-blue-700 mb-3 text-center print-section-title">{t('simulation.lotData')}</h2>
        <div className="space-y-1 print-text-sm">
          <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.sectorDesktop')}</p><p>{inputData.setor} / {inputData.quadra} / {inputData.lote}</p></div>
          <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.size')}</p><p>{inputData.tamanhoLote}m²{mostrarPesQuadrados && ` (${(inputData.tamanhoLote * 10.7639).toFixed(0)}ft²)`}</p></div>
          <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.value')}</p><p>{formatDisplayCurrency(inputData.valorLote ?? 0)}</p></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {resultado.opcao1 && (
          <div className="p-4 border rounded-md flex flex-col items-stretch bg-gray-50 print-section-card">
            <div className="text-center mb-3">
              {inputData.tipoCliente === "CCB" ? (
                <img src="/assets/logos/bpm-money-plus.png" alt="BPM Money Plus" className="h-12 mx-auto object-contain print-logo" />
              ) : (
                <img src="/assets/logos/logo-momentum-blue.png" alt="Momentum" className="h-10 mx-auto object-contain print-logo" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-blue-600 mb-3 text-center print-section-title">{tituloOpcao1}</h2>
            <div className="space-y-1 print-text-sm">
              <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.downPayment')} ({resultado.opcao1.entradaPercentual.toFixed(2)}%):</p><p>{formatDisplayCurrency(resultado.opcao1.valorEntrada)}</p></div>
              <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.interestRate')}:</p><p>{(resultado.opcao1.taxaJurosMensal * 100).toFixed(2)}% {t('simulation.monthly')}</p></div>
              <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.term')}:</p><p>{resultado.opcao1.parcelas} {t('simulation.months')}</p></div>
              <div className="flex justify-between"><p className="font-semibold text-gray-700">{t('simulation.installmentValue')}</p><p className="font-semibold">{formatDisplayCurrency(resultado.opcao1.valorParcela)}</p></div>
              {parcelaOpcao1MaisCondominio !== undefined && (
                  <div className="flex justify-between mt-2 pt-2 border-t"><p className="font-bold text-gray-700">{t('simulation.installmentPlusCondo')}</p><p className="font-bold">{formatDisplayCurrency(parcelaOpcao1MaisCondominio)}</p></div>
              )}
            </div>
          </div>
        )}

        {resultado.opcao2 && (
          <div className="p-4 border rounded-md flex flex-col items-stretch bg-gray-50 print-section-card">
            <div className="text-center mb-3">
              <img src="/assets/logos/logo-momentum-blue.png" alt="Momentum Opção 2" className="h-10 mx-auto object-contain print-logo" />
            </div>
            <h2 className="text-xl font-semibold text-blue-600 mb-3 text-center print-section-title">{t('simulation.momentum')} (Opção 2)</h2>
            <div className="space-y-1 print-text-sm">
              <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.downPayment')} ({resultado.opcao2.entradaPercentual.toFixed(2)}%):</p><p>{formatDisplayCurrency(resultado.opcao2.valorEntrada)}</p></div>
              <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.interestRate')}:</p><p>{(resultado.opcao2.taxaJurosMensal * 100).toFixed(2)}% {t('simulation.monthly')}</p></div>
              <div className="flex justify-between"><p className="font-medium text-gray-600">{t('simulation.term')}:</p><p>{resultado.opcao2.parcelas} {t('simulation.months')}</p></div>
              <div className="flex justify-between"><p className="font-semibold text-gray-700">{t('simulation.installmentValue')}</p><p className="font-semibold">{formatDisplayCurrency(resultado.opcao2.valorParcela)}</p></div>
              {parcelaOpcao2MaisCondominio !== undefined && (
                  <div className="flex justify-between mt-2 pt-2 border-t"><p className="font-bold text-gray-700">{t('simulation.installmentPlusCondo')}</p><p className="font-bold">{formatDisplayCurrency(parcelaOpcao2MaisCondominio)}</p></div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-6 p-3 border rounded-md bg-gray-50 print-section-card print-text-xs">
        <div className="flex justify-between"><p className="font-medium">{t('simulation.simulationDate')}</p><p>{dataSimulacao}</p></div>
        {moedaSelecionada !== "BRL" && taxaCambio && taxaCambio !== 0 && (
          <div className="flex justify-between mt-1"><p className="font-medium">{t('simulation.exchangeRate')}</p><p>{moedaSelecionada}/BRL {taxaCambio.toFixed(2).replace(".",",")} (em {new Date(dataCotacao).toLocaleDateString("pt-BR")})</p></div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t print-section-card">
        <h3 className="text-lg font-semibold text-blue-700 mb-2 print-section-title">{t('simulation.importantNotes')}</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 print-text-sm">
          <li>{t('simulation.note1')}</li>
          <li>{t('simulation.note2')}</li>
          {moedaSelecionada !== "BRL" && (
            <li className="font-semibold mt-2">{t('simulation.exchangeDisclaimer').replace('***', moedaSelecionada)}</li>
          )}
        </ul>
      </div>

      <div className="mt-8 mb-4 text-center print-only">
        <img src="/assets/logos/selo-responsabilidade-ambiental.png" alt="Selo de Responsabilidade Ambiental" className="mx-auto h-24 object-contain print-logo" style={{ maxWidth: "300px" }} />
      </div>

      <div className="mt-8 text-center print-hide">
        <Button onClick={onVoltar} variant="outline" className="mr-2">Voltar para Simulação</Button>
        <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">{t('simulation.printPdf')}</Button>
      </div>
    </div>
  );
};

export default ResultadoCliente;
