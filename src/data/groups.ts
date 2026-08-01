import type { CategoryId } from './types'
import { MENU } from './menu'

/** Display groups for the menu chips, mirroring the rebrand's grouping. */
export interface MenuGroup {
  id: string
  label: string
  categories: CategoryId[]
}

export const MENU_GROUPS: MenuGroup[] = [
  { id: 'pizza', label: 'Pizza', categories: ['veg-pizza', 'nonveg-pizza'] },
  { id: 'burgers', label: 'Burgers', categories: ['burgers', 'burger-combos'] },
  { id: 'chicken', label: 'Chicken', categories: ['fried-chicken', 'nonveg-snacks'] },
  { id: 'shakes', label: 'Shakes', categories: ['shakes', 'cold-drinks'] },
  { id: 'pasta', label: 'Pasta & Noodles', categories: ['pasta', 'noodles'] },
  { id: 'sandwiches', label: 'Sandwiches', categories: ['sandwiches', 'wraps'] },
  { id: 'snacks', label: 'Snacks & Fries', categories: ['rolls-snacks', 'fries', 'veg-snacks'] },
]

export const CATEGORY_TITLES: Record<CategoryId, string> = {
  'veg-pizza': 'Veg Pizza',
  'nonveg-pizza': 'Non-Veg Pizza',
  burgers: 'Burgers',
  'burger-combos': 'Burger Combos',
  pasta: 'Pasta',
  noodles: 'Noodles',
  sandwiches: 'Grilled Sandwiches',
  wraps: 'Wraps',
  'rolls-snacks': 'Rolls & Snacks',
  fries: 'Fries',
  'veg-snacks': 'Veg Snacks',
  'nonveg-snacks': 'Non-Veg Snacks',
  'fried-chicken': 'Fried Chicken',
  shakes: 'Shakes',
  'cold-drinks': 'Cold Drinks',
}

/** Item count per group, shown on the chips ("Pizza 30"). */
export function groupCount(group: MenuGroup): number {
  return MENU.filter((item) => group.categories.includes(item.category)).length
}

export function categoryCount(category: CategoryId): number {
  return MENU.filter((item) => item.category === category).length
}
