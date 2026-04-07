import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import { Package, Search, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

type StockProduct = {
  id: number
  name: string
  sku: string
  seller_name: string
  quantity: number
  shelf_location: string
}

type Movement = {
  id: number
  product_name: string
  product_sku: string
  direction: 'in' | 'out'
  reason: string
  quantity: number
  note: string
  created_by_name: string
  created_at: string
}

const REASON_LABELS: Record<string, string> = {
  seller_delivery: 'Satıcı təhvil verdi',
  order_shipped:   'Sifariş göndərildi',
  return:          'Geri qaytarma',
  adjustment:      'Düzəliş',
  damage:          'Zədə / itki',
}

export default function SellerWarehouse() {
  const [search, setSearch] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const { data: stockData, isLoading } = useQuery({
    queryKey: ['seller-stock', search],
    queryFn: () => api.get(`/api/warehouse/stock/${search ? `?q=${search}` : ''}`).then(r => r.data),
  })

  const { data: movementsData } = useQuery({
    queryKey: ['seller-movements'],
    queryFn: () => api.get('/api/warehouse/stock/movements/').then(r => r.data),
    enabled: showHistory,
  })

  const products: StockProduct[] = stockData?.results ?? stockData ?? []
  const movements: Movement[] = movementsData?.results ?? movementsData ?? []

  const totalQty  = products.reduce((s, p) => s + p.quantity, 0)
  const lowStock  = products.filter(p => p.quantity > 0 && p.quantity <= 3).length
  const outOfStock = products.filter(p => p.quantity === 0).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-chakra text-2xl font-bold">Anbar stoku</h1>
          <p className="text-white/30 text-sm mt-1">Mallarınızın hazırkı stok vəziyyəti</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-chakra transition ${
            showHistory
              ? 'bg-blue-zep/20 border-blue-light/30 text-blue-light'
              : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
          }`}
        >
          TARİXÇƏ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">CƏMİ STOK</p>
            <p className="text-2xl font-chakra font-bold text-gold">{totalQty}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">AZ STOK (≤3)</p>
            <p className="text-2xl font-chakra font-bold text-yellow-400">{lowStock}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">TÜKƏNİB</p>
            <p className="text-2xl font-chakra font-bold text-red-400">{outOfStock}</p>
          </div>
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-zep/15">
            <p className="font-chakra font-bold text-sm">Stok hərəkəti tarixçəsi</p>
          </div>
          {movements.length === 0 ? (
            <p className="text-white/30 text-center py-8 text-sm">Hərəkət yoxdur</p>
          ) : (
            <div className="divide-y divide-blue-zep/10 max-h-64 overflow-y-auto">
              {movements.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.direction === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {m.direction === 'in' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{m.product_name}</p>
                    <p className="text-xs text-white/30">{REASON_LABELS[m.reason] || m.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-chakra font-bold ${m.direction === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                      {m.direction === 'in' ? '+' : '-'}{m.quantity}
                    </p>
                    <p className="text-xs text-white/20">
                      {new Date(m.created_at).toLocaleDateString('az-AZ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ad və ya SKU ilə axtar..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-white/30 text-center py-20">Yüklənir...</div>
      ) : (
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
                <th className="text-left p-4">MƏHSUL</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">RƏF</th>
                <th className="text-center p-4">STOK</th>
                <th className="text-center p-4">VƏZİYYƏT</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-blue-zep/10 hover:bg-white/2 transition">
                  <td className="p-4 text-white font-medium">{p.name}</td>
                  <td className="p-4 font-mono text-white/40 text-xs">{p.sku}</td>
                  <td className="p-4">
                    {p.shelf_location ? (
                      <span className="text-xs px-2 py-1 bg-blue-zep/15 text-blue-light rounded font-chakra">
                        {p.shelf_location}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-sm font-chakra font-bold px-3 py-1 rounded-full ${
                      p.quantity === 0
                        ? 'bg-red-500/10 text-red-400'
                        : p.quantity <= 3
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-chakra ${
                      p.quantity === 0 ? 'text-red-400' : p.quantity <= 3 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {p.quantity === 0 ? 'Tükənib' : p.quantity <= 3 ? 'Az qalıb' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Package size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-xs font-chakra">Anbarda məhsul yoxdur</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
