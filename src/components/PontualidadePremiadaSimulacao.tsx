import React, { useState, useMemo, useRef } from "react";
import { formatCurrency } from "../utils/formattingUtils";
import { useTranslation } from 'react-i18next';
// Função PMT local para evitar dependência
const calcularPMT = (taxaMensal: number, numParcelas: number, principal: number): number => {
  if (taxaMensal === 0) {
    return principal / numParcelas;
  }
  const x = Math.pow(1 + taxaMensal, numParcelas);
  return principal * ((taxaMensal * x) / (x - 1));
};
import html2canvas from "html2canvas";

// Cores da Momentum (importadas ou definidas)
const MOMENTUM_COLORS = {
  darkBlue: "#003366",
  vibrantGreen: "#8CC63F",
  lightGrayBg: "#F0F4F8",
  textPrimary: "#333333",
  textSecondary: "#555555",
  white: "#FFFFFF",
  borderLight: "#DDE6ED",
};

const LOGO_MOMENTUM_URL = 
"/assets/logos/logo-MOMENTUM-white.png";

interface PontualidadePremiadaSimulacaoProps {
  valorLoteOriginal: number; 
  valorEntradaPrincipal: number; 
  taxaJurosMensalReferencia: number; 
}

interface ResultadoPontualidade {
  tempoFinanciamentoOriginal: number;
  parcelasPagasEmDia: number;
  custoFinalLote: number;
  parcelaBaseCalculada: number; 
  valorAbonado: number; 
  percentualDesconto: number; 
}

