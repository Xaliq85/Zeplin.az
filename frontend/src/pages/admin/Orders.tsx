import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Order, OrderStatus } from '../../types'
import { Search, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function AdminOrders() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders-list'],
    queryFn: () => api.get('/api/orders/').then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.patch(`/api/orders/${id}/`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders-list'] })
      toast.success('Status yeniləndi')
    },
  })

  const allOrders: Order[] = data?.results || data || []
  const orders = allOrders.filter(o =>
    (filterStatus === 'all' || o.status === filterStatus) &&
    (o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.tracking_code.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <h1 className="font-chakra text-2xl font-bold mb-6">Bütün sifarişlər</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ad və ya kod ilə axtar..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="appearance-none pl-4 pr-8 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm focus:outline-none focus:border-gold/40 transition"
          >
            <option value="all">Bütün statuslar</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
              <th className="text-left p-4">KOD</th>
              <th className="text-left p-4">MÜŞTƏRİ</th>
              <th className="text-left p-4">NÖV</th>
              <th className="text-left p-4">STATUS</th>
              <th className="text-left p-4">STATUS DEYİŞ</th>
              <th className="text-left p-4">TARİX</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-white/30">Yüklənir...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-white/20 text-xs">Sifariş tapılmadı</td></tr>
            ) : orders.map((order: Order) => (
              <tr key={order.id} className="border-b border-blue-zep/10 hover:bg-white/2 transition">
                <td className="p-4 font-chakra text-gold text-xs font-bold">{order.tracking_code}</td>
                <td className="p-4">
                  <p className="text-white/80">{order.customer_name}</p>
                  <p className="text-xs text-white/30">{order.customer_phone}</p>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded font-chakra ${order.type === 'delivery' ? 'bg-blue-zep/20 text-blue-light' : 'bg-gold/10 text-gold'}`}>
                    {order.type === 'delivery' ? '🚚 Çatdırılma' : '📍 Pickup'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded font-chakra ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value as OrderStatus })}
                      className="appearance-none text-xs pl-2 pr-6 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/40 transition"
                    >
                      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </td>
                <td className="p-4 text-white/30 text-xs">
                  {new Date(order.created_at).toLocaleDateString('az')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
