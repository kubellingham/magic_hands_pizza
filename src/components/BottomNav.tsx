import { NavLink } from 'react-router-dom'
import { useCart } from '../cart/CartContext'

const tabs = [
  { to: '/', label: 'Home', emoji: '🏠' },
  { to: '/menu', label: 'Menu', emoji: '📋' },
  { to: '/cart', label: 'Cart', emoji: '🛒' },
  { to: '/about', label: 'About', emoji: '📍' },
]

export function BottomNav() {
  const { count } = useCart()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-cream-dark bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-xl">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? 'text-brand' : 'text-ink/60'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.emoji}</span>
            {tab.label}
            {tab.to === '/cart' && count > 0 && (
              <span className="absolute top-0.5 right-1/4 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
