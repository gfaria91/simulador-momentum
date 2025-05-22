export function calcularEntrada(valor: number, percentual: number): number {
  return +(valor * (percentual / 100)).toFixed(2);
}
