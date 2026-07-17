import type { CategoryId } from './types'

/** Display groups for the Full Menu chips, mirroring the prototype's grouping. */
export interface MenuGroup {
  id: string
  label: string
  categories: CategoryId[]
}

export const MENU_GROUPS: MenuGroup[] = [
  { id: 'pizza', label: 'Pizza', categories: ['veg-pizza', 'nonveg-pizza'] },
  { id: 'burgers', label: 'Burgers', categories: ['burgers', 'burger-combos'] },
  { id: 'chicken', label: 'Chicken & Fry', categories: ['fried-chicken', 'nonveg-snacks'] },
  { id: 'pasta', label: 'Pasta & Noodles', categories: ['pasta', 'noodles'] },
  { id: 'sandwiches', label: 'Sandwiches & Wraps', categories: ['sandwiches', 'wraps'] },
  { id: 'snacks', label: 'Snacks & Fries', categories: ['rolls-snacks', 'fries', 'veg-snacks'] },
  { id: 'shakes', label: 'Shakes & Drinks', categories: ['shakes', 'cold-drinks'] },
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
  'fried-chicken': 'American Fry Chicken',
  shakes: 'Shakes',
  'cold-drinks': 'Cold Drinks',
}
