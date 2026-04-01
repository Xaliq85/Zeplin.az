import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import { Package, ShoppingCart, TrendingUp } from 'lucide-react'

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
        {icon}
      </div>
      <div>
        <p className="text-white/40 text-xs font-chakra tracking-wider">{label}</p>
        <p className="text-2xl font-chakra font-bold text-gold">{value}</p>
      </div>
    </div>
  )
}

export default function SellerDashboard() {
  const { data: orders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => api.get('/api/orders/').then(r => r.data),
  })

  const { data: products } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get('/api/products/').then(r => r.data),
  })

  const total = orders?.results?.length || 0
  const pending = orders?.results?.filter((o: any) => o.status === 'pending').length || 0

  return (
    <div>
      <h1 className="font-chakra text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="ÜMUMİ SİFARİŞ" value={total} icon={<ShoppingCart size={22} />} />
        <StatCard label="GÖZLƏYİR" value={pending} icon={<TrendingUp size={22} />} />
        <StatCard label="MƏHSULLAR" value={products?.results?.length || 0} icon={<Package size={22} />} />
        <StatCard label="ANBARDA" value={products?.results?.reduce((a: number, p: any) => a + p.quantity, 0) || 0} icon={<Package size={22} />} />
      </div>

      <h2 className="font-chakra text-lg font-bold mb-4">Son sifarişlər</h2>
      <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
              <th className="text-left p-4">KOD</th>
              <th className="text-left p-4">MÜŞTƏRİ</th>
              <th className="text-left p-4">NÖV</th>
              <th className="text-left p-4">STATUS</th>
              <th className="text-left p-4">TARİX</th>
            </tr>
          </thead>
          <tbody>
            {orders?.results?.slice(0, 10).map((order: any) => (
              <tr key={order.id} className="border-b border-blue-zep/10 hover:bg-white/2">
                <td className="p-4 font-chakra text-gold text-xs">{order.tracking_code}</td>
                <td className="p-4 text-white/70">{order.customer_name}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded font-chakra ${order.type === 'delivery' ? 'bg-blue-zep/20 text-blue-light' : 'bg-gold/10 text-gold'}`}>
                    {order.type === 'delivery' ? 'Çatdırılma' : 'Pickup'}
                  </span>
                </td>
                <td className="p-4 text-white/50 text-xs">{order.status}</td>
                <td className="p-4 text-white/30 text-xs">{new Date(order.created_at).toLocaleDateString('az')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
