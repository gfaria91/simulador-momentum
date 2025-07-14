export const formatCurrency = (value: number, currency: string = "BRL", minimumFractionDigits: number = 2): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number, minimumFractionDigits: number = 2): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

