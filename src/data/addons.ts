export type AddOnId = 'cheese-burst' | 'extra-cheese'
export type PizzaSize = 'S' | 'M' | 'L'

export interface PizzaAddOn {
  id: AddOnId
  name: string
  priceBySize: Record<PizzaSize, number>
}

export const PIZZA_ADD_ONS: PizzaAddOn[] = [
  { id: 'cheese-burst', name: 'Cheese Burst', priceBySize: { S: 39, M: 59, L: 79 } },
  { id: 'extra-cheese', name: 'Extra Cheese', priceBySize: { S: 39, M: 59, L: 79 } },
]

export function addOnPrice(addOnId: AddOnId, sizeId: string): number {
  const addOn = PIZZA_ADD_ONS.find((a) => a.id === addOnId)
  if (!addOn) return 0
  return addOn.priceBySize[sizeId as PizzaSize] ?? 0
}
