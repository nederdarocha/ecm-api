export const STATUS_ORDER = [
  "Rascunho",
  "Aguardando",
  "Confirmado",
  "Produzindo",
  "Produzido",
  "Entregue",
  "Cancelado",
  undefined,
] as const;
export type IStatusOrder = typeof STATUS_ORDER[number];
