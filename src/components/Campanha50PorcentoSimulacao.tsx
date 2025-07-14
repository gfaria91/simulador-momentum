import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CustomCurrencyInput from './CurrencyInput';
import { formatCurrency, formatPercentage } from '../utils/formattingUtils';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Cores da Momentum
const MOMENTUM_COLORS = {
  darkBlue: '#003366',
  vibrantGreen: '#8CC63F',
  lightGrayBg: '#F0F4F8',
  textPrimary: '#333333',
  textSecondary: '#555555',
  white: '#FFFFFF',
  borderLight: '#DDE6ED',
};

const LOGO_MOMENTUM_URL = '/assets/logos/logo-MOMENTUM-white.png';

interface Campanha50PorcentoSimulacaoProps {
  valorLoteOriginal: number;
  valorEntrada: number;
  valorParcelaMensalInicial: number;
  numeroParcelas: number;
  igpmInicial?: number;
  onVoltar?: () => void;
}

interface ResultadoSimulacaoLinha {
  periodoLabel: string;
  periodoConstrucao: number;
  custoFinalLote: number;
  parcelasRestantes: number;
  valorParcelasRestantes: number;
  descontoTotal: number;
  economiaTotal: number;
}

// Períodos de construção em meses para simulação
const PERIODOS_CONSTRUCAO = [12, 24, 36, 48, 60, 72];

