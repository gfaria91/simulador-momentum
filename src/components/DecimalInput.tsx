import React, { useState, useEffect, ChangeEvent, InputHTMLAttributes, KeyboardEvent, useRef } from 'react';

export interface DecimalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  name: string;
  value: number | undefined; // O valor numérico real
  onChange?: (name: string, value: number | undefined) => void;
  onValueChange?: (name: string, value: number | undefined) => void; // Alias para onChange para compatibilidade
  decimalScale?: number;
  className?: string;
  placeholder?: string;
  integerOnly?: boolean;
  suffix?: string;
  required?: boolean;
  label?: string;
}

const DecimalInput: React.FC<DecimalInputProps> = ({
  name,
  value,
  onChange,
  onValueChange,
  decimalScale = 2,
  className = '',
  placeholder,
  integerOnly = false,
  suffix,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Formata um número para a string de exibição (ex: 123.45 -> "123,45")
  const formatNumberToDisplayString = (num: number | undefined): string => {
    if (num === undefined) return '';
    const numStr = String(num);
    const [integerPart, fractionalPart = ''] = numStr.split('.');
    
    if (decimalScale > 0 && !integerOnly) {
      let decimals = fractionalPart.padEnd(decimalScale, '0');
      decimals = decimals.substring(0, decimalScale); // Garante o tamanho correto
      return `${integerPart},${decimals}`;
    }
    return integerPart;
  };
  
  // Sincroniza o displayValue com a prop 'value' quando 'value' muda externamente
  useEffect(() => {
    const currentElement = inputRef.current;
    // Só atualiza o display se o campo não estiver focado, 
    // para não interferir com a digitação do usuário.
    if (currentElement !== document.activeElement) {
        setDisplayValue(formatNumberToDisplayString(value));
    }
  }, [value, decimalScale, integerOnly]); // Depende de 'value', 'decimalScale' e 'integerOnly'


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const userInput = event.target.value;
    setDisplayValue(userInput); // Deixa o usuário digitar livremente, atualiza o display imediatamente

    // Tenta converter para número e chamar onChange
    if (userInput === '') {
      if (onChange) onChange(name, undefined);
      if (onValueChange) onValueChange(name, undefined);
    } else if (userInput.endsWith(',') || userInput.endsWith('.')) {
      // Se termina com separador, o valor numérico é indefinido por enquanto
      if (onChange) onChange(name, undefined);
      if (onValueChange) onValueChange(name, undefined);
    } else {
      const numericValue = parseFloat(userInput.replace(',', '.'));
      if (!isNaN(numericValue)) {
        // Propaga o valor arredondado conforme decimalScale
        if (integerOnly) {
          const roundedValue = Math.floor(numericValue);
          if (onChange) onChange(name, roundedValue);
          if (onValueChange) onValueChange(name, roundedValue);
        } else {
          const factor = Math.pow(10, decimalScale);
          const roundedValueForProp = Math.round(numericValue * factor) / factor;
          if (onChange) onChange(name, roundedValueForProp);
          if (onValueChange) onValueChange(name, roundedValueForProp);
        }
      } else {
        if (onChange) onChange(name, undefined);
        if (onValueChange) onValueChange(name, undefined);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const currentValue = event.currentTarget.value;
    const selectionStart = event.currentTarget.selectionStart;
    const selectionEnd = event.currentTarget.selectionEnd;

    // Permite teclas de controle
    if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key)) {
      return;
    }

    // Permite números
    if (key >= '0' && key <= '9') {
      const separatorIndex = Math.max(currentValue.indexOf(','), currentValue.indexOf('.'));
      if (separatorIndex !== -1 && selectionStart && selectionStart > separatorIndex) {
        const decimalPart = currentValue.substring(separatorIndex + 1);
        // Impede digitar mais casas decimais do que o permitido, a menos que esteja selecionando para substituir
        if (decimalPart.length >= decimalScale && selectionStart === selectionEnd) { 
          event.preventDefault();
          return;
        }
      }
      return;
    }

    // Permite um único separador decimal (vírgula ou ponto), mas não se for integerOnly
    if ((key === ',' || key === '.') && !currentValue.includes(',') && !currentValue.includes('.') && !integerOnly) {
      return;
    }

    event.preventDefault();
  };
  
  const handleBlur = () => {
    // Ao perder o foco, formata o displayValue com base no 'value' numérico atualizado (que foi setado pelo onChange)
    setDisplayValue(formatNumberToDisplayString(value));
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={integerOnly ? "numeric" : "decimal"}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default DecimalInput;
