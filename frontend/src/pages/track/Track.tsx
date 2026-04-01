import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import type { OrderStatus } from '../../types'
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'

const STEPS: { status: OrderStatus[]; label: string; icon: React.ReactNode }[] = [
  { status: ['pending', 'confirmed'], label: 'Sifariş alındı', icon: <Clock size={20} /> },
  { status: ['preparing'], label: 'Hazırlanır', icon: <Package size={20} /> },
  { status: ['ready'], label: 'Hazırdır', icon: <CheckCircle size={20} /> },
  { status: ['in_delivery'], label: 'Yoldadır', icon: <Truck size={20} /> },
  { status: ['delivered', 'picked_up'], label: 'Tamamlandı', icon: <CheckCircle size={20} /> },
]


function getStepIndex(status: OrderStatus) {
  return STEPS.findIndex(s => s.status.includes(status))
}

export default function Track() {
  const { code } = useParams<{ code: string }>()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['track', code],
    queryFn: () => api.get(`/api/orders/track/${code}/`).then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-[#0b1c38] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-chakra text-2xl font-bold">
            ZEPLIN<span className="text-gold">.az</span>
          </h1>
          <p className="text-white/30 text-sm font-chakra tracking-widest mt-1">SİFARİŞ İZLƏMƏ</p>
        </div>

        {isLoading && (
          <div className="text-center text-white/30 py-10">Yüklənir...</div>
        )}

        {isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <XCircle className="text-red-400 mx-auto mb-3" size={32} />
            <p className="font-chakra text-red-400">Sifariş tapılmadı</p>
            <p className="text-white/30 text-sm mt-1">{code}</p>
          </div>
        )}

        {order && (
          <div className="bg-[#0f2448] border border-blue-zep/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-zep/15">
              <div>
                <p className="text-xs text-white/30 font-chakra tracking-wider">SİFARİŞ KODU</p>
                <p className="font-chakra font-bold text-gold text-lg mt-0.5">{order.tracking_code}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/30 font-chakra tracking-wider">NÖV</p>
                <span className={`text-xs px-2 py-1 rounded font-chakra mt-0.5 inline-block ${order.type === 'delivery' ? 'bg-blue-zep/20 text-blue-light' : 'bg-gold/10 text-gold'}`}>
                  {order.type === 'delivery' ? '🚚 Çatdırılma' : '📍 Pickup'}
                </span>
              </div>
            </div>

            {order.status === 'cancelled' ? (
              <div className="text-center py-6">
                <XCircle className="text-red-400 mx-auto mb-3" size={40} />
                <p className="font-chakra text-red-400 font-bold">Sifariş ləğv edildi</p>
              </div>
            ) : (
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const currentStep = getStepIndex(order.status)
                  const isDone = i < currentStep
                  const isActive = i === currentStep
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                          isDone ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          isActive ? 'bg-gold/20 text-gold border border-gold/40' :
                          'bg-white/5 text-white/20 border border-white/10'
                        }`}>
                          {step.icon}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-0.5 h-8 my-1 ${isDone ? 'bg-green-500/30' : 'bg-white/5'}`} />
                        )}
                      </div>
                      <div className="pt-2.5">
                        <p className={`text-sm font-chakra font-bold ${
                          isActive ? 'text-gold' : isDone ? 'text-white/60' : 'text-white/20'
                        }`}>
                          {step.label}
                          {isActive && <span className="ml-2 text-xs animate-pulse">●</span>}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-blue-zep/15 text-xs text-white/20 font-chakra text-center">
              {new Date(order.created_at).toLocaleDateString('az', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
