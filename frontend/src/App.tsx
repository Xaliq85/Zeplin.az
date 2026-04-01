import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './store/auth'
import api from './api/client'
import Landing from './pages/landing/Landing'
import Login from './pages/auth/Login'
import PanelLayout from './components/layout/PanelLayout'
import SellerDashboard from './pages/seller/Dashboard'
import SellerProducts from './pages/seller/Products'
import SellerOrders from './pages/seller/Orders'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminSellers from './pages/admin/Sellers'
import AdminCouriers from './pages/admin/Couriers'
import WarehouseOrders from './pages/warehouse/Orders'
import WarehouseInventory from './pages/warehouse/Inventory'
import CourierDashboard from './pages/courier/Dashboard'
import CourierOrders from './pages/courier/Orders'
import Track from './pages/track/Track'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AuthBootstrap() {
  const { isAuthenticated, user, setUser } = useAuthStore()
  useEffect(() => {
    if (isAuthenticated && !user) {
      api.get('/api/auth/me/').then(r => setUser(r.data)).catch(() => {})
    }
  }, [isAuthenticated, user, setUser])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/track/:code" element={<Track />} />

          <Route path="/seller" element={<PrivateRoute><PanelLayout /></PrivateRoute>}>
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="warehouse" element={<div className="text-white/40 p-8 font-chakra">Anbar vəziyyəti — tezliklə</div>} />
            <Route path="reports" element={<div className="text-white/40 p-8 font-chakra">Hesabatlar — tezliklə</div>} />
          </Route>

          <Route path="/admin" element={<PrivateRoute><PanelLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="couriers" element={<AdminCouriers />} />
            <Route path="pickups" element={<div className="text-white/40 p-8 font-chakra">Pickup nöqtələri — tezliklə</div>} />
            <Route path="reports" element={<div className="text-white/40 p-8 font-chakra">Hesabatlar — tezliklə</div>} />
            <Route path="settings" element={<div className="text-white/40 p-8 font-chakra">Ayarlar — tezliklə</div>} />
          </Route>

          <Route path="/warehouse" element={<PrivateRoute><PanelLayout /></PrivateRoute>}>
            <Route index element={<WarehouseOrders />} />
            <Route path="inventory" element={<WarehouseInventory />} />
          </Route>

          <Route path="/courier" element={<PrivateRoute><PanelLayout /></PrivateRoute>}>
            <Route index element={<CourierDashboard />} />
            <Route path="orders" element={<CourierOrders />} />
          </Route>

          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f2448', color: '#fff', border: '1px solid rgba(90,156,216,0.2)' } }} />
    </QueryClientProvider>
  )
}
