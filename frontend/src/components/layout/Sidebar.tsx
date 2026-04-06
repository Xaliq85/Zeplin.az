import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import type { Role } from '../../types'
import {
  LayoutDashboard, Package, ShoppingCart,
  Truck, MapPin, BarChart2, Settings, LogOut, Archive
} from 'lucide-react'

const menuByRole: Record<Role, { label: string; icon: React.ReactNode; to: string }[]> = {
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/admin' },
    { label: 'Sifarişlər', icon: <ShoppingCart size={18} />, to: '/admin/orders' },
    { label: 'Satıcılar', icon: <Package size={18} />, to: '/admin/sellers' },
    { label: 'Kuryerlər', icon: <Truck size={18} />, to: '/admin/couriers' },
    { label: 'Pickup nöqtələri', icon: <MapPin size={18} />, to: '/admin/pickups' },
    { label: 'Anbar', icon: <Archive size={18} />, to: '/admin/warehouse' },
    { label: 'Hesabatlar', icon: <BarChart2 size={18} />, to: '/admin/reports' },
    { label: 'Ayarlar', icon: <Settings size={18} />, to: '/admin/settings' },
  ],
  seller: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/seller' },
    { label: 'Məhsullar', icon: <Package size={18} />, to: '/seller/products' },
    { label: 'Sifarişlər', icon: <ShoppingCart size={18} />, to: '/seller/orders' },
    { label: 'Anbar', icon: <MapPin size={18} />, to: '/seller/warehouse' },
    { label: 'Hesabat', icon: <BarChart2 size={18} />, to: '/seller/reports' },
  ],
  warehouse: [
    { label: 'Sifarişlər', icon: <ShoppingCart size={18} />, to: '/warehouse' },
    { label: 'Anbar', icon: <Package size={18} />, to: '/warehouse/inventory' },
  ],
  courier: [
    { label: 'Marşrut', icon: <Truck size={18} />, to: '/courier' },
    { label: 'Sifarişlər', icon: <ShoppingCart size={18} />, to: '/courier/orders' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  if (!user) return null

  const menu = menuByRole[user.role]

  return (
    <aside className="w-64 min-h-screen bg-[#0f2448] border-r border-blue-zep/15 flex flex-col">
      <div className="p-6 border-b border-blue-zep/15">
        <span className="font-chakra text-xl font-bold tracking-widest">
          ZEPLIN<span className="text-gold">.az</span>
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-chakra tracking-wide transition ${
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-zep/15">
        <div className="text-xs text-white/30 font-chakra tracking-wider mb-3">
          {user.first_name} {user.last_name}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-red-400 transition"
        >
          <LogOut size={16} />
          Çıxış
        </button>
      </div>
    </aside>
  )
}
