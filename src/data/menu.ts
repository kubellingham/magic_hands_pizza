import type { Category, MenuItem, Variant } from './types'

export const CATEGORIES: Category[] = [
  { id: 'veg-pizza', name: 'Veg Pizza', emoji: '🍕' },
  { id: 'nonveg-pizza', name: 'Non-Veg Pizza', emoji: '🍗' },
  { id: 'burgers', name: 'Burgers', emoji: '🍔' },
  { id: 'burger-combos', name: 'Burger Combos', emoji: '🥤' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'sandwiches', name: 'Grilled Sandwiches', emoji: '🥪' },
  { id: 'noodles', name: 'Noodles', emoji: '🍜' },
  { id: 'rolls-snacks', name: 'Rolls & Snacks', emoji: '🌯' },
  { id: 'fries', name: 'Fries', emoji: '🍟' },
  { id: 'veg-snacks', name: 'Veg Snacks', emoji: '🥦' },
  { id: 'nonveg-snacks', name: 'Non-Veg Snacks', emoji: '🍖' },
  { id: 'fried-chicken', name: 'Fried Chicken', emoji: '🍗' },
  { id: 'wraps', name: 'Wraps', emoji: '🌮' },
  { id: 'shakes', name: 'Shakes', emoji: '🥤' },
  { id: 'cold-drinks', name: 'Cold Drinks', emoji: '🧊' },
]

const sml = (s: number, m: number, l: number): Variant[] => [
  { id: 'S', label: 'Small', price: s },
  { id: 'M', label: 'Medium', price: m },
  { id: 'L', label: 'Large', price: l },
]

const ml = (m: number, l: number): Variant[] => [
  { id: 'M', label: 'Medium', price: m },
  { id: 'L', label: 'Large', price: l },
]

const vegNonveg = (veg: number, nonveg: number): Variant[] => [
  { id: 'veg', label: 'Veg', price: veg, isVeg: true },
  { id: 'nonveg', label: 'Non-Veg', price: nonveg, isVeg: false },
]

const std = (price: number): Variant[] => [{ id: 'std', label: '', price }]

