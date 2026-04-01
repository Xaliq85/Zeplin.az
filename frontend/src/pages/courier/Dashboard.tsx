import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Order } from '../../types'
import { CheckCircle, Truck, Clock, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourierDashboard() {
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['courier-all-orders'],
    queryFn: () => api.get('/api/orders/').then(r => r.data),
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/api/orders/${id}/`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courier-all-orders'] })
      toast.success('Status yeniləndi')
    },
  })

  const allOrders: Order[] = data?.results || data || []
  const active = allOrders.filter(o => ['ready', 'in_delivery'].includes(o.status) && o.type === 'delivery')
  const todayDone = allOrders.filter(o =>
    o.status === 'delivered' &&
    new Date(o.created_at).toDateString() === new Date().toDateString()
  )

  return (
    <div>
      <h1 className="font-chakra text-2xl font-bold mb-6">Kuryer paneli</h1>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5 text-center">
          <p className="text-3xl font-chakra font-bold text-gold">{active.length}</p>
          <p className="text-xs text-white/40 font-chakra tracking-wider mt-1">AKTİV SİFARİŞ</p>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5 text-center">
          <p className="text-3xl font-chakra font-bold text-green-400">{todayDone.length}</p>
          <p className="text-xs text-white/40 font-chakra tracking-wider mt-1">BU GÜN TƏSLİM</p>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5 text-center">
          <p className="text-3xl font-chakra font-bold text-blue-light">
            {allOrders.filter(o => o.status === 'delivered').length}
          </p>
          <p className="text-xs text-white/40 font-chakra tracking-wider mt-1">CƏMİ TƏSLİM</p>
        </div>
      </div>

      {/* Aktiv sifarişlər */}
      <h2 className="font-chakra font-bold mb-4">
        Aktiv sifarişlər
        {active.length > 0 && (
          <span className="ml-2 text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">{active.length}</span>
        )}
      </h2>

      {active.length === 0 ? (
        <div className="text-center py-16 bg-[#0f2448] border border-blue-zep/15 rounded-xl">
          <Truck size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 font-chakra text-sm">Hazırda aktiv çatdırılma yoxdur</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((order: Order) => (
            <div key={order.id} className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-chakra font-bold text-gold">{order.tracking_code}</span>
                  <p className="text-white font-medium mt-0.5">{order.customer_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-chakra ${
                  order.status === 'ready'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-orange-500/10 text-orange-400'
                }`}>
                  {order.status === 'ready' ? '📦 Hazırdır' : '🚚 Yoldadır'}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Phone size={13} className="text-white/30 shrink-0" />
                  {order.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin size={13} className="text-white/30 shrink-0" />
                  {order.customer_address || 'Ünvan qeyd edilməyib'}
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateMutation.mutate({ id: order.id, status: 'in_delivery' })}
                    disabled={updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-zep/20 text-blue-light text-sm font-chakra hover:bg-blue-zep/30 transition"
                  >
                    <Truck size={14} /> Götürdüm
                  </button>
                )}
                {order.status === 'in_delivery' && (
                  <button
                    onClick={() => updateMutation.mutate({ id: order.id, status: 'delivered' })}
                    disabled={updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/10 text-green-400 text-sm font-chakra hover:bg-green-500/20 transition"
                  >
                    <CheckCircle size={14} /> Çatdırdım
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bu günün tamamlananları */}
      {todayDone.length > 0 && (
        <>
          <h2 className="font-chakra font-bold mb-4 mt-8 flex items-center gap-2">
            <Clock size={16} className="text-white/30" />
            Bu gün tamamlananlar
          </h2>
          <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {todayDone.map((order: Order) => (
                  <tr key={order.id} className="border-b border-blue-zep/10 last:border-0">
                    <td className="p-3 font-chakra text-gold text-xs">{order.tracking_code}</td>
                    <td className="p-3 text-white/60">{order.customer_name}</td>
                    <td className="p-3 text-right">
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded font-chakra">
                        ✓ Çatdırıldı
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
