import React from 'react';

interface NumberInputProps {
  id: string;
  name: string;
  label?: string;
  value: number;
  onChange?: (name: string, value: number) => void;
  onValueChange?: (name: string, value: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  onValueChange,
  placeholder = "0",
  required = false,
  disabled = false,
  className = "",
  min,
  max
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      if (onChange) onChange(name, newValue);
      if (onValueChange) onValueChange(name, newValue);
    } else {
      if (onChange) onChange(name, 0);
      if (onValueChange) onValueChange(name, 0);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="number"
        id={id}
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      />
    </div>
  );
};

export default NumberInput;
