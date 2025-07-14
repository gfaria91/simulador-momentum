import React, { useState, useCallback, useRef, useMemo } from 'react';
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

interface CasaProntaLoteQuitadoSimulacaoProps {
  valorLoteOriginal: number;
  valorEntrada: number;
  valorParcelaMensalInicial: number;
  igpmInicial?: number;
}

interface ResultadoSimulacaoLinha {
  periodoLabel: string;
  periodoAnos: number;
  custoFinalLote: number;
  saldoQuitado: number;
  totalDesconto: number;
}

const PERIODOS_ANOS = [1, 2, 3, 4, 5, 6];

const CasaProntaLoteQuitadoSimulacao: React.FC<CasaProntaLoteQuitadoSimulacaoProps> = ({
  valorLoteOriginal,
  valorEntrada,
  valorParcelaMensalInicial,
  igpmInicial = 0,
}) => {
  const { t } = useTranslation();
  const [igpmAnual, setIgpmAnual] = useState<number | undefined>(igpmInicial);
  const contentToPrintRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);

  const handleIgpmChange = useCallback((inputName: string, value: number | undefined) => {
    setIgpmAnual(value === undefined ? 0 : value);
  }, []);

  useState(() => {
    if (igpmAnual === undefined) {
        setIgpmAnual(0);
    }
  });

  const resultados = useMemo(() => {
    const taxaIgpmDecimal = (igpmAnual ?? 0) / 100;
    const resultadosCalculados: ResultadoSimulacaoLinha[] = [];
    if (valorLoteOriginal <= 0 || valorParcelaMensalInicial < 0) return [];

    PERIODOS_ANOS.forEach(anos => {
      let custoTotalParcelas = 0;
      let parcelaAtual = valorParcelaMensalInicial;
      const totalMeses = anos * 12;
      for (let mes = 1; mes <= totalMeses; mes++) {
        if (mes > 1 && (mes - 1) % 12 === 0) {
          parcelaAtual *= (1 + taxaIgpmDecimal);
        }
        custoTotalParcelas += parcelaAtual;
      }
      const custoFinalLote = valorEntrada + custoTotalParcelas;
      const saldoQuitado = valorLoteOriginal - custoFinalLote;
      const saldoQuitadoNaoNegativo = Math.max(0, saldoQuitado);
      const totalDesconto = valorLoteOriginal > 0 ? (saldoQuitadoNaoNegativo / valorLoteOriginal) : 0;
      
      const periodoLabel = anos === 1 
        ? `${t('campaigns.casaPronta.homeReadyIn')} ${anos} ${t('campaigns.casaPronta.yearLabel')} ${t('campaigns.casaPronta.ofFinancing')}`
        : `${t('campaigns.casaPronta.homeReadyIn')} ${anos} ${t('campaigns.casaPronta.yearsLabel')} ${t('campaigns.casaPronta.ofFinancing')}`;

      resultadosCalculados.push({
        periodoLabel,
        periodoAnos: anos,
        custoFinalLote,
        saldoQuitado: saldoQuitadoNaoNegativo,
        totalDesconto,
      });
    });
    return resultadosCalculados.sort((a, b) => a.periodoAnos - b.periodoAnos);
  }, [valorLoteOriginal, valorEntrada, valorParcelaMensalInicial, igpmAnual]);

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

    const igpmInputSection = document.getElementById('igpmInputSectionCampanha');
    if (igpmInputSection) setStyleAndStoreOriginal(igpmInputSection, { display: 'none' });
    setStyleAndStoreOriginal(elementToCapture, { paddingTop: "30px", paddingBottom: "60px" });

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
            canvas.width = img.naturalWidth; // Usar naturalWidth/Height para dimensões reais
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
          const clonedIgpmInput = documentClone.getElementById('igpmInputSectionCampanha');
          if (clonedIgpmInput) clonedIgpmInput.style.display = 'none';
          
          const clonedLogo = documentClone.getElementById('campaignLogoImg');
          if (clonedLogo) {
            (clonedLogo as HTMLImageElement).style.display = 'block';
            (clonedLogo as HTMLImageElement).style.height = '4rem'; // Equivalente a h-16
            (clonedLogo as HTMLImageElement).style.width = 'auto';
            (clonedLogo as HTMLImageElement).style.objectFit = 'contain';
            // Se usamos Data URL, o src já está correto. Se não, garantimos que o src original seja usado.
            if (!logoDataUrlUsed && originalLogoSrc) {
                (clonedLogo as HTMLImageElement).src = originalLogoSrc; 
            }
          }

          const clonedHeader = documentClone.getElementById('campaignImageHeaderPrint');
          if(clonedHeader) (clonedHeader as HTMLElement).style.display = 'flex';

          const clonedElementToCapture = documentClone.querySelector('.printable-campaign-content-sophisticated') as HTMLElement | null;
          if (clonedElementToCapture) {
            clonedElementToCapture.style.width = "600px"; // Ajusta a largura para proporção mais vertical
            clonedElementToCapture.style.paddingTop = "30px";
            clonedElementToCapture.style.paddingBottom = "60px";
          }
          
          const clonedValorLoteOriginal = documentClone.getElementById('valorLoteOriginalPrint');
          if (clonedValorLoteOriginal) clonedValorLoteOriginal.style.display = 'block';

          const clonedCardsContainer = documentClone.querySelector('.grid.grid-cols-2.gap-5') as HTMLElement | null;
          if (clonedCardsContainer) {
            clonedCardsContainer.style.display = 'grid';
            clonedCardsContainer.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
            clonedCardsContainer.style.gap = '20px';
          }

          const clonedCards = documentClone.querySelectorAll('.printable-campaign-content-sophisticated .overflow-hidden.shadow-lg') as NodeListOf<HTMLElement>;
          clonedCards.forEach(clonedCard => {
            clonedCard.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            clonedCard.style.border = `1px solid ${MOMENTUM_COLORS.borderLight}`;
            clonedCard.style.backgroundColor = MOMENTUM_COLORS.white;
            const cardTitles = clonedCard.querySelectorAll('.text-sm.font-semibold.text-center') as NodeListOf<HTMLElement>;
            cardTitles.forEach(title => title.style.fontSize = '0.65rem'); // Ajuste fino para evitar quebra
            const cardContentElement = clonedCard.querySelector('.p-3.text-sm'); // Seleciona o CardContent que tem essas classes
            if (cardContentElement) {
              const spansInsideContent = cardContentElement.querySelectorAll('span') as NodeListOf<HTMLElement>;
              spansInsideContent.forEach(span => {
                span.style.fontSize = '0.65rem'; // Ajuste fino para evitar quebra
              });
            }
          });
          console.log('html2canvas onclone finalizado.');
        }
      });
      console.log('html2canvas concluído, gerando imagem...');
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'campanha-casa-pronta-lote-quitado.png';
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
        logoElement.src = originalLogoSrc; // Restaurar o src original do logo se foi modificado para Data URL
        console.log('Src original do logo restaurado.');
      }
      console.log('Processo de salvar imagem finalizado.');
    }
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg shadow-md bg-gray-50" id="secaoCampanhaCasaPronta">
      <style>
        {`
          .print-hide-on-print { display: none !important; }
        `}
      </style>
      <div id="igmpInputSectionCampanha" className="mb-6 p-4 bg-white rounded-lg shadow">
        <label htmlFor="igpmAnualInputCampanha" className="block text-sm font-medium text-gray-700 mb-1">
          {t('campaigns.casaPronta.igpmRate')}
        </label>
        <CustomCurrencyInput
          id="igpmAnualInputCampanha"
          name="igpmAnualCampanha"
          value={igpmAnual}
          onValueChange={handleIgpmChange}
          placeholder="Ex: 0 ou 7,5"
          decimalScale={2}
          className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm text-base"
          suffix=" %"
        />
        <p className="text-xs text-gray-500 mt-1.5">{t('campaigns.casaPronta.igpmDefault')}</p>
      </div>

      <div 
        ref={contentToPrintRef} 
        className="printable-campaign-content-sophisticated bg-white p-6 rounded-lg border"
        style={{ borderColor: MOMENTUM_COLORS.borderLight, fontFamily: 'Arial, sans-serif' }}
      >
        <div 
          id="campaignImageHeaderPrint" 
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
            id="campaignLogoImg" 
            src={LOGO_MOMENTUM_URL} 
            alt="Logo Momentum" 
            className="h-16 mb-3 object-contain w-auto" 
            style={{ display: 'block' }} 
          />
          <h2 
            className="text-xl font-semibold text-center"
            style={{ color: MOMENTUM_COLORS.white, lineHeight: '1.3' }}
          >
            {t('campaigns.casaPronta.title')}
          </h2>
        </div>

        <div 
            id="valorLoteOriginalPrint"
            className="mb-4 text-center text-base"
            style={{ color: MOMENTUM_COLORS.textPrimary, fontWeight: '500', display: 'block' }}
        >
            {t('campaigns.casaPronta.originalValue')} {formatCurrency(valorLoteOriginal)}
        </div>

        {(igpmAnual !== undefined && resultados.length > 0) ? (
          <div className="grid grid-cols-2 gap-5"> 
            {resultados.map((res: ResultadoSimulacaoLinha) => (
              <Card 
                key={res.periodoAnos} 
                className="overflow-hidden shadow-lg rounded-lg flex-1 border"
                style={{ borderColor: MOMENTUM_COLORS.borderLight }}
              >
                <CardHeader 
                  className="p-3"
                  style={{ backgroundColor: MOMENTUM_COLORS.lightGrayBg, borderBottom: `1px solid ${MOMENTUM_COLORS.borderLight}` }}
                >
                  <CardTitle 
                    className="text-sm font-semibold text-center leading-snug"
                    style={{ color: MOMENTUM_COLORS.darkBlue, fontSize: '0.65rem' }} // Aplicado aqui também para consistência na tela
                  >
                    {res.periodoLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-1.5 text-sm" style={{ fontSize: '0.65rem' }}> {/* Aplicado aqui também */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.casaPronta.finalCost')}</span> 
                    <span className="font-semibold" style={{ color: MOMENTUM_COLORS.textPrimary }}>{formatCurrency(res.custoFinalLote)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.casaPronta.balancePaid')}</span> 
                    <span style={{ color: MOMENTUM_COLORS.textPrimary }}>{formatCurrency(res.saldoQuitado)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: MOMENTUM_COLORS.textSecondary }}>{t('campaigns.casaPronta.discount')}</span> 
                    <span className="font-bold" style={{ color: MOMENTUM_COLORS.vibrantGreen }}>{formatPercentage(res.totalDesconto)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4 text-base">{t('campaigns.casaPronta.resultsPlaceholder')}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveImage}
          disabled={!(igpmAnual !== undefined && resultados.length > 0)}
          className="text-white font-semibold py-2.5 px-5 rounded-md text-base disabled:opacity-70 shadow-md hover:opacity-90 transition-opacity print-hide-on-print"
          style={{ backgroundColor: MOMENTUM_COLORS.darkBlue }}
        >
          {t('campaigns.casaPronta.saveImage')}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        {t('campaigns.casaPronta.disclaimer')}
      </p>
    </div>
  );
};

export default CasaProntaLoteQuitadoSimulacao;

