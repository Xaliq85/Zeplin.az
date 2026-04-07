import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Order, OrderStatus } from '../../types'
import { CheckCircle, Package, ScanLine, X } from 'lucide-react'
import toast from 'react-hot-toast'

const WAREHOUSE_FLOW: OrderStatus[] = ['confirmed', 'preparing', 'ready']

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: 'preparing',
  preparing: 'ready',
}

type ScanResult = {
  label_code: string
  seller: string
  tracking_code: string
  status: string
  customer_name: string
  customer_phone: string
  items: { product: string; sku: string; quantity: number; price: string }[]
}

function ScanPanel() {
  const qc = useQueryClient()
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const lookup = async (val: string) => {
    const cleaned = val.toUpperCase().trim()
    if (!cleaned) return
    setError('')
    setResult(null)
    try {
      const r = await api.get(`/api/warehouse/scan/${cleaned}/`)
      setResult(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Stiker tapılmadı')
    }
  }

  const accept = async () => {
    if (!result) return
    setAccepting(true)
    try {
      await api.post(`/api/warehouse/scan/${result.label_code}/`)
      toast.success(`#${result.tracking_code} qəbul edildi`)
      setResult(null)
      setCode('')
      qc.invalidateQueries({ queryKey: ['warehouse-orders'] })
      qc.invalidateQueries({ queryKey: ['warehouse-stock'] })
      qc.invalidateQueries({ queryKey: ['order-stats'] })
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Xəta baş verdi')
    } finally {
      setAccepting(false)
    }
  }

  useEffect(() => {
    if (!scanning) return
    let html5QrCode: any
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      html5QrCode = new Html5Qrcode('wh-scanner')
      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (text: string) => {
          const cleaned = text.toUpperCase().trim()
          setCode(cleaned)
          setScanning(false)
          html5QrCode.stop()
          lookup(cleaned)
        },
        () => {}
      ).catch(() => setScanning(false))
    })
    return () => { html5QrCode?.stop().catch(() => {}) }
  }, [scanning])

  return (
    <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-6 mb-6">
      <h2 className="font-chakra font-bold text-lg mb-4 flex items-center gap-2">
        <ScanLine size={20} className="text-gold" />
        Mal qəbulu
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setResult(null) }}
          onKeyDown={e => e.key === 'Enter' && lookup(code)}
          placeholder="ZEP-00001-00001 — yazın və ya skan edin"
          className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-gold transition placeholder-white/20"
        />
        <button
          onClick={() => setScanning(s => !s)}
          className={`px-4 rounded-lg border text-sm transition ${scanning ? 'bg-gold/20 border-gold text-gold' : 'border-white/10 text-white/40 hover:border-gold/40 hover:text-gold'}`}
          title="Kamera ilə skan et"
        >
          <ScanLine size={18} />
        </button>
        <button
          onClick={() => lookup(code)}
          disabled={!code}
          className="px-5 py-3 rounded-lg bg-gold text-navy font-chakra font-bold text-sm hover:bg-gold-light transition disabled:opacity-40"
        >
          AXTAR
        </button>
      </div>

      {scanning && (
        <div className="rounded-lg overflow-hidden border border-gold/30 mb-4">
          <div id="wh-scanner" className="w-full" />
          <p className="text-xs text-white/40 text-center py-2 font-chakra">Stikeri kameraya tutun</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <X size={16} /> {error}
        </div>
      )}

      {result && (
        <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-chakra font-bold text-white text-lg tracking-wider">{result.tracking_code}</p>
              <p className="text-xs text-white/40 font-mono">{result.label_code}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 font-chakra">
              {result.seller}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div>
              <p className="text-white/30 text-xs font-chakra tracking-wider">MÜŞTƏRİ</p>
              <p className="text-white mt-0.5">{result.customer_name}</p>
              <p className="text-white/40 text-xs">{result.customer_phone}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs font-chakra tracking-wider">MƏHSULLAR</p>
              {result.items.map((item, i) => (
                <p key={i} className="text-white mt-0.5 text-sm">
                  {item.product} <span className="text-white/40">x{item.quantity}</span>
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={accept}
            disabled={accepting}
            className="w-full py-3 rounded-lg bg-green-500 text-white font-chakra font-bold text-sm hover:bg-green-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            {accepting ? 'QƏBUL EDİLİR...' : 'MALI QƏBUL ET → STATUSu TƏSDİQLƏ'}
          </button>
        </div>
      )}
    </div>
  )
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

      <ScanPanel />

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