export const MENU: MenuItem[] = [
  // ── Veg Pizza (S/M/L) ────────────────────────────────────────────────
  { id: 'margherita', name: 'Margherita Pizza', description: 'Tomato + Cheese', category: 'veg-pizza', isVeg: true, variants: sml(89, 169, 259), supportsAddOns: true },
  { id: 'single-topping', name: 'Single Topping Pizza', description: 'Any one topping of your choice: Corn, Onion, Capsicum or Pineapple', category: 'veg-pizza', isVeg: true, variants: sml(99, 189, 269), supportsAddOns: true },
  { id: 'golden-corn', name: 'Golden Corn Pizza', description: 'Corn + Cheese', category: 'veg-pizza', isVeg: true, variants: sml(99, 189, 269), supportsAddOns: true },
  { id: 'veg-delight', name: 'Veg Delight Pizza', description: 'Onion + Capsicum + Corn', category: 'veg-pizza', isVeg: true, variants: sml(99, 189, 299), supportsAddOns: true },
  { id: 'love-bite', name: 'Love Bite Pizza', description: 'Mushroom + Olive', category: 'veg-pizza', isVeg: true, variants: sml(99, 189, 309), supportsAddOns: true },
  { id: 'veg-hawaiian', name: 'Veg Hawaiian Pizza', description: 'Pineapple + Paneer + Sweet Corn', category: 'veg-pizza', isVeg: true, variants: sml(109, 199, 309), supportsAddOns: true },
  { id: 'farmhouse', name: 'Farmhouse Pizza', description: 'Paneer + Capsicum + Red Paprika', category: 'veg-pizza', isVeg: true, variants: sml(119, 229, 329), supportsAddOns: true },
  { id: 'azexotic-veggie', name: 'Azexotic Veggie Pizza', description: 'Capsicum + Mushroom + Sweet Corn + Onion', category: 'veg-pizza', isVeg: true, variants: sml(109, 199, 319), supportsAddOns: true },
  { id: 'veg-spicy', name: 'Veg Spicy Pizza', description: 'Red Paprika + Olive + Jalapeno + Capsicum', category: 'veg-pizza', isVeg: true, variants: sml(119, 219, 319), supportsAddOns: true },
  { id: 'peri-peri-veg', name: 'Peri Peri Veg Pizza', description: 'Onion + Capsicum + Mushroom + Bell Pepper + Sweet Corn + Tomato', category: 'veg-pizza', isVeg: true, variants: sml(119, 209, 329), supportsAddOns: true },
  { id: 'hot-n-spicy', name: 'Hot & Spicy Pizza', description: 'Bell Peppers + Jalapenos + Onion + Chilli Paneer + Tomato', category: 'veg-pizza', isVeg: true, variants: sml(129, 239, 329), supportsAddOns: true },
  { id: 'magic-mushroom', name: 'Magic Mushroom Pizza', description: 'Mushroom + Black Olives + Onion', category: 'veg-pizza', isVeg: true, variants: sml(119, 219, 329), supportsAddOns: true },
  { id: 'makhani-paneer', name: 'Makhani Paneer Pizza', description: 'Paneer + Capsicum + Onion + Tomato in Makhni Sauce', category: 'veg-pizza', isVeg: true, variants: sml(119, 219, 319), supportsAddOns: true },
  { id: 'mexican-veg', name: 'Mexican Veg Pizza', description: 'Capsicum + Sweet Corn + Jalapeno + Mushroom', category: 'veg-pizza', isVeg: true, variants: sml(129, 229, 329), supportsAddOns: true },
  { id: 'love-flames', name: 'Love Flames Pizza', description: 'Paneer + Sweet Corn + Olives + Capsicum + Tomato + Red Paprika', category: 'veg-pizza', isVeg: true, variants: sml(129, 219, 339), supportsAddOns: true },
  { id: 'overload-veg', name: 'Overload Pizza', description: 'All toppings', category: 'veg-pizza', isVeg: true, variants: ml(259, 359), supportsAddOns: true },
  { id: 'magic-pizza-hut-spl', name: 'Magic Pizza Hut Spl.', description: 'All toppings', category: 'veg-pizza', isVeg: true, variants: ml(349, 519), supportsAddOns: true },

  // ── Non-Veg Pizza (S/M/L) ────────────────────────────────────────────
  { id: 'chicken-tikka-pizza', name: 'Chicken Tikka Pizza', description: 'Chicken Tikka + Onion + Tomato, topped with mozzarella cheese', category: 'nonveg-pizza', isVeg: false, variants: sml(109, 209, 309), supportsAddOns: true },
  { id: 'hawaiian-chicken', name: 'Hawaiian Pizza', description: 'Roasted Chicken + Pineapple + Onion + Capsicum, topped with mozzarella', category: 'nonveg-pizza', isVeg: false, variants: sml(119, 209, 309), supportsAddOns: true },
  { id: 'peri-peri-chicken-pizza', name: 'Peri Peri Chicken Pizza', description: 'Peri Peri Chicken + Capsicum + Paprika Chilli, topped with mozzarella', category: 'nonveg-pizza', isVeg: false, variants: sml(119, 219, 329), supportsAddOns: true },
  { id: 'spicy-chicken-pizza', name: 'Spicy Chicken Pizza', description: 'Chicken + Onion + Jalapeno, topped with mozzarella + corn', category: 'nonveg-pizza', isVeg: false, variants: sml(129, 229, 339), supportsAddOns: true },
  { id: 'bbq-chicken-pizza', name: 'BBQ Chicken Pizza', description: 'BBQ Chicken + Onion + Capsicum, topped with mozzarella', category: 'nonveg-pizza', isVeg: false, variants: sml(129, 229, 339), supportsAddOns: true },
  { id: 'italian-chicken-pizza', name: 'Italian Chicken Pizza', description: 'Chicken Sausages + Onion + Capsicum', category: 'nonveg-pizza', isVeg: false, variants: sml(129, 249, 359), supportsAddOns: true },
  { id: 'zesty-tremble-chicken', name: 'Zesty Tremble Chicken', description: 'Barbeque Chicken, Spicy Chicken, Red Paprika, Black Olives, Onion', category: 'nonveg-pizza', isVeg: false, variants: sml(139, 280, 359), supportsAddOns: true },
  { id: 'chicken-n-corn', name: 'Chicken N Corn Delight', description: 'Chicken + Sweet Corn + Green Capsicum', category: 'nonveg-pizza', isVeg: false, variants: sml(119, 219, 319), supportsAddOns: true },
  { id: 'chicken-pepperoni', name: 'Chicken Pepperoni Pizza', description: 'Chicken Pepperoni + Green Capsicum + Red Paprika with mozzarella', category: 'nonveg-pizza', isVeg: false, variants: sml(139, 239, 339), supportsAddOns: true },
  { id: 'chicken-supreme', name: 'Chicken Supreme Pizza', description: 'Chicken + Chicken Ham + Green Capsicum + Red Paprika + mozzarella', category: 'nonveg-pizza', isVeg: false, variants: sml(149, 239, 339), supportsAddOns: true },
  { id: 'dynamite-chicken', name: 'Dynamite Chicken', description: 'Grilled Chicken + Capsicum + Mushrooms with mozzarella', category: 'nonveg-pizza', isVeg: false, variants: sml(129, 229, 329), supportsAddOns: true },
  { id: 'chillie-chicken-pizza', name: 'Chillie Chicken Pizza', description: 'Bell Peppers + Jalapenos + Chillies + Onion + Chicken', category: 'nonveg-pizza', isVeg: false, variants: ml(260, 359), supportsAddOns: true },
  { id: 'overload-nonveg', name: 'The Overload Non-Veg Pizza', description: 'All toppings', category: 'nonveg-pizza', isVeg: false, variants: ml(279, 379), supportsAddOns: true },

  // ── Burgers ──────────────────────────────────────────────────────────
  { id: 'aalu-patty-burger', name: 'Aalu Patty Burger', category: 'burgers', isVeg: true, variants: std(50) },
  { id: 'veggie-cheese-burger', name: 'Veggie Cheese Burger', category: 'burgers', isVeg: true, variants: std(60) },
  { id: 'mushroom-cheese-burger', name: 'Mushroom Cheese Burger', category: 'burgers', isVeg: true, variants: std(70) },
  { id: 'crunchy-cheese-burger', name: 'Crunchy Cheese Burger', category: 'burgers', isVeg: true, variants: std(90) },
  { id: 'chicken-burger', name: 'Chicken Burger', category: 'burgers', isVeg: false, variants: std(100) },
  { id: 'crunchy-chicken-burger', name: 'Crunchy Chicken Burger', category: 'burgers', isVeg: false, variants: std(110) },

  // ── Burger Combos (burger + coke + fries) ────────────────────────────
  { id: 'burger-combo', name: 'Burger Combo', description: 'Burger + Coke + Fries', category: 'burger-combos', isVeg: true, variants: vegNonveg(109, 129) },
  { id: 'crunchy-burger-combo', name: 'Crunchy Burger Combo', description: 'Crunchy Burger + Coke + Fries', category: 'burger-combos', isVeg: true, variants: vegNonveg(140, 170) },

  // ── Pasta ────────────────────────────────────────────────────────────
  { id: 'arabita-pasta', name: 'Arabita Pasta', category: 'pasta', isVeg: true, variants: vegNonveg(99, 129) },
  { id: 'alfredo-pasta', name: 'Alfredo Pasta', category: 'pasta', isVeg: true, variants: vegNonveg(99, 129) },
  { id: 'makhni-pasta', name: 'Makhni Pasta', category: 'pasta', isVeg: true, variants: vegNonveg(129, 149) },
  { id: 'mix-sauce-pasta', name: 'Mix Sauce Pasta', category: 'pasta', isVeg: true, variants: vegNonveg(119, 149) },

  // ── Grilled Sandwiches ───────────────────────────────────────────────
  { id: 'veg-sandwich', name: 'Veg Sandwich', category: 'sandwiches', isVeg: true, variants: std(69) },
  { id: 'mushroom-cheese-sandwich', name: 'Mushroom Cheese Sandwich', category: 'sandwiches', isVeg: true, variants: std(80) },
  { id: 'chicken-makhnee-sandwich', name: 'Chicken Makhnee Sandwich', category: 'sandwiches', isVeg: false, variants: std(90) },
  { id: 'paneer-tikka-sandwich', name: 'Paneer Tikka Grilled Sandwich', category: 'sandwiches', isVeg: true, variants: std(90) },
  { id: 'chicken-tikka-sandwich', name: 'Chicken Tikka Grilled Sandwich', category: 'sandwiches', isVeg: false, variants: std(90) },
  { id: 'chicken-sandwich', name: 'Chicken Sandwich', category: 'sandwiches', isVeg: false, variants: std(100) },
  { id: 'jammu-masala-sandwich', name: 'Jammu Masala Sandwich', category: 'sandwiches', isVeg: true, variants: std(100) },
  { id: 'veg-spl-sandwich', name: 'Veg Spl. Sandwich', category: 'sandwiches', isVeg: true, variants: std(110) },
  { id: 'nonveg-spl-sandwich', name: 'Non-Veg Spl. Sandwich', category: 'sandwiches', isVeg: false, variants: std(120) },
  { id: 'magic-hand-masala-sandwich', name: 'Spl. Magic Hand Masala Sandwich', category: 'sandwiches', isVeg: true, variants: std(150) },

  // ── Noodles ──────────────────────────────────────────────────────────
  { id: 'noodles', name: 'Noodles', category: 'noodles', isVeg: true, variants: vegNonveg(90, 129) },
  { id: 'hakka-noodles', name: 'Hakka Noodles', category: 'noodles', isVeg: true, variants: vegNonveg(90, 129) },
  { id: 'chilli-garlic-noodles', name: 'Chilli Garlic Noodles', category: 'noodles', isVeg: true, variants: vegNonveg(109, 139) },

  // ── Rolls & Snacks ───────────────────────────────────────────────────
  { id: 'cheese-corn-roll', name: 'Cheese Corn Roll', category: 'rolls-snacks', isVeg: true, variants: std(120) },
  { id: 'peri-peri-cheese-balls', name: 'Peri Peri Cheese Balls', category: 'rolls-snacks', isVeg: true, variants: std(160) },
  { id: 'veg-spring-roll', name: 'Veg Spring Roll', category: 'rolls-snacks', isVeg: true, variants: std(89) },
  { id: 'chicken-spring-roll', name: 'Chicken Spring Roll', category: 'rolls-snacks', isVeg: false, variants: std(120) },

  // ── Fries ────────────────────────────────────────────────────────────
  { id: 'classic-fries', name: 'Classic Fries', category: 'fries', isVeg: true, variants: std(90) },
  { id: 'peri-peri-fries', name: 'Peri Peri Fries', category: 'fries', isVeg: true, variants: std(100) },
  { id: 'spl-cheese-fries', name: 'Spl. Cheese Fries', category: 'fries', isVeg: true, variants: std(129) },
  { id: 'baked-peri-peri-cheese-fries', name: 'Baked Peri Peri Cheese Fries', category: 'fries', isVeg: true, variants: std(139) },

  // ── Veg Snacks ───────────────────────────────────────────────────────
  { id: 'manchurian', name: 'Manchurian', category: 'veg-snacks', isVeg: true, variants: std(110) },
  { id: 'cheese-chilli', name: 'Cheese Chilli', category: 'veg-snacks', isVeg: true, variants: std(219) },
  { id: 'crispy-corn-salt-paper', name: 'Crispy Corn Salt & Pepper', category: 'veg-snacks', isVeg: true, variants: std(179) },
  { id: 'honey-chilli-potato', name: 'Honey Chilli Potato', category: 'veg-snacks', isVeg: true, variants: std(199) },
  { id: 'garlic-cheese', name: 'Garlic Cheese', category: 'veg-snacks', isVeg: true, variants: std(239) },

  // ── Non-Veg Snacks ───────────────────────────────────────────────────
  { id: 'chilli-chicken-boneless', name: 'Chilli Chicken (Boneless)', category: 'nonveg-snacks', isVeg: false, variants: std(229) },
  { id: 'chilli-chicken-with-bone', name: 'Chilli Chicken with Bone', category: 'nonveg-snacks', isVeg: false, variants: std(229) },
  { id: 'lemon-chicken', name: 'Lemon Chicken', category: 'nonveg-snacks', isVeg: false, variants: std(229) },
  { id: 'crispy-chicken-honey', name: 'Crispy Chicken Honey Sauce', category: 'nonveg-snacks', isVeg: false, variants: std(229) },
  { id: 'chicken-manchurian', name: 'Chicken Manchurian', category: 'nonveg-snacks', isVeg: false, variants: std(229) },
  { id: 'chicken-lollipop', name: 'Chicken Lollipop', category: 'nonveg-snacks', isVeg: false, variants: std(229) },

  // ── American Fry Chicken ─────────────────────────────────────────────
  { id: 'chicken-popcorn', name: 'Chicken Popcorn', category: 'fried-chicken', isVeg: false, variants: std(170) },
  { id: 'chicken-strips', name: 'Chicken Strips', category: 'fried-chicken', isVeg: false, variants: std(200) },
  { id: 'drumstick-chicken', name: 'Drumstick Chicken (4 pc)', category: 'fried-chicken', isVeg: false, variants: std(200) },
  {
    id: 'american-chicken',
    name: 'American Chicken',
    category: 'fried-chicken',
    isVeg: false,
    variants: [
      { id: 'half', label: 'Half', price: 180 },
      { id: 'full', label: 'Full', price: 350 },
    ],
  },
  { id: 'peri-peri-chicken-strips', name: 'Peri Peri Chicken Strips', category: 'fried-chicken', isVeg: false, variants: std(170) },
  { id: 'bbq-chicken-strips', name: 'BBQ Chicken Strips', category: 'fried-chicken', isVeg: false, variants: std(170) },
  { id: 'peri-peri-chicken-wings', name: 'Peri Peri Chicken Wings (6 pc)', category: 'fried-chicken', isVeg: false, variants: std(210) },
  { id: 'bbq-chicken-wings', name: 'BBQ Chicken Wings (6 pc)', category: 'fried-chicken', isVeg: false, variants: std(210) },

  // ── Wraps ────────────────────────────────────────────────────────────
  { id: 'wrap', name: 'Wrap', category: 'wraps', isVeg: true, variants: vegNonveg(90, 109) },

  // ── Shakes ───────────────────────────────────────────────────────────
  { id: 'vanilla-shake', name: 'Vanilla Shake', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'pineapple-shake', name: 'Pineapple Shake', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'strawberry-shake', name: 'Strawberry Shake', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'blueberry-shake', name: 'Blueberry Shake', category: 'shakes', isVeg: true, variants: std(90) },
  { id: 'chocolate-shake', name: 'Chocolate Shake', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'oreo-shake', name: 'Oreo Shake', category: 'shakes', isVeg: true, variants: std(80) },
  { id: 'kitkat-shake', name: 'Kit Kat Shake', category: 'shakes', isVeg: true, variants: std(90) },
  { id: 'mango-shake', name: 'Mango Shake', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'cold-coffee', name: 'Cold Coffee', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'butterscotch-shake', name: 'Butter Scotch Shake', category: 'shakes', isVeg: true, variants: std(70) },
  { id: 'black-currant-shake', name: 'Black Currant Shake', category: 'shakes', isVeg: true, variants: std(90) },

  // ── Cold Drinks ──────────────────────────────────────────────────────
  { id: 'mineral-water', name: 'Mineral Water', category: 'cold-drinks', isVeg: true, variants: std(20) },
  { id: 'coke-750', name: 'Coke 750 ml', category: 'cold-drinks', isVeg: true, variants: std(40) },
  { id: 'thumbs-up-750', name: 'Thums Up 750 ml', category: 'cold-drinks', isVeg: true, variants: std(40) },
  { id: 'sprite-750', name: 'Sprite 750 ml', category: 'cold-drinks', isVeg: true, variants: std(40) },
  { id: 'mazza-600', name: 'Maaza 600 ml', category: 'cold-drinks', isVeg: true, variants: std(40) },
]

const byId = new Map(MENU.map((item) => [item.id, item]))

export function getMenuItem(id: string): MenuItem | undefined {
  return byId.get(id)
}

export function itemsInCategory(category: string): MenuItem[] {
  return MENU.filter((item) => item.category === category)
}

/** An item counts as veg/non-veg if any of its variants matches. */
export function matchesVegFilter(item: MenuItem, filter: 'all' | 'veg' | 'nonveg'): boolean {
  if (filter === 'all') return true
  const wantVeg = filter === 'veg'
  return item.variants.some((v) => (v.isVeg ?? item.isVeg) === wantVeg)
}

export function minPrice(item: MenuItem): number {
  return Math.min(...item.variants.map((v) => v.price))
}
