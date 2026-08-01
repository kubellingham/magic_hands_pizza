import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CartProvider } from './cart/CartContext'
import { OfflineBanner } from './components/OfflineBanner'
import { useShift } from './lib/shift'
import { Home } from './pages/Home'
import { Menu } from './pages/Menu'
import { ItemDetail } from './pages/ItemDetail'
import { Cart } from './pages/Cart'
import { Details } from './pages/Details'
import { OrderPlaced } from './pages/OrderPlaced'
import { Track } from './pages/Track'
import { Orders } from './pages/Orders'
import { About } from './pages/About'
import { Diag } from './pages/Diag'

const Admin = lazy(() => import('./pages/admin/Admin'))

export default function App() {
  // Sets data-shift on <html> so the day/night tokens flip at 7 PM
  useShift()

  return (
    <CartProvider>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={<div className="flex min-h-dvh items-center justify-center bg-bg text-mut">Loading…</div>}
            >
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <div className="mx-auto min-h-dvh max-w-md bg-bg">
              <OfflineBanner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/details" element={<Details />} />
                <Route path="/profile" element={<Details />} />
                <Route path="/order-placed" element={<OrderPlaced />} />
                <Route path="/track/:code" element={<Track />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/about" element={<About />} />
                <Route path="/diag" element={<Diag />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </CartProvider>
  )
}
