import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Order } from '../../types'
import { CheckCircle, MapPin, Phone, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourierOrders() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['courier-orders'],
    queryFn: () => api.get('/api/orders/').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/api/orders/${id}/`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courier-orders'] })
      toast.success('Çatdırılma təsdiqləndi')
    },
  })

  const orders: Order[] = (data?.results || data || []).filter((o: Order) =>
    o.type === 'delivery' && ['ready', 'in_delivery'].includes(o.status)
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Truck className="text-gold" size={24} />
        <h1 className="font-chakra text-2xl font-bold">Çatdırılma siyahısı</h1>
        <span className="ml-auto text-xs bg-gold/10 text-gold px-3 py-1.5 rounded-full font-chakra">
          {orders.length} aktiv
        </span>
      </div>

      {isLoading ? (
        <div className="text-white/30 text-center py-20">Yüklənir...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Truck size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-chakra">Aktiv çatdırılma yoxdur</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <div key={order.id} className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5 hover:border-blue-zep/30 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-chakra font-bold text-gold text-sm">{order.tracking_code}</p>
                  <p className="text-white font-medium mt-1">{order.customer_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-chakra ${order.status === 'ready' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  {order.status === 'ready' ? 'Hazırdır' : 'Yoldadır'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Phone size={14} className="text-white/30" />
                  {order.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <MapPin size={14} className="text-white/30" />
                  {order.customer_address || 'Ünvan qeyd edilməyib'}
                </div>
              </div>
              {order.status === 'ready' && (
                <button
                  onClick={() => updateMutation.mutate({ id: order.id, status: 'in_delivery' })}
                  className="w-full py-2 rounded-lg bg-blue-zep/20 text-blue-light text-sm font-chakra hover:bg-blue-zep/30 transition flex items-center justify-center gap-2"
                >
                  <Truck size={14} /> Götürdüm — yola çıxıram
                </button>
              )}
              {order.status === 'in_delivery' && (
                <button
                  onClick={() => updateMutation.mutate({ id: order.id, status: 'delivered' })}
                  className="w-full py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-chakra hover:bg-green-500/20 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} /> Çatdırdım — təsdiqlə
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
