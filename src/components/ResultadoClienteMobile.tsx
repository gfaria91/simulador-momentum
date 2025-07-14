import React, { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { ResultadoSimulacao, SimulacaoInput, Moeda, TaxasConfig, FinanciamentoOutput } from "../logic/calculationLogic";
import CasaProntaLoteQuitadoSimulacao from "./CasaProntaLoteQuitadoSimulacao";
import PontualidadePremiadaSimulacao from "./PontualidadePremiadaSimulacao";
import Campanha50PorcentoSimulacao from "./Campanha50PorcentoSimulacao";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { LoteValidation } from '../services/googleSheetsService';

// Cores da Momentum (importadas ou definidas)
const MOMENTUM_COLORS = {
  darkBlue: '#003366',
  vibrantGreen: '#8CC63F',
  lightGrayBg: '#F0F4F8',
  textPrimary: '#333333',
  textSecondary: '#555555',
  white: '#FFFFFF',
  borderLight: '#DDE6ED',
  headerBlue: '#003366',
};

interface ResultadoClienteMobileProps {
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

const ResultadoClienteMobile: React.FC<ResultadoClienteMobileProps> = ({ 
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
  const [isCapturing, setIsCapturing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
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

  const toggleCampanhaLoteQuitado = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarCampanhaLoteQuitado(prev => !prev);
  }, []);
  
  const toggleCampanhaPontualidade = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarCampanhaPontualidade(prev => !prev);
  }, []);
  
  const toggleCampanha50Porcento = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarCampanha50Porcento(prev => !prev);
  }, []);

  const handleCapture = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: MOMENTUM_COLORS.white,
        onclone: (document) => {
          const printFrame = document.querySelector(".print-mobile-frame-sophisticated") as HTMLElement | null;
          if (printFrame) {
            printFrame.style.fontFamily = "'Arial', sans-serif";
          }
          
          // Esconder elementos que não devem aparecer na imagem usando CSS
          const elementsToHide = document.querySelectorAll('.print-hide-on-print');
          elementsToHide.forEach(element => {
            (element as HTMLElement).style.display = 'none';
          });
        }
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `simulacao_riviera_${inputData.lote || "lote"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao capturar a imagem:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const formatDisplayCurrency = (value: number | undefined): React.ReactNode => {
    if (value === undefined || isNaN(value)) return <span style={{color: MOMENTUM_COLORS.textSecondary}}>N/A</span>;
    const valorEmBRL = value;
    const valorEmBRLFormatado = valorEmBRL.toLocaleString("pt-BR", { 
      style: "currency", 
      currency: "BRL", 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });

    if (moedaSelecionada !== "BRL" && taxaCambio && taxaCambio !== 0) {
      const valorNaMoedaDisplay = valorEmBRL / taxaCambio;
      let simboloDisplay = "";
      switch (moedaSelecionada) {
        case "USD": simboloDisplay = "$"; break;
        case "EUR": simboloDisplay = "€"; break;
        case "GBP": simboloDisplay = "£"; break;
        case "CAD": simboloDisplay = "C$"; break;
        case "AUD": simboloDisplay = "A$"; break;
        case "CHF": simboloDisplay = "Fr"; break;
      }
      const valorDisplayFormatado = valorNaMoedaDisplay.toLocaleString("pt-BR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return (
        <>
          {valorEmBRLFormatado} <em style={{fontSize: '0.8em', color: MOMENTUM_COLORS.textSecondary, fontStyle: 'italic'}}>({simboloDisplay} {valorDisplayFormatado})</em>
        </>
      );
    }
    return valorEmBRLFormatado;
  };
  
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

  const cardStyle: React.CSSProperties = {
    backgroundColor: MOMENTUM_COLORS.white,
    border: `1px solid ${MOMENTUM_COLORS.borderLight}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: MOMENTUM_COLORS.darkBlue,
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: `2px solid ${MOMENTUM_COLORS.vibrantGreen}`,
    lineHeight: '1.4'
  };

  const textStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: MOMENTUM_COLORS.textPrimary,
    marginBottom: '4px'
  };
  
  const strongTextStyle: React.CSSProperties = {
    fontWeight: '600',
    color: MOMENTUM_COLORS.textSecondary,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: MOMENTUM_COLORS.darkBlue,
    color: MOMENTUM_COLORS.white,
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginTop: '16px',
    marginBottom: '16px',
    textAlign: 'center',
    display: 'block'
  };

  const campaignButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: MOMENTUM_COLORS.white,
    color: MOMENTUM_COLORS.darkBlue,
    border: `1px solid ${MOMENTUM_COLORS.borderLight}`,
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem'
  };

  return (
    <div style={{ padding: '16px', backgroundColor: MOMENTUM_COLORS.lightGrayBg, fontFamily: "'Arial', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }} className="print-hide-on-print">
        <button 
          onClick={onVoltar}
          style={{ padding: '8px 12px', backgroundColor: MOMENTUM_COLORS.white, color: MOMENTUM_COLORS.darkBlue, borderRadius: '6px', border: `1px solid ${MOMENTUM_COLORS.borderLight}`, cursor: 'pointer' }}
          disabled={isCapturing}
        >
          &larr; Voltar para Editar
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <LanguageSelector />
          <button
            onClick={handleCapture}
            style={{ padding: '8px 12px', backgroundColor: MOMENTUM_COLORS.darkBlue, color: MOMENTUM_COLORS.white, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            disabled={isCapturing}
            className="print-hide-on-print"
          >
            {isCapturing ? "Salvando Imagem..." : t('simulation.saveImage')}
          </button>
        </div>
      </div>

      <div ref={printRef} className="print-mobile-frame-sophisticated" style={{ backgroundColor: MOMENTUM_COLORS.white, padding: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', width: "375px", margin: "auto", border: `1px solid ${MOMENTUM_COLORS.borderLight}`, borderRadius: '8px' }}> 
        <style>
          {`
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @media print {
              @page {
                size: 375px auto; 
                margin: 0 !important;
              }
              body, html, .print-mobile-frame-sophisticated {
                margin: 0 !important;
                padding: 15px !important;
                width: 100% !important;
                height: auto !important; 
                min-height: 0 !important;
                box-shadow: none !important;
                border: none !important;
                font-family: 'Arial', sans-serif !important;
              }
              .print-hide-on-print { display: none !important; }
              #secaoCampanhaLoteQuitadoMobile, #botaoCampanhaLoteQuitadoMobile, 
              #secaoCampanhaPontualidadeMobile, #botaoCampanhaPontualidadeMobile, 
              #secaoCampanha50PorcentoMobile, #botaoCampanha50PorcentoMobile { 
                display: none !important; 
              }
            }
          `}
        </style>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img src="/assets/logos/logo-riviera-xiii-azul.png" alt="Riviera XIII" style={{ maxHeight: "50px", margin: '0 auto 10px auto' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: MOMENTUM_COLORS.headerBlue }}>{t('simulation.title')}</h1>
        </div>

        <div style={{...cardStyle, paddingTop: "12px"}}>
          <h2 style={sectionTitleStyle}>{t('simulation.lotData')}</h2>
          <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.sectorMobile')}</strong></p><p style={textStyle}>{inputData.setor} / {inputData.quadra || "-"} / {inputData.lote || "-"}</p></div>
          <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.size')}</strong></p><p style={textStyle}>{inputData.tamanhoLote}m²{mostrarPesQuadrados && ` (${(inputData.tamanhoLote * 10.7639).toFixed(0)}ft²)`}</p></div>
          <div style={{display: "flex", justifyContent: "space-between"}}><p style={{...textStyle, fontWeight: 'bold'}}><strong style={strongTextStyle}>{t('simulation.value')}</strong></p><p style={{...textStyle, fontWeight: 'bold'}}>{formatDisplayCurrency(inputData.valorLote)}</p></div>
          {resultado.condominioTotal !== undefined && resultado.condominioTotal > 0 && (
            <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.condo')}</strong></p><p style={textStyle}>{formatDisplayCurrency(resultado.condominioTotal)}</p></div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {resultado.opcao1 && (
            <div style={cardStyle}>
              <div style={{textAlign: 'center', marginBottom: '8px'}}>
                {inputData.tipoCliente === "CCB" ? (
                  <img src="/assets/logos/bpm-money-plus.png" alt="BPM Money Plus" style={{ height: "30px", margin: '0 auto' }} />
                ) : (
                  <img src="/assets/logos/logo-momentum-blue.png" alt="Momentum" style={{ height: "25px", margin: '0 auto' }} />
                )}
              </div>
              <h3 style={{...sectionTitleStyle, textAlign: 'center'}}>{inputData.tipoCliente === "CCB" ? t('simulation.pickMoney') : `${t('simulation.momentum')} (Opção 1)`}</h3>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.downPayment')} ({resultado.opcao1.entradaPercentual.toFixed(2)}%):</strong></p><p style={textStyle}>{formatDisplayCurrency(resultado.opcao1.valorEntrada)}</p></div>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.interestRate')}:</strong></p><p style={textStyle}>{(resultado.opcao1.taxaJurosMensal * 100).toFixed(2)}% {t('simulation.monthly')}</p></div>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.term')}:</strong></p><p style={textStyle}>{resultado.opcao1.parcelas} {t('simulation.months')}</p></div>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={{...textStyle, fontWeight: 'bold'}}><strong style={{...strongTextStyle, fontWeight: 'bold'}}>{t('simulation.installmentValue')}</strong></p><p style={{...textStyle, fontWeight: 'bold'}}>{formatDisplayCurrency(resultado.opcao1.valorParcela)}</p></div>
              {parcelaOpcao1MaisCondominio !== undefined && (
                <div style={{display: "flex", justifyContent: "space-between", marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${MOMENTUM_COLORS.borderLight}`}}>
                  <p style={{...textStyle, fontWeight: 'bold'}}><strong style={{...strongTextStyle, fontWeight: 'bold'}}>{t('simulation.installmentPlusCondo')}</strong></p>
                  <p style={{...textStyle, fontWeight: 'bold'}}>{formatDisplayCurrency(parcelaOpcao1MaisCondominio)}</p>
                </div>
              )}
            </div>
          )}

          {resultado.opcao2 && (
            <div style={cardStyle}>
              <div style={{textAlign: 'center', marginBottom: '8px'}}>
                <img src="/assets/logos/logo-momentum-blue.png" alt="Momentum" style={{ height: "25px", margin: '0 auto' }} />
              </div>
              <h3 style={{...sectionTitleStyle, textAlign: 'center'}}>{t('simulation.momentum')} (Opção 2)</h3>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.downPayment')} ({resultado.opcao2.entradaPercentual.toFixed(2)}%):</strong></p><p style={textStyle}>{formatDisplayCurrency(resultado.opcao2.valorEntrada)}</p></div>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.interestRate')}:</strong></p><p style={textStyle}>{(resultado.opcao2.taxaJurosMensal * 100).toFixed(2)}% {t('simulation.monthly')}</p></div>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={textStyle}><strong style={strongTextStyle}>{t('simulation.term')}:</strong></p><p style={textStyle}>{resultado.opcao2.parcelas} {t('simulation.months')}</p></div>
              <div style={{display: "flex", justifyContent: "space-between"}}><p style={{...textStyle, fontWeight: 'bold'}}><strong style={{...strongTextStyle, fontWeight: 'bold'}}>{t('simulation.installmentValue')}</strong></p><p style={{...textStyle, fontWeight: 'bold'}}>{formatDisplayCurrency(resultado.opcao2.valorParcela)}</p></div>
              {parcelaOpcao2MaisCondominio !== undefined && (
                <div style={{display: "flex", justifyContent: "space-between", marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${MOMENTUM_COLORS.borderLight}`}}>
                  <p style={{...textStyle, fontWeight: 'bold'}}><strong style={{...strongTextStyle, fontWeight: 'bold'}}>{t('simulation.installmentPlusCondo')}</strong></p>
                  <p style={{...textStyle, fontWeight: 'bold'}}>{formatDisplayCurrency(parcelaOpcao2MaisCondominio)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{...cardStyle, fontSize: '0.8rem', color: MOMENTUM_COLORS.textSecondary}}>
          <div style={{display: "flex", justifyContent: "space-between"}}><p style={{fontWeight: '600'}}>{t('simulation.simulationDate')}</p><p>{dataSimulacao}</p></div>
          {moedaSelecionada !== "BRL" && taxaCambio && taxaCambio !== 0 && (
            <div style={{display: "flex", justifyContent: "space-between", marginTop: '4px'}}><p style={{fontWeight: '600'}}>{t('simulation.exchangeRate')}</p><p>{moedaSelecionada}/BRL {taxaCambio.toFixed(2).replace(".",",")} (em {new Date(dataCotacao).toLocaleDateString("pt-BR")})</p></div>
          )}
        </div>

        <div style={{...cardStyle, marginTop: '16px'}}>
          <h3 style={{...sectionTitleStyle, fontSize: '1rem'}}>{t('simulation.importantNotes')}</h3>
          <ul style={{paddingLeft: '16px', fontSize: '0.8rem', color: MOMENTUM_COLORS.textSecondary}}>
            <li style={{marginBottom: '4px'}}>{t('simulation.note1')}</li>
            <li style={{marginBottom: '4px'}}>{t('simulation.note2')}</li>
            {moedaSelecionada !== "BRL" && (
              <li style={{marginBottom: '4px', fontWeight: '600'}}>{t('simulation.exchangeDisclaimer').replace('***', moedaSelecionada)}</li>
            )}
          </ul>
        </div>

        <div style={{textAlign: 'center', marginTop: '16px', marginBottom: '16px'}}>
          <img src="/assets/logos/selo-responsabilidade-ambiental.png" alt="Selo de Responsabilidade Ambiental" style={{ height: "60px", margin: '0 auto' }} />
        </div>
      </div>

      {/* Botão de captura fora da área de impressão */}
      <div style={{ marginTop: '16px' }} className="print-hide-on-print">
        <button 
          onClick={handleCapture} 
          style={{...buttonStyle, marginTop: '24px'}}
          disabled={isCapturing}
        >
          {isCapturing ? "Salvando Imagem..." : t('simulation.saveImage')}
        </button>
      </div>
    </div>
  );
};

export default ResultadoClienteMobile;
