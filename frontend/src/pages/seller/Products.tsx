import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import type { Product } from '../../types'
import { Plus, Pencil, Trash2, Package, X } from 'lucide-react'
import toast from 'react-hot-toast'

function ProductModal({
  product,
  onClose,
}: {
  product?: Product
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || '',
    quantity: product?.quantity || 0,
    shelf_location: product?.shelf_location || '',
    description: product?.description || '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      product
        ? api.patch(`/api/products/${product.id}/`, data)
        : api.post('/api/products/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] })
      toast.success(product ? 'Məhsul yeniləndi' : 'Məhsul əlavə edildi')
      onClose()
    },
    onError: () => toast.error('Xəta baş verdi'),
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f2448] border border-blue-zep/20 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-chakra font-bold text-lg">
            {product ? 'Məhsulu düzəlt' : 'Yeni məhsul'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">AD</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">QİYMƏT (AZN)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">SAYI</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">RƏF YERİ</label>
            <input
              value={form.shelf_location}
              onChange={(e) => setForm({ ...form, shelf_location: e.target.value })}
              placeholder="məs: A1-3"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">AÇIQLAMA</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-chakra hover:border-white/20 transition"
          >
            LƏĞV ET
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-lg bg-gold text-navy text-sm font-chakra font-bold hover:bg-gold-light transition disabled:opacity-50"
          >
            {mutation.isPending ? 'SAXLANILIR...' : 'SAXLA →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SellerProducts() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false })

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get('/api/products/').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] })
      toast.success('Məhsul silindi')
    },
  })

  const products: Product[] = data?.results || data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-chakra text-2xl font-bold">Məhsullar</h1>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-navy rounded-lg font-chakra font-bold text-sm hover:bg-gold-light transition"
        >
          <Plus size={16} />
          YENİ MƏHSUL
        </button>
      </div>

      {isLoading ? (
        <div className="text-white/40 text-center py-20">Yüklənir...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-chakra">Hələ məhsul yoxdur</p>
          <button
            onClick={() => setModal({ open: true })}
            className="mt-4 px-4 py-2 text-sm text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition"
          >
            İlk məhsulu əlavə et
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-5 hover:border-blue-zep/30 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-chakra font-bold text-white">{p.name}</p>
                  <p className="text-xs text-white/30 mt-0.5 font-mono">{p.sku}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => setModal({ open: true, product: p })}
                    className="p-1.5 text-white/40 hover:text-gold transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(p.id)}
                    className="p-1.5 text-white/40 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-chakra font-bold text-gold">{p.price} ₼</span>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded font-chakra ${p.quantity > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {p.quantity} ədəd
                  </span>
                  {p.shelf_location && (
                    <p className="text-xs text-white/30 mt-1">Rəf: {p.shelf_location}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <ProductModal
          product={modal.product}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
