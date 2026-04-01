import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Order, OrderStatus } from '../../types'
import { CheckCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const WAREHOUSE_FLOW: OrderStatus[] = ['confirmed', 'preparing', 'ready']

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: 'preparing',
  preparing: 'ready',
}

export default function WarehouseOrders() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-orders'],
    queryFn: () => api.get('/api/orders/').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.patch(`/api/orders/${id}/`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouse-orders'] })
      toast.success('Status yeniləndi')
    },
  })

  const orders: Order[] = (data?.results || data || []).filter((o: Order) =>
    WAREHOUSE_FLOW.includes(o.status)
  )

  const columns = WAREHOUSE_FLOW.map(status => ({
    status,
    label: status === 'confirmed' ? 'Gözləyir' : status === 'preparing' ? 'Hazırlanır' : 'Hazırdır',
    orders: orders.filter((o: Order) => o.status === status),
  }))

  return (
    <div>
      <h1 className="font-chakra text-2xl font-bold mb-6">Anbar sifarişləri</h1>
      {isLoading ? (
        <div className="text-white/30 text-center py-20">Yüklənir...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {columns.map(col => (
            <div key={col.status} className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-chakra font-bold text-sm tracking-wider">{col.label.toUpperCase()}</h2>
                <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-chakra flex items-center justify-center">
                  {col.orders.length}
                </span>
              </div>
              <div className="space-y-3">
                {col.orders.map((order: Order) => (
                  <div key={order.id} className="bg-navy border border-blue-zep/10 rounded-lg p-3 hover:border-blue-zep/25 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-chakra font-bold text-gold">{order.tracking_code}</p>
                        <p className="text-xs text-white/60 mt-0.5">{order.customer_name}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-chakra ${order.type === 'delivery' ? 'bg-blue-zep/20 text-blue-light' : 'bg-gold/10 text-gold'}`}>
                        {order.type === 'delivery' ? '🚚' : '📍'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/30 mb-3">
                      <Package size={11} />
                      {order.items?.length || 0} məhsul
                    </div>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => updateMutation.mutate({ id: order.id, status: NEXT_STATUS[order.status]! })}
                        disabled={updateMutation.isPending}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-gold/10 text-gold text-xs font-chakra hover:bg-gold/20 transition"
                      >
                        <CheckCircle size={12} />
                        {NEXT_STATUS[order.status] === 'preparing' ? 'Hazırla' : 'Hazırdır'}
                      </button>
                    )}
                  </div>
                ))}
                {col.orders.length === 0 && (
                  <p className="text-center text-white/20 text-xs py-6">Boşdur</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