const Campanha50PorcentoSimulacao: React.FC<Campanha50PorcentoSimulacaoProps> = ({
  valorLoteOriginal,
  valorEntrada,
  valorParcelaMensalInicial,
  numeroParcelas,
  igpmInicial = 0,
  onVoltar,
}) => {
  const { t } = useTranslation();
  const [igmpAnual, setIgmpAnual] = useState<number | undefined>(igpmInicial);
  const [periodoConstrucao, setPeriodoConstrucao] = useState<number>(24); // Padrão: 24 meses
  const contentToPrintRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);

  const handleIgmpChange = useCallback((inputName: string, value: number | undefined) => {
    setIgmpAnual(value === undefined ? 0 : value);
  }, []);

  const handlePeriodoConstrucaoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodoConstrucao(parseInt(e.target.value, 10));
  }, []);

  // Cálculo do resultado da campanha de 50%
  const resultado = useMemo(() => {
    const taxaIgmpDecimal = (igmpAnual ?? 0) / 100;
    
    if (valorLoteOriginal <= 0 || valorParcelaMensalInicial <= 0 || numeroParcelas <= 0) {
      return null;
    }

    // Cálculo das parcelas durante o período de construção
    let custoParcelasConstrucao = 0;
    let parcelaAtual = valorParcelaMensalInicial;
    
    for (let mes = 1; mes <= periodoConstrucao; mes++) {
      if (mes > 1 && (mes - 1) % 12 === 0) {
        parcelaAtual *= (1 + taxaIgmpDecimal);
      }
      custoParcelasConstrucao += parcelaAtual;
    }
    
    // Cálculo das parcelas restantes (com desconto de 50%)
    const parcelasRestantes = numeroParcelas - periodoConstrucao;
    const parcelasRestantesComDesconto = parcelasRestantes / 2; // 50% das parcelas restantes
    
    let custoParcelasRestantes = 0;
    for (let mes = periodoConstrucao + 1; mes <= periodoConstrucao + parcelasRestantesComDesconto; mes++) {
      if ((mes - 1) % 12 === 0) {
        parcelaAtual *= (1 + taxaIgmpDecimal);
      }
      custoParcelasRestantes += parcelaAtual;
    }
    
    // Cálculo do custo final e economia
    const custoFinalLote = valorEntrada + custoParcelasConstrucao + custoParcelasRestantes;
    
    // Cálculo do valor total das parcelas restantes sem desconto (para mostrar a economia)
    let valorTotalParcelasRestantesSemDesconto = 0;
    parcelaAtual = valorParcelaMensalInicial;
    for (let mes = 1; mes <= numeroParcelas; mes++) {
      if (mes > 1 && (mes - 1) % 12 === 0) {
        parcelaAtual *= (1 + taxaIgmpDecimal);
      }
      if (mes > periodoConstrucao) {
        valorTotalParcelasRestantesSemDesconto += parcelaAtual;
      }
    }
    
    // Economia total (valor que seria pago sem a campanha - valor com a campanha)
    const valorTotalSemCampanha = valorEntrada + custoParcelasConstrucao + valorTotalParcelasRestantesSemDesconto;
    const economiaTotal = valorTotalSemCampanha - custoFinalLote;
    const descontoPercentual = economiaTotal / valorTotalSemCampanha;
    
    return {
      periodoLabel: `Construção em ${periodoConstrucao} meses`,
      periodoConstrucao,
      custoFinalLote,
      parcelasRestantes,
      valorParcelasRestantes: valorTotalParcelasRestantesSemDesconto,
      descontoTotal: descontoPercentual,
      economiaTotal,
    };
  }, [valorLoteOriginal, valorEntrada, valorParcelaMensalInicial, numeroParcelas, periodoConstrucao, igmpAnual]);

  const handleSaveImage = async () => {
    const elementToCapture = contentToPrintRef.current;
    if (!elementToCapture) {
      console.error("Elemento para captura não encontrado.");
      alert("Erro crítico: Elemento para captura da imagem não foi encontrado. Por favor, recarregue a página e tente novamente.");
      return;
    }

    const originalStyles: { element: HTMLElement; styles: { [key: string]: string } }[] = [];
    const setStyleAndStoreOriginal = (el: HTMLElement, newStyles: { [key: string]: string }) => {
      const original = { element: el, styles: {} as { [key: string]: string} };
      for (const prop in newStyles) {
        original.styles[prop] = (el.style as any)[prop];
        (el.style as any)[prop] = newStyles[prop];
      }
      originalStyles.push(original);
    };

    const igpmInputSection = document.getElementById('igpmInputSectionCampanha50');
    if (igpmInputSection) setStyleAndStoreOriginal(igpmInputSection, { display: 'none' });
    setStyleAndStoreOriginal(elementToCapture, { paddingTop: "30px", paddingBottom: "60px", width: "600px" });

    const logoElement = logoImageRef.current;
    let originalLogoSrc: string | null = null;
    let logoDataUrlUsed = false;

    if (logoElement && logoElement.src && !logoElement.src.startsWith('data:')) {
      originalLogoSrc = logoElement.src;
      try {
        console.log('Tentando converter logo para Data URL...');
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
              console.log('Logo convertido para Data URL com sucesso.');
            } else {
              reject(new Error('Não foi possível obter o contexto 2D do canvas para o logo.'));
            }
          };
          img.onerror = (errEv) => {
            let errorMsg = 'Erro desconhecido ao carregar imagem do logo.';
            if (typeof errEv === 'string') errorMsg = errEv;
            else if (errEv instanceof Event && errEv.target) {
                const target = errEv.target as HTMLImageElement;
                errorMsg = `Erro ao carregar imagem do logo (src: ${target.src}).`;
            }
            console.error('Erro no img.onerror:', errEv);
            reject(new Error(errorMsg));
          };
          img.src = logoElement.src; 
        });
        logoElement.src = dataUrl;
        logoDataUrlUsed = true;
      } catch (error: any) {
        console.error("Falha ao converter logo para Data URL:", error);
        alert(`Aviso: Falha ao processar a imagem do logo (${error.message}). A imagem pode não ser gerada corretamente ou o logo pode estar ausente.`);
      }
    }

    try {
      console.log('Iniciando html2canvas...');
      const canvas = await html2canvas(elementToCapture, { 
        scale: 2, 
        backgroundColor: MOMENTUM_COLORS.white,
        logging: true,
        useCORS: true, 
        onclone: (documentClone) => {
          console.log('html2canvas onclone iniciado.');
          const clonedIgpmInput = documentClone.getElementById('igpmInputSectionCampanha50');
          if (clonedIgpmInput) clonedIgpmInput.style.display = 'none';
          
          const clonedLogo = documentClone.getElementById('campaignLogoImg50');
          if (clonedLogo) {
            (clonedLogo as HTMLImageElement).style.display = 'block';
            (clonedLogo as HTMLImageElement).style.height = '4rem';
            (clonedLogo as HTMLImageElement).style.width = 'auto';
            (clonedLogo as HTMLImageElement).style.objectFit = 'contain';
            if (!logoDataUrlUsed && originalLogoSrc) {
                (clonedLogo as HTMLImageElement).src = originalLogoSrc; 
            }
          }

          const clonedHeader = documentClone.getElementById('campaignImageHeaderPrint50');
          if(clonedHeader) (clonedHeader as HTMLElement).style.display = 'flex';

          const clonedElementToCapture = documentClone.querySelector('.printable-campaign-content-50') as HTMLElement | null;
          if (clonedElementToCapture) {
            clonedElementToCapture.style.width = "600px";
            clonedElementToCapture.style.paddingTop = "30px";
            clonedElementToCapture.style.paddingBottom = "60px";
          }
          
          const clonedValorLoteOriginal = documentClone.getElementById('valorLoteOriginalPrint50');
          if (clonedValorLoteOriginal) clonedValorLoteOriginal.style.display = 'block';

          console.log('html2canvas onclone finalizado.');
        }
      });
      console.log('html2canvas concluído, gerando imagem...');
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'campanha-50-porcento.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Imagem baixada com sucesso.');
    } catch (err: any) {
      console.error("Erro ao gerar imagem da campanha com html2canvas:", err);
      alert(`Erro ao gerar imagem: ${err.message || 'Ocorreu um problema desconhecido durante a captura da imagem.'}`);
    } finally {
      console.log('Restaurando estilos originais...');
      originalStyles.forEach(item => {
        for (const prop in item.styles) {
          (item.element.style as any)[prop] = item.styles[prop];
        }
      });
      if (logoElement && originalLogoSrc && logoDataUrlUsed) {
        logoElement.src = originalLogoSrc;
        console.log('Src original do logo restaurado.');
      }
      console.log('Processo de salvar imagem finalizado.');
    }
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg shadow-md bg-gray-50" id="secaoCampanha50Porcento">
      <style>
        {`
          .print-hide-on-print { display: none !important; }
        `}
      </style>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color: MOMENTUM_COLORS.darkBlue }}>
          {t('campaigns.cinquentaPorcento.title')}
        </h2>
        {onVoltar && (
          <button
            onClick={onVoltar}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Voltar para Simulação
          </button>
        )}
      </div>

      <div id="igpmInputSectionCampanha50" className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="igmpAnualInputCampanha50" className="block text-sm font-medium text-gray-700 mb-1">
              {t('campaigns.cinquentaPorcento.igmpRate')}
            </label>
            <CustomCurrencyInput
              id="igmpAnualInputCampanha50"
              name="igmpAnualCampanha50"
              value={igmpAnual}
              onValueChange={handleIgmpChange}
              placeholder="Ex: 0 ou 7,5"
              decimalScale={2}
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm text-base"
              suffix=" %"
            />
            <p className="text-xs text-gray-500 mt-1.5">{t('campaigns.cinquentaPorcento.igmpDefault')}</p>
          </div>
          
          <div>
            <label htmlFor="periodoConstrucao" className="block text-sm font-medium text-gray-700 mb-1">
              Período de Construção (meses)
            </label>
            <select
              id="periodoConstrucao"
              value={periodoConstrucao}
              onChange={handlePeriodoConstrucaoChange}
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm text-base"
            >
              {PERIODOS_CONSTRUCAO.map(periodo => (
                <option key={periodo} value={periodo}>
                  {periodo} meses
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div 
        ref={contentToPrintRef} 
        className="printable-campaign-content-50 bg-white p-6 rounded-lg border"
        style={{ borderColor: MOMENTUM_COLORS.borderLight, fontFamily: 'Arial, sans-serif' }}
      >
        <div 
          id="campaignImageHeaderPrint50" 
          className="flex flex-col items-center pb-5 mb-5 border-b"
          style={{ 
            borderColor: MOMENTUM_COLORS.borderLight, 
            backgroundColor: MOMENTUM_COLORS.darkBlue, 
            paddingTop: '20px', 
            paddingBottom: '20px', 
            borderTopLeftRadius: '0.5rem', 
            borderTopRightRadius: '0.5rem' 
          }}
        >
          <img 
            ref={logoImageRef}
            id="campaignLogoImg50" 
            src={LOGO_MOMENTUM_URL} 
            alt="Logo Momentum" 
            className="h-16 mb-3 object-contain w-auto" 
            style={{ display: 'block' }} 
          />
          <h2 
            className="text-xl font-semibold text-center"
            style={{ color: MOMENTUM_COLORS.white, lineHeight: '1.3' }}
          >
            {t('campaigns.cinquentaPorcento.title')}
          </h2>
        </div>

        <div 
            id="valorLoteOriginalPrint50"
            className="mb-4 text-center text-base"
            style={{ color: MOMENTUM_COLORS.textPrimary, fontWeight: '500', display: 'block' }}
        >
            {t('campaigns.cinquentaPorcento.originalValue')} {formatCurrency(valorLoteOriginal)}
        </div>

        {(igmpAnual !== undefined && resultado) ? (
          <Card 
            className="overflow-hidden shadow-lg rounded-lg border"
            style={{ borderColor: MOMENTUM_COLORS.borderLight }}
          >
            <CardHeader 
              className="p-3"
              style={{ backgroundColor: MOMENTUM_COLORS.lightGrayBg, borderBottom: `1px solid ${MOMENTUM_COLORS.borderLight}` }}
            >
              <CardTitle 
                className="text-sm font-semibold text-center"
                style={{ color: MOMENTUM_COLORS.darkBlue }}
              >
                {resultado.periodoLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.cinquentaPorcento.downPayment')}</span> 
                    <span style={{ color: MOMENTUM_COLORS.textPrimary }}>{formatCurrency(valorEntrada)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>
                      Parcelas durante construção:
                    </span> 
                    <span style={{ color: MOMENTUM_COLORS.textPrimary }}>{resultado.periodoConstrucao}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>
                      Parcelas restantes (com 50% off):
                    </span> 
                    <span style={{ color: MOMENTUM_COLORS.textPrimary }}>
                      {Math.ceil(resultado.parcelasRestantes / 2)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>Custo Final:</span> 
                    <span className="font-semibold" style={{ color: MOMENTUM_COLORS.textPrimary }}>
                      {formatCurrency(resultado.custoFinalLote)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>Economia:</span> 
                    <span className="font-semibold" style={{ color: MOMENTUM_COLORS.vibrantGreen }}>
                      {formatCurrency(resultado.economiaTotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>Desconto Total:</span> 
                    <span className="font-bold" style={{ color: MOMENTUM_COLORS.vibrantGreen }}>
                      {formatPercentage(resultado.descontoTotal)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t" style={{ borderColor: MOMENTUM_COLORS.borderLight }}>
                <div className="text-center font-semibold" style={{ color: MOMENTUM_COLORS.darkBlue }}>
                  Resumo da Campanha de 50%
                </div>
                <p className="text-sm mt-2" style={{ color: MOMENTUM_COLORS.textSecondary }}>
                  Nesta campanha, você paga a entrada, mais {resultado.periodoConstrucao} parcelas durante o período de construção, 
                  e depois apenas metade das parcelas restantes. Isso representa uma economia total de {formatCurrency(resultado.economiaTotal)}, 
                  ou {formatPercentage(resultado.descontoTotal)} do valor que seria pago sem a campanha.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-center text-gray-500 py-4 text-base">Resultados da simulação da campanha aparecerão aqui.</p>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveImage}
          disabled={!(igmpAnual !== undefined && resultado)}
          className="text-white font-semibold py-2.5 px-5 rounded-md text-base disabled:opacity-70 shadow-md hover:opacity-90 transition-opacity print-hide-on-print"
          style={{ backgroundColor: MOMENTUM_COLORS.darkBlue }}
        >
          {t('campaigns.cinquentaPorcento.saveImage')}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        {t('campaigns.cinquentaPorcento.disclaimer')}
      </p>
    </div>
  );
};

export default Campanha50PorcentoSimulacao;