const PontualidadePremiadaSimulacao: React.FC<PontualidadePremiadaSimulacaoProps> = ({
  valorLoteOriginal, 
  valorEntradaPrincipal, 
  taxaJurosMensalReferencia,
}) => {
  const { t } = useTranslation();
  const [igmpAnual, setIgmpAnual] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null); 
  const saveButtonRef = useRef<HTMLButtonElement>(null); // Ref para o botão de salvar

  const handleIgmpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIgmpAnual(parseFloat(value) || 0);
  };

  const resultados = useMemo(() => {
    const cenarios = [
      { tempoOriginal: 24, pagasEmDia: 12 },
      { tempoOriginal: 60, pagasEmDia: 30 },
      { tempoOriginal: 80, pagasEmDia: 40 },
      { tempoOriginal: 120, pagasEmDia: 60 },
      { tempoOriginal: 180, pagasEmDia: 90 },
    ];

    return cenarios.map(cenario => {
      let parcelaBaseDoCenario = 0;
      let custoFinalCalculado = 0;
      let valorAbonadoCalculado = 0;
      let percentualDescontoCalculado = 0;
      const valorFinanciadoParaCalculo = valorLoteOriginal - valorEntradaPrincipal;

      if (valorFinanciadoParaCalculo > 0 && taxaJurosMensalReferencia >= 0 && cenario.tempoOriginal > 0) {
        parcelaBaseDoCenario = calcularPMT(
          taxaJurosMensalReferencia,
          cenario.tempoOriginal,
          valorFinanciadoParaCalculo
        );
      } else {
        parcelaBaseDoCenario = 0;
      }

      let parcelaCorrigidaCusto = parcelaBaseDoCenario;
      let acumuladorParcelasPagas = 0;
      for (let i = 0; i < cenario.pagasEmDia; i++) {
        if (i > 0 && i % 12 === 0 && cenario.tempoOriginal > 24) {
          parcelaCorrigidaCusto *= (1 + (igmpAnual / 100));
        }
        acumuladorParcelasPagas += parcelaCorrigidaCusto;
      }
      custoFinalCalculado = valorEntradaPrincipal + acumuladorParcelasPagas;

      let acumuladorParcelasAbonadas = 0;
      let parcelaCorrigidaAbono = parcelaBaseDoCenario;
      let custoTotalOriginalComJurosCalculado = valorEntradaPrincipal; 
      let parcelaCorrigidaParaCustoTotalOriginal = parcelaBaseDoCenario;

      for (let i = 0; i < cenario.tempoOriginal; i++) {
        if (i > 0 && i % 12 === 0 && cenario.tempoOriginal > 24) { 
          parcelaCorrigidaAbono *= (1 + (igmpAnual / 100));
          parcelaCorrigidaParaCustoTotalOriginal *= (1 + (igmpAnual / 100));
        }
        custoTotalOriginalComJurosCalculado += parcelaCorrigidaParaCustoTotalOriginal; 
        if (i >= cenario.pagasEmDia) { 
          acumuladorParcelasAbonadas += parcelaCorrigidaAbono;
        }
      }
      valorAbonadoCalculado = acumuladorParcelasAbonadas;

      const denominadorDesconto = custoTotalOriginalComJurosCalculado;
      if (denominadorDesconto > 0) {
        percentualDescontoCalculado = (valorAbonadoCalculado / denominadorDesconto) * 100;
      } else {
        percentualDescontoCalculado = 0;
      }
      
      return {
        tempoFinanciamentoOriginal: cenario.tempoOriginal,
        parcelasPagasEmDia: cenario.pagasEmDia,
        custoFinalLote: custoFinalCalculado,
        parcelaBaseCalculada: parcelaBaseDoCenario,
        valorAbonado: valorAbonadoCalculado,
        percentualDesconto: percentualDescontoCalculado,
      };
    });
  }, [valorLoteOriginal, valorEntradaPrincipal, taxaJurosMensalReferencia, igmpAnual]);

  const handleSaveImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);

    const igpmInputContainer = printRef.current.querySelector("#igpmInputPontualidadeContainer") as HTMLElement | null;
    const saveButtonElement = saveButtonRef.current;

    let originalDisplayIgpm = "";
    let originalDisplaySaveButton = "";

    if (igpmInputContainer) {
        originalDisplayIgpm = igpmInputContainer.style.display;
        igpmInputContainer.style.display = "none";
    }
    if (saveButtonElement) {
        originalDisplaySaveButton = saveButtonElement.style.display;
        saveButtonElement.style.display = "none";
    }

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: MOMENTUM_COLORS.white,
        onclone: (documentClone) => {
            const clonedIgpmInputContainer = documentClone.querySelector("#igpmInputPontualidadeContainer");
            if (clonedIgpmInputContainer) (clonedIgpmInputContainer as HTMLElement).style.display = "none";
            
            const clonedSaveButton = documentClone.querySelector("#saveCampaignButtonPontualidade");
            if (clonedSaveButton) (clonedSaveButton as HTMLElement).style.display = "none";
            
            const clonedButtonContainer = documentClone.querySelector("#buttonContainer");
            if (clonedButtonContainer) (clonedButtonContainer as HTMLElement).style.display = "none";
        }
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "campanha_pontualidade_premiada.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao capturar imagem da campanha Pontualidade Premiada:", error);
      alert("Falha ao gerar imagem da campanha. Verifique o console para mais detalhes.");
    } finally {
      setIsCapturing(false);
      if (igpmInputContainer) igpmInputContainer.style.display = originalDisplayIgpm;
      if (saveButtonElement) saveButtonElement.style.display = originalDisplaySaveButton;
    }
  };

  return (
    <div ref={printRef} className="p-4 border rounded-lg bg-white mt-4 print-campaign-sophisticated" style={{ fontFamily: "Arial, sans-serif"}}>
      <style>
        {`
          .print-hide-on-print { display: none !important; }
        `}
      </style>
      {/* Cabeçalho com Logo */}
      <div className="mb-4 p-3 rounded-t-lg" style={{ backgroundColor: MOMENTUM_COLORS.darkBlue }}>
        <img 
            src={LOGO_MOMENTUM_URL} 
            alt="Logo Momentum" 
            className="h-10 mx-auto mb-2 object-contain w-auto"
          />
        <h3 className="text-lg font-semibold text-center" style={{ color: MOMENTUM_COLORS.white }}>
            {t('campaigns.pontualidade.title')}
        </h3>
        <p className="text-xs text-center mt-1" style={{ color: MOMENTUM_COLORS.lightGrayBg }}>
            {t('campaigns.pontualidade.originalValue')} {formatCurrency(valorLoteOriginal)}
        </p>
      </div>

      {/* Input IGPM - Visível apenas na interface, não na impressão */}
      <div id="igmpInputPontualidadeContainer" className="mb-4 print:hidden">
        <label htmlFor="igmpPontualidade" className="block text-sm font-medium mb-1" style={{ color: MOMENTUM_COLORS.textPrimary }}>{t('campaigns.pontualidade.igmpRate')}</label>
        <input 
          id="igmpPontualidade"
          type="number"
          value={igmpAnual}
          onChange={handleIgmpChange}
          placeholder="Ex: 10"
          className="w-full md:w-1/2 p-2 border rounded"
          style={{ borderColor: MOMENTUM_COLORS.borderLight }}
        />
        <p className="text-xs text-gray-500 mt-1">{t('campaigns.pontualidade.igmpDefault')}</p>
      </div>

      {/* Blocos de Resultados - Mesmo layout para Desktop e Mobile */}
      <div className="space-y-3">
        {resultados.map((res, index) => (
          <div key={index} className="border rounded-lg p-3 shadow"
               style={{ borderColor: MOMENTUM_COLORS.borderLight, backgroundColor: MOMENTUM_COLORS.white }}>
            <h4 className="font-semibold text-sm mb-1.5" style={{ color: MOMENTUM_COLORS.darkBlue }}>
              {t('campaigns.pontualidade.originalTerm')}: {res.tempoFinanciamentoOriginal} {t('campaigns.pontualidade.months')} / {t('campaigns.pontualidade.paidOnTime')}: {res.parcelasPagasEmDia}
            </h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.pontualidade.amountWaived')}</span>
                <span className="font-medium" style={{ color: MOMENTUM_COLORS.textPrimary }}>{formatCurrency(res.valorAbonado)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.pontualidade.finalCost')}</span>
                <span className="font-medium" style={{ color: MOMENTUM_COLORS.textPrimary }}>{formatCurrency(res.custoFinalLote)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.pontualidade.discount')}</span>
                <span className="font-bold" style={{ color: MOMENTUM_COLORS.vibrantGreen }}>{res.percentualDesconto.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Salvar Imagem - Visível apenas na interface, não na impressão */}
      <div id="buttonContainer" className="mt-4 text-right print:hidden">
        <button 
          ref={saveButtonRef}
          id="saveCampaignButtonPontualidade"
          onClick={handleSaveImage} 
          disabled={isCapturing} 
          className="px-4 py-2 text-white rounded hover:bg-green-700 print-hide-on-print"
          style={{ backgroundColor: MOMENTUM_COLORS.vibrantGreen }}
        >
          {isCapturing ? "Salvando Imagem..." : t('campaigns.pontualidade.saveImage')}
        </button>
      </div>
      
      {/* Rodapé */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        {t('campaigns.pontualidade.disclaimer')}
      </p>
    </div>
  );
};

export default PontualidadePremiadaSimulacao;

