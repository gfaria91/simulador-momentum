import React, { useState } from "react";
import CurrencyInputField, { CurrencyInputProps } from "react-currency-input-field";

// Não estender de CurrencyInputProps para evitar conflitos de tipagem
export interface CustomCurrencyInputProps {
  id?: string;
  name: string;
  value?: number | string; // App.tsx usa number para o estado dos valores financeiros
  onValueChange?: (name: string, value: number | undefined) => void;
  onChange?: (name: string, value: number | undefined) => void; // Alias para onValueChange para compatibilidade
  showPrefix?: boolean;
  decimalScale?: number;
  suffix?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomCurrencyInput: React.FC<CustomCurrencyInputProps> = ({
  id,
  name,
  value, // Prop: valor numérico vindo do App.tsx
  onValueChange, // Callback para propagar o valor numérico atualizado
  onChange, // Alias para onValueChange
  placeholder,
  disabled,
  showPrefix = false,
  decimalScale = 2,
  suffix = "",
}) => {
  // Estado interno para o valor como string, permitindo digitação livre (ex: "123,")
  // Inicializa com base na prop 'value', formatando para pt-BR se for número
  const [internalStringValue, setInternalStringValue] = useState<string | undefined>(() => {
    if (value === undefined || value === null || value === '') return undefined;
    // Garante que o valor inicial seja uma string com vírgula como separador decimal
    return String(value).replace('.', ',');
  });

  // Sincroniza a prop 'value' (numérica, externa) com 'internalStringValue' (string do input)
  React.useEffect(() => {
    const propValueAsNumber = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    let internalValueAsNumber: number | undefined = undefined;

    if (internalStringValue !== undefined && internalStringValue !== "") {
      // Converte a string interna (que pode ter formato pt-BR) para número
      const parsed = parseFloat(internalStringValue.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(parsed)) {
        internalValueAsNumber = parsed;
      }
    }
    
    // Condição para atualizar o internalStringValue:
    // 1. Se o valor numérico da prop é diferente do valor numérico que o input representa.
    // Isso cobre atualizações externas ou resets.
    if (propValueAsNumber !== internalValueAsNumber) {
      if (propValueAsNumber === undefined || propValueAsNumber === null) {
        // Se a prop for undefined/null, e o internalStringValue não for já undefined ou vazio
        if (internalStringValue !== undefined && internalStringValue !== "") {
          setInternalStringValue(undefined);
        }
      } else {
        // Formata o número da prop para a string do input (formato pt-BR)
        const newStringForInput = String(propValueAsNumber).replace('.', ',');
        // Só atualiza se a string formatada for diferente da string interna atual
        // Isso evita sobrescrever a digitação do usuário (ex: "123,") desnecessariamente
        // e previne loops de renderização.
        if (newStringForInput !== internalStringValue) {
           setInternalStringValue(newStringForInput);
        }
      }
    }
  }, [value, internalStringValue]); // Reage a mudanças na prop 'value'

  const handleValueChange = (
    val?: string, // String formatada pela biblioteca (ex: "1.234,56" ou "123," durante digitação)
    fieldName?: string,
    values?: { float: number | null; formatted: string; value: string } // 'value' aqui é a string não formatada (ex: "1234.56")
  ) => {
    // Atualiza o estado string do input com o que o usuário digitou / biblioteca formatou
    setInternalStringValue(val);

    let finalNumericValue: number | undefined;

    // Prioriza 'values.float' da biblioteca, pois é o valor numérico mais preciso
    if (values && values.float !== null && values.float !== undefined) {
      finalNumericValue = values.float;
    } else if (val === undefined || val === '') { // Campo explicitamente vazio
      finalNumericValue = undefined;
    } else if (val) { // Se 'val' existe mas 'values.float' não (ex: digitação "123,")
      // Tenta parsear 'val' (string formatada) para número
      // Remove separadores de milhar (ponto) e substitui vírgula decimal por ponto para parseFloat
      const rawValForParsing = val.replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(rawValForParsing);
      finalNumericValue = isNaN(parsed) ? undefined : parsed;
    } else { // Caso residual, considera undefined
      finalNumericValue = undefined;
    }

    // Propaga o valor numérico para o componente pai (App.tsx)
    if (fieldName) {
      if (onValueChange) onValueChange(fieldName, finalNumericValue);
      if (onChange) onChange(fieldName, finalNumericValue);
    } else {
      if (onValueChange) onValueChange(name, finalNumericValue);
      if (onChange) onChange(name, finalNumericValue);
    }
  };

  return (
    <CurrencyInputField
      id={id}
      name={name}
      value={internalStringValue} // Controlado pelo estado string interno
      onValueChange={handleValueChange}
      placeholder={placeholder}
      disabled={disabled}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      intlConfig={{ locale: "pt-BR" }}
      decimalSeparator=","
      groupSeparator="."
      prefix={showPrefix ? "R$ " : ""}
      decimalScale={decimalScale} // A biblioteca usará isso para formatar e limitar casas decimais
      allowNegativeValue={false}
      suffix={suffix}
      allowDecimals={true} // Permite a entrada de decimais
    />
  );
};

export default CustomCurrencyInput;
