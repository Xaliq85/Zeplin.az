import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Order, OrderStatus } from '../../types'
import { Plus, X, Search, ScanLine } from 'lucide-react'
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

function NewOrderModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: productsData } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get('/api/products/').then((r) => r.data),
  })
  const products = productsData?.results || productsData || []

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    type: 'delivery',
    note: '',
    label_code: '',
    items: [{ product: '', quantity: 1, price: '' }],
  })
  const [scanning, setScanning] = useState(false)
  const [labelError, setLabelError] = useState('')
  const scannerRef = useRef<any>(null)
  const scanDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scanning) return
    let html5QrCode: any
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      html5QrCode = new Html5Qrcode('label-scanner')
      scannerRef.current = html5QrCode
      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (text: string) => {
          setForm(f => ({ ...f, label_code: text.toUpperCase().trim() }))
          setScanning(false)
          html5QrCode.stop()
          toast.success('Stiker oxundu')
        },
        () => {}
      ).catch(() => setScanning(false))
    })
    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [scanning])

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/api/orders/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-orders'] })
      toast.success('Sifariş yaradıldı')
      onClose()
    },
    onError: () => toast.error('Xəta baş verdi'),
  })

  const addItem = () =>
    setForm({ ...form, items: [...form.items, { product: '', quantity: 1, price: '' }] })
  const removeItem = (i: number) =>
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i: number, key: string, val: string | number) => {
    const items = [...form.items]
    items[i] = { ...items[i], [key]: val }
    if (key === 'product') {
      const p = products.find((p: any) => p.id === +val)
      if (p) items[i].price = p.price
    }
    setForm({ ...form, items })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-[#0f2448] border border-blue-zep/20 rounded-2xl w-full max-w-xl my-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-chakra font-bold text-lg">Yeni sifariş</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">MÜŞTƏRİ ADI</label>
              <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition" />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">TELEFON</label>
              <input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">NÖV</label>
            <div className="flex gap-3 mt-1">
              {(['delivery', 'pickup'] as const).map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-chakra font-bold transition ${form.type === t ? 'bg-gold text-navy' : 'border border-white/10 text-white/50 hover:border-gold/40'}`}>
                  {t === 'delivery' ? '🚚 ÇATDIRILMA' : '📍 PICKUP'}
                </button>
              ))}
            </div>
          </div>
          {form.type === 'delivery' && (
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">ÜNVAN</label>
              <input value={form.customer_address} onChange={e => setForm({ ...form, customer_address: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition" />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/40 font-chakra tracking-wider">MƏHSULLAR</label>
              <button onClick={addItem} className="text-xs text-gold hover:text-gold-light transition flex items-center gap-1">
                <Plus size={12} /> Əlavə et
              </button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition">
                  <option value="">Məhsul seç</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={item.quantity} min={1} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                  className="w-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition" />
                <button onClick={() => removeItem(i)} className="text-white/30 hover:text-red-400 transition px-1">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          {/* Label code */}
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">STİKER KODU</label>
            <div className="flex gap-2 mt-1">
              <input
                value={form.label_code}
                onChange={e => { setForm({ ...form, label_code: e.target.value.toUpperCase() }); setLabelError('') }}
                placeholder="ZEP-00001-00001"
                className={`flex-1 px-3 py-2.5 rounded-lg bg-white/5 border text-white text-sm font-mono focus:outline-none transition ${labelError ? 'border-red-500' : 'border-white/10 focus:border-gold'}`}
              />
              <button
                type="button"
                onClick={() => setScanning(s => !s)}
                className={`px-3 py-2.5 rounded-lg border text-sm transition ${scanning ? 'bg-gold/20 border-gold text-gold' : 'border-white/10 text-white/40 hover:border-gold/40 hover:text-gold'}`}
                title="Kamera ilə skan et"
              >
                <ScanLine size={18} />
              </button>
            </div>
            {labelError && <p className="text-xs text-red-400 mt-1">{labelError}</p>}
            {!form.label_code && <p className="text-xs text-white/20 mt-1">İstəyə bağlıdır — stikeri yapışdırıbsanız daxil edin</p>}
          </div>

          {/* Barcode scanner */}
          {scanning && (
            <div className="rounded-lg overflow-hidden border border-gold/30">
              <div ref={scanDivRef} id="label-scanner" className="w-full" />
              <p className="text-xs text-white/40 text-center py-2 font-chakra">Stikeri kameraya tutun</p>
            </div>
          )}

          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">QEYD</label>
            <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-chakra hover:border-white/20 transition">
            LƏĞV ET
          </button>
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-lg bg-gold text-navy text-sm font-chakra font-bold hover:bg-gold-light transition disabled:opacity-50">
            {mutation.isPending ? 'YARADILIR...' : 'YARAT →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SellerOrders() {
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => api.get('/api/orders/').then((r) => r.data),
  })

  const orders: Order[] = (data?.results || data || []).filter((o: Order) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.tracking_code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-chakra text-2xl font-bold">Sifarişlər</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-navy rounded-lg font-chakra font-bold text-sm hover:bg-gold-light transition">
          <Plus size={16} /> YENİ SİFARİŞ
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Ad və ya kod ilə axtar..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition" />
      </div>

      <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
              <th className="text-left p-4">İZLƏMƏ / STİKER</th>
              <th className="text-left p-4">MÜŞTƏRİ</th>
              <th className="text-left p-4">NÖV</th>
              <th className="text-left p-4">STATUS</th>
              <th className="text-left p-4">TARİX</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-white/30">Yüklənir...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-white/30">Sifariş tapılmadı</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-b border-blue-zep/10 hover:bg-white/2 transition">
                <td className="p-4">
                  <p className="font-chakra text-gold font-bold text-sm tracking-wider">{order.tracking_code}</p>
                  {(order as any).label_code && (
                    <p className="text-xs text-white/30 font-mono mt-0.5">{(order as any).label_code}</p>
                  )}
                </td>
                <td className="p-4">
                  <p className="text-white/80">{order.customer_name}</p>
                  <p className="text-xs text-white/30">{order.customer_phone}</p>
                </td>
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
                <td className="p-4 text-white/30 text-xs">
                  {new Date(order.created_at).toLocaleDateString('az')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <NewOrderModal onClose={() => setModal(false)} />}
    </div>
  )
}
