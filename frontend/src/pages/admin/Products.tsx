import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import { Plus, Pencil, Trash2, Package, X, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Product = {
  id: number
  name: string
  sku: string
  price: string
  quantity: number
  shelf_location: string
  description: string
  is_active: boolean
  seller: number
  seller_name?: string
}

type Seller = { id: number; user: { first_name: string; last_name: string } }

function ProductModal({
  product,
  sellers,
  onClose,
}: {
  product?: Product
  sellers: Seller[]
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || '',
    description: product?.description || '',
    shelf_location: product?.shelf_location || '',
    seller: product?.seller || (sellers[0]?.id ?? ''),
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      product
        ? api.patch(`/api/products/${product.id}/`, data)
        : api.post('/api/products/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success(product ? 'Məhsul yeniləndi' : 'Məhsul əlavə edildi')
      onClose()
    },
    onError: () => toast.error('Xəta baş verdi'),
  })

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f2448] border border-blue-zep/20 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-chakra font-bold text-lg">{product ? 'Məhsulu düzəlt' : 'Yeni məhsul'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">SATICI</label>
            <select
              value={form.seller}
              onChange={e => set('seller', Number(e.target.value))}
              disabled={!!product}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition disabled:opacity-50"
            >
              {sellers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.user.first_name} {s.user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">AD</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">SKU</label>
              <input
                value={form.sku}
                onChange={e => set('sku', e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">QİYMƏT (AZN)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">RƏF YERİ</label>
              <input
                value={form.shelf_location}
                onChange={e => set('shelf_location', e.target.value)}
                placeholder="A1-3"
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">AÇIQLAMA</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-chakra hover:border-white/20 transition">LƏĞV ET</button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.name || !form.sku || !form.price}
            className="flex-1 py-2.5 rounded-lg bg-gold text-navy text-sm font-chakra font-bold hover:bg-gold-light transition disabled:opacity-50"
          >
            {mutation.isPending ? 'SAXLANILIR...' : 'SAXLA →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false })
  const [search, setSearch] = useState('')
  const [filterSeller, setFilterSeller] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/api/products/').then(r => r.data),
  })

  const { data: sellersData } = useQuery({
    queryKey: ['admin-sellers-list'],
    queryFn: () => api.get('/api/auth/sellers/').then(r => r.data),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.patch(`/api/products/${id}/`, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Status yeniləndi')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Məhsul silindi')
      setDeleteConfirm(null)
    },
    onError: () => toast.error('Silinə bilmədi'),
  })

  const allProducts: Product[] = data?.results ?? data ?? []
  const sellers: Seller[] = sellersData?.results ?? sellersData ?? []

  const filtered = allProducts.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchSeller = filterSeller === 'all' || String(p.seller) === filterSeller
    return matchSearch && matchSeller
  })

  const activeCount = allProducts.filter(p => p.is_active).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-chakra text-2xl font-bold">Məhsullar</h1>
          <p className="text-white/30 text-sm mt-1">Bütün satıcıların məhsulları</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-navy rounded-lg font-chakra font-bold text-sm hover:bg-gold-light transition"
        >
          <Plus size={16} /> YENİ MƏHSUL
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">CƏMİ</p>
            <p className="text-2xl font-chakra font-bold text-gold">{allProducts.length}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">AKTİV</p>
            <p className="text-2xl font-chakra font-bold text-green-400">{activeCount}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">DEAKTİV</p>
            <p className="text-2xl font-chakra font-bold text-white/30">{allProducts.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ad və ya SKU ilə axtar..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition"
          />
        </div>
        <select
          value={filterSeller}
          onChange={e => setFilterSeller(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm focus:outline-none focus:border-gold/40 transition"
        >
          <option value="all">Bütün satıcılar</option>
          {sellers.map((s: Seller) => (
            <option key={s.id} value={s.id}>
              {s.user.first_name} {s.user.last_name}
            </option>
          ))}
        </select>
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
                <th className="text-left p-4">SATICI</th>
                <th className="text-left p-4">RƏF</th>
                <th className="text-center p-4">STOK</th>
                <th className="text-center p-4">QİYMƏT</th>
                <th className="text-center p-4">AKTİV</th>
                <th className="text-center p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={`border-b border-blue-zep/10 hover:bg-white/2 transition ${!p.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <p className="text-white font-medium">{p.name}</p>
                    <p className="text-xs text-white/30 font-mono mt-0.5">{p.sku}</p>
                  </td>
                  <td className="p-4 text-white/50 text-xs">{p.seller_name || '—'}</td>
                  <td className="p-4">
                    {p.shelf_location
                      ? <span className="text-xs px-2 py-1 bg-blue-zep/15 text-blue-light rounded font-chakra">{p.shelf_location}</span>
                      : <span className="text-white/20 text-xs">—</span>
                    }
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-sm font-chakra font-bold px-2 py-1 rounded-full ${
                      p.quantity === 0 ? 'bg-red-500/10 text-red-400' :
                      p.quantity <= 3 ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>{p.quantity}</span>
                  </td>
                  <td className="p-4 text-center font-chakra font-bold text-gold">{p.price} ₼</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                      className={`transition ${p.is_active ? 'text-green-400 hover:text-red-400' : 'text-white/20 hover:text-green-400'}`}
                    >
                      {p.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, product: p })}
                        className="p-1.5 text-white/30 hover:text-gold transition"
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === p.id ? (
                        <button
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="text-xs text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition font-chakra"
                        >
                          TƏSDİQ
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 text-white/30 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Package size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-xs font-chakra">Məhsul tapılmadı</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <ProductModal
          product={modal.product}
          sellers={sellers}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
