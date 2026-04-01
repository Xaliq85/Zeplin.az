import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import { ShoppingCart, Users, Truck, TrendingUp, Clock } from 'lucide-react'
import type { Order, OrderStatus } from '../../types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Gözləyir',
  confirmed: 'Təsdiqləndi',
  preparing: 'Hazırlanır',
  ready: 'Hazırdır',
  in_delivery: 'Yoldadır',
  delivered: 'Çatdırıldı',
  picked_up: 'Götürüldü',
  cancelled: 'Ləğv edildi',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-blue-500/10 text-blue-400',
  preparing: 'bg-purple-500/10 text-purple-400',
  ready: 'bg-green-500/10 text-green-400',
  in_delivery: 'bg-orange-500/10 text-orange-400',
  delivered: 'bg-green-600/10 text-green-500',
  picked_up: 'bg-green-600/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-400',
}

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 font-chakra tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center text-gold">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-chakra font-bold text-gold">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/api/orders/').then(r => r.data),
  })

  const { data: sellersData } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => api.get('/api/auth/sellers/').then(r => r.data),
  })

  const orders: Order[] = ordersData?.results || ordersData || []
  const sellers = sellersData?.results || sellersData || []

  const todayOrders = orders.filter((o: Order) =>
    new Date(o.created_at).toDateString() === new Date().toDateString()
  )
  const activeOrders = orders.filter((o: Order) =>
    !['delivered', 'picked_up', 'cancelled'].includes(o.status)
  )
  const deliveryOrders = orders.filter((o: Order) => o.type === 'delivery')
  const pickupOrders = orders.filter((o: Order) => o.type === 'pickup')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-chakra text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2 text-xs text-white/30 font-chakra">
          <Clock size={14} />
          {new Date().toLocaleDateString('az', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="ÜMUMİ SİFARİŞ" value={orders.length} icon={<ShoppingCart size={18} />} sub={`Bu gün: ${todayOrders.length}`} />
        <StatCard label="AKTİV SİFARİŞ" value={activeOrders.length} icon={<TrendingUp size={18} />} />
        <StatCard label="SATIÇILAR" value={sellers.length} icon={<Users size={18} />} />
        <StatCard label="ÇATDIRILMA" value={deliveryOrders.length} icon={<Truck size={18} />} sub={`Pickup: ${pickupOrders.length}`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <h2 className="font-chakra font-bold mb-4">Son sifarişlər</h2>
          <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
                  <th className="text-left p-4">KOD</th>
                  <th className="text-left p-4">MÜŞTƏRİ</th>
                  <th className="text-left p-4">NÖV</th>
                  <th className="text-left p-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order: Order) => (
                  <tr key={order.id} className="border-b border-blue-zep/10 hover:bg-white/2 transition">
                    <td className="p-4 font-chakra text-gold text-xs">{order.tracking_code}</td>
                    <td className="p-4 text-white/70 text-xs">{order.customer_name}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-chakra ${order.type === 'delivery' ? 'bg-blue-zep/20 text-blue-light' : 'bg-gold/10 text-gold'}`}>
                        {order.type === 'delivery' ? 'Çatdırılma' : 'Pickup'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-chakra ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10 text-white/20 text-xs">Sifariş yoxdur</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-chakra font-bold mb-4">Status bölgüsü</h2>
          <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5 space-y-3">
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(status => {
              const count = orders.filter((o: Order) => o.status === status).length
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`px-2 py-0.5 rounded font-chakra ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
                    <span className="text-white/40">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gold/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
