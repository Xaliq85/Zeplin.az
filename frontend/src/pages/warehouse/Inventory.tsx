import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Product } from '../../types'
import { Package, Search, ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function WarehouseInventory() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-products'],
    queryFn: () => api.get('/api/products/').then(r => r.data),
  })

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      api.patch(`/api/products/${id}/`, { quantity }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouse-products'] })
      toast.success('Yeniləndi')
    },
  })

  const products: Product[] = (data?.results || data || []).filter((p: Product) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="font-chakra text-2xl font-bold mb-6">Anbar inventarı</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ad və ya SKU ilə axtar..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition"
        />
      </div>

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
                <th className="text-center p-4">SAY</th>
                <th className="text-center p-4">ƏMƏLİYYAT</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
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
                    <span className={`text-sm font-chakra font-bold ${p.quantity > 5 ? 'text-green-400' : p.quantity > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQty.mutate({ id: p.id, quantity: Math.max(0, p.quantity - 1) })}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/30 transition"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        onClick={() => updateQty.mutate({ id: p.id, quantity: p.quantity + 1 })}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-green-400 hover:border-green-400/30 transition"
                      >
                        <ArrowUp size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Package size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-xs font-chakra">Məhsul tapılmadı</p>
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
