export function calcularEntrada(valorLote: number, percentual: number): number {
  return +(valorLote * (percentual / 100)).toFixed(2);
}
