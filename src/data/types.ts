export type CategoryId =
  | 'veg-pizza'
  | 'nonveg-pizza'
  | 'pasta'
  | 'noodles'
  | 'burgers'
  | 'burger-combos'
  | 'wraps'
  | 'rolls-snacks'
  | 'fries'
  | 'sandwiches'
  | 'veg-snacks'
  | 'nonveg-snacks'
  | 'fried-chicken'
  | 'shakes'
  | 'cold-drinks'

export interface Variant {
  /** 'S' | 'M' | 'L' | 'veg' | 'nonveg' | 'half' | 'full' | 'std' */
  id: string
  /** Human label; empty string for single-variant items */
  label: string
  /** Whole rupees */
  price: number
  /** Overrides MenuItem.isVeg for dual veg/non-veg items */
  isVeg?: boolean
}

export interface MenuItem {
  /** Stable slug — used as the cart/order key. Never reuse for a different item. */
  id: string
  name: string
  description?: string
  category: CategoryId
  isVeg: boolean
  /** Always at least one entry; flat-priced items use a single 'std' variant */
  variants: Variant[]
  /** Pizzas can take Cheese Burst / Extra Cheese */
  supportsAddOns?: boolean
}

export interface Category {
  id: CategoryId
  name: string
  emoji: string
}
