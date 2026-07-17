import { Route, Routes } from 'react-router-dom'
import { CartProvider } from './cart/CartContext'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { OfflineBanner } from './components/OfflineBanner'
import { Home } from './pages/Home'
import { Menu } from './pages/Menu'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { OrderPlaced } from './pages/OrderPlaced'
import { About } from './pages/About'

export default function App() {
  return (
    <CartProvider>
      <div className="mx-auto min-h-dvh max-w-xl pb-16">
        <Header />
        <OfflineBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-placed" element={<OrderPlaced />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <BottomNav />
      </div>
    </CartProvider>
  )
}
