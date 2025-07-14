import React, { useState } from 'react';
import { SimulacaoInput, TipoCliente, TipoLoteConservacao, TAXAS_JUROS_MENSAIS, TIPOS_LOTE_TAXA, SETORES } from '../logic/calculationLogic';
import CurrencyInput from './CurrencyInput';
import DecimalInput from './DecimalInput';
import NumberInput from './NumberInput';

interface SimulacaoFormProps {
  onSubmit: (data: SimulacaoInput) => void;
}

const SimulacaoForm: React.FC<SimulacaoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SimulacaoInput>({
    tipoCliente: "CCB",
    setor: "Marina",
    quadra: "",
    lote: "",
    tamanhoLote: 0,
    valorLote: undefined,
    
    // Opção 1
    entradaPercentualOpcao1: 15,
    entradaValorOpcao1: undefined,
    parcelasOpcao1: 180,
    taxaJurosMensalOpcao1: 0.0033,
    
    // Opção 2
    entradaPercentualOpcao2: 15,
    entradaValorOpcao2: undefined,
    parcelasOpcao2: 180,
    taxaJurosMensalOpcao2: 0.0033,
    
    // Taxas
    tipoLoteConservacao: "Comum" as TipoLoteConservacao,
    taxaConservacaoComumEditada: 434.11,
    taxaConservacaoNobreEditada: 1282.26,
    quantidadeLotesParaTaxas: 1,
    
    // Checkboxes para taxas
    selecionadoSlim: true,
    valorSlim: 103,
    selecionadoMelhoramentos: true,
    valorMelhoramentos: 240,
    selecionadoTransporte: true,
    valorTransporte: 9,
    outrasTaxas: 0
  });

  const [quadraAlerta, setQuadraAlerta] = useState<{ tipo: 'laerte' | 'danilo' | null, mensagem: string }>({
    tipo: null,
    mensagem: ''
  });

  const handleInputChange = (field: keyof SimulacaoInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuadraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // Limitar a 2 letras
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    
    // Verificar se a segunda letra é A, C, E, G, I, K, M, O, Q, S, U, W, Y
    if (value.length === 2) {
      const segundaLetra = value.charAt(1);
      if (['A', 'C', 'E', 'G', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y'].includes(segundaLetra)) {
        setQuadraAlerta({ tipo: 'laerte', mensagem: 'Quadra Laerte' });
      } else {
        setQuadraAlerta({ tipo: 'danilo', mensagem: 'Quadra Danilo' });
      }
    } else {
      setQuadraAlerta({ tipo: null, mensagem: '' });
    }
    
    handleInputChange('quadra', value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Dados do Cliente</h2>
          
          <div className="mb-4">
            <label htmlFor="tipoCliente" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cliente <span className="text-red-500">*</span>
            </label>
            <select
              id="tipoCliente"
              value={formData.tipoCliente}
              onChange={(e) => handleInputChange('tipoCliente', e.target.value as TipoCliente)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="CCB">CCB</option>
              <option value="Venda Direta">Venda Direta</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="setor" className="block text-sm font-medium text-gray-700 mb-1">
              Setor <span className="text-red-500">*</span>
            </label>
            <select
              id="setor"
              value={formData.setor}
              onChange={(e) => handleInputChange('setor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {SETORES.map((setor) => (
                <option key={setor.value} value={setor.value}>{setor.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="quadra" className="block text-sm font-medium text-gray-700 mb-1">
              Quadra <span className="text-red-500">*</span>
              {quadraAlerta.tipo && (
                <span className={`ml-2 text-sm ${quadraAlerta.tipo === 'laerte' ? 'text-red-500' : 'text-blue-500'}`}>
                  {quadraAlerta.mensagem}
                </span>
              )}
            </label>
            <input
              type="text"
              id="quadra"
              value={formData.quadra}
              onChange={handleQuadraChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="lote" className="block text-sm font-medium text-gray-700 mb-1">
              Lote <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lote"
              value={formData.lote}
              onChange={(e) => handleInputChange('lote', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <NumberInput
            id="tamanhoLote"
            name="tamanhoLote"
            label="Tamanho do Lote (m²)"
            value={formData.tamanhoLote}
            onChange={(name, value) => handleInputChange('tamanhoLote', value)}
            required
          />
          
          <CurrencyInput
            id="valorLote"
            name="valorLote"
            label="Valor do Lote (R$)"
            value={formData.valorLote}
            onChange={(name, value) => handleInputChange('valorLote', value)}
            onValueChange={(name, value) => handleInputChange('valorLote', value)}
            required
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Taxas</h2>
          
          <div className="mb-4">
            <label htmlFor="tipoLoteConservacao" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Lote para Taxa de Conservação <span className="text-red-500">*</span>
            </label>
            <select
              id="tipoLoteConservacao"
              value={formData.tipoLoteConservacao}
              onChange={(e) => handleInputChange('tipoLoteConservacao', e.target.value as TipoLoteConservacao)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TIPOS_LOTE_TAXA.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="quantidadeLotesParaTaxas" className="block text-sm font-medium text-gray-700 mb-1">
              Qtd. Lotes para Taxas <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantidadeLotesParaTaxas"
              value={formData.quantidadeLotesParaTaxas}
              onChange={(e) => handleInputChange('quantidadeLotesParaTaxas', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="taxaConservacaoComumEditada" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Conservação Comum (R$ Mensal)
            </label>
            <CurrencyInput
              id="taxaConservacaoComumEditada"
              name="taxaConservacaoComumEditada"
              value={formData.taxaConservacaoComumEditada}
              onValueChange={(name, value) => handleInputChange('taxaConservacaoComumEditada', value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="taxaConservacaoNobreEditada" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Conservação Nobre (R$ Mensal)
            </label>
            <CurrencyInput
              id="taxaConservacaoNobreEditada"
              name="taxaConservacaoNobreEditada"
              value={formData.taxaConservacaoNobreEditada}
              onValueChange={(name, value) => handleInputChange('taxaConservacaoNobreEditada', value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="valorSlim" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa SLIM (R$)
            </label>
            <CurrencyInput
              id="valorSlim"
              name="valorSlim"
              value={formData.valorSlim}
              onValueChange={(name, value) => handleInputChange('valorSlim', value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="valorMelhoramentos" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa Melhoramentos (R$)
            </label>
            <CurrencyInput
              id="valorMelhoramentos"
              name="valorMelhoramentos"
              value={formData.valorMelhoramentos}
              onValueChange={(name, value) => handleInputChange('valorMelhoramentos', value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="valorTransporte" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa Transporte (R$)
            </label>
            <CurrencyInput
              id="valorTransporte"
              name="valorTransporte"
              value={formData.valorTransporte}
              onValueChange={(name, value) => handleInputChange('valorTransporte', value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="outrasTaxas" className="block text-sm font-medium text-gray-700 mb-1">
              Outras Taxas (R$)
            </label>
            <CurrencyInput
              id="outrasTaxas"
              name="outrasTaxas"
              value={formData.outrasTaxas}
              onValueChange={(name, value) => handleInputChange('outrasTaxas', value)}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Opções de Financiamento</h2>
        
        <h3 className="text-lg font-medium mb-2">Opção 1</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label htmlFor="entradaPercentualOpcao1" className="block text-sm font-medium text-gray-700 mb-1">
              Entrada (%) <span className="text-red-500">*</span>
            </label>
            <DecimalInput
              id="entradaPercentualOpcao1"
              name="entradaPercentualOpcao1"
              value={formData.entradaPercentualOpcao1}
              onChange={(name, value) => handleInputChange('entradaPercentualOpcao1', value)}
              suffix="%"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="entradaValorOpcao1" className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Entrada (R$)
            </label>
            <CurrencyInput
              id="entradaValorOpcao1"
              name="entradaValorOpcao1"
              value={formData.entradaValorOpcao1}
              onValueChange={(name, value) => handleInputChange('entradaValorOpcao1', value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="parcelasOpcao1" className="block text-sm font-medium text-gray-700 mb-1">
              Nº de Parcelas <span className="text-red-500">*</span>
            </label>
            <NumberInput
              id="parcelasOpcao1"
              name="parcelasOpcao1"
              value={formData.parcelasOpcao1}
              onChange={(name, value) => handleInputChange('parcelasOpcao1', value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="taxaJurosMensalOpcao1" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Juros Mensal (%) <span className="text-red-500">*</span>
            </label>
            <select
              id="taxaJurosMensalOpcao1"
              value={formData.taxaJurosMensalOpcao1}
              onChange={(e) => handleInputChange('taxaJurosMensalOpcao1', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TAXAS_JUROS_MENSAIS.map((taxa) => (
                <option key={taxa.value} value={taxa.value}>{taxa.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-2">{formData.tipoCliente === "CCB" ? "MOMENTUM (Opção 2)" : "Opção 2"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="entradaPercentualOpcao2" className="block text-sm font-medium text-gray-700 mb-1">
                  Entrada (%) <span className="text-red-500">*</span>
                </label>
                <DecimalInput
                  id="entradaPercentualOpcao2"
                  name="entradaPercentualOpcao2"
                  value={formData.entradaPercentualOpcao2}
                  onChange={(name, value) => handleInputChange('entradaPercentualOpcao2', value)}
                  suffix="%"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="entradaValorOpcao2" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Entrada (R$)
                </label>
                <CurrencyInput
                  id="entradaValorOpcao2"
                  name="entradaValorOpcao2"
                  value={formData.entradaValorOpcao2}
                  onValueChange={(name, value) => handleInputChange('entradaValorOpcao2', value)}
                />
              </div>
              
          <div className="mb-4">
            <label htmlFor="parcelasOpcao2" className="block text-sm font-medium text-gray-700 mb-1">
              Nº de Parcelas <span className="text-red-500">*</span>
            </label>
            <NumberInput
              id="parcelasOpcao2"
              name="parcelasOpcao2"
              value={formData.parcelasOpcao2}
              onChange={(name, value) => handleInputChange('parcelasOpcao2', value)}
              required
            />
          </div>
              
              <div className="mb-4">
                <label htmlFor="taxaJurosMensalOpcao2" className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Juros Mensal (%) <span className="text-red-500">*</span>
                </label>
                <select
                  id="taxaJurosMensalOpcao2"
                  value={formData.taxaJurosMensalOpcao2}
                  onChange={(e) => handleInputChange('taxaJurosMensalOpcao2', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {TAXAS_JUROS_MENSAIS.map((taxa) => (
                    <option key={taxa.value} value={taxa.value}>{taxa.label}</option>
                  ))}
                </select>
              </div>
            </div>
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Gerar Prévia
        </button>
      </div>
    </form>
  );
};

export default SimulacaoForm;
