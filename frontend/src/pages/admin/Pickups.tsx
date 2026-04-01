import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import { Plus, X, MapPin, Clock, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type PickupPoint = {
  id: number
  name: string
  address: string
  lat: string | null
  lng: string | null
  working_hours: string
  is_active: boolean
}

const emptyForm = {
  name: '',
  address: '',
  lat: '',
  lng: '',
  working_hours: '',
  is_active: true,
}

function PickupModal({
  onClose,
  existing,
}: {
  onClose: () => void
  existing?: PickupPoint
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState(
    existing
      ? {
          name: existing.name,
          address: existing.address,
          lat: existing.lat ?? '',
          lng: existing.lng ?? '',
          working_hours: existing.working_hours,
          is_active: existing.is_active,
        }
      : emptyForm
  )

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      existing
        ? api.put(`/api/orders/pickups/${existing.id}/`, data)
        : api.post('/api/orders/pickups/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pickups'] })
      toast.success(existing ? 'Pickup nöqtəsi yeniləndi' : 'Pickup nöqtəsi əlavə edildi')
      onClose()
    },
    onError: () => toast.error('Xəta baş verdi'),
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f2448] border border-blue-zep/20 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-chakra font-bold text-lg">
            {existing ? 'Pickup nöqtəsini redaktə et' : 'Yeni pickup nöqtəsi'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">AD</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Sumqayıt Plaza"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">ÜNVAN</label>
            <textarea
              value={form.address}
              onChange={e => set('address', e.target.value)}
              rows={2}
              placeholder="Sumqayıt şəh., Heydər Əliyev pr. 1"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">EN (LAT)</label>
              <input
                value={form.lat}
                onChange={e => set('lat', e.target.value)}
                placeholder="40.5855"
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">UZ (LNG)</label>
              <input
                value={form.lng}
                onChange={e => set('lng', e.target.value)}
                placeholder="49.6317"
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">İŞ SAATLARİ</label>
            <input
              value={form.working_hours}
              onChange={e => set('working_hours', e.target.value)}
              placeholder="09:00 – 21:00 (həftəiçi)"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-white/50 font-chakra tracking-wider">AKTİV</span>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`transition ${form.is_active ? 'text-green-400' : 'text-white/20'}`}
            >
              {form.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
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
            disabled={mutation.isPending || !form.name || !form.address}
            className="flex-1 py-2.5 rounded-lg bg-gold text-navy text-sm font-chakra font-bold hover:bg-gold-light transition disabled:opacity-50"
          >
            {mutation.isPending ? 'SAXLANILIR...' : existing ? 'YADDA SAXLA →' : 'ƏLAVƏ ET →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPickups() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<PickupPoint | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pickups'],
    queryFn: () => api.get('/api/orders/pickups/').then(r => r.data),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.patch(`/api/orders/pickups/${id}/`, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pickups'] })
      toast.success('Status yeniləndi')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/orders/pickups/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pickups'] })
      toast.success('Pickup nöqtəsi silindi')
      setDeleteConfirm(null)
    },
    onError: () => toast.error('Silinə bilmədi'),
  })

  const points: PickupPoint[] = data?.results ?? data ?? []
  const activeCount = points.filter(p => p.is_active).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-chakra text-2xl font-bold">Pickup Nöqtələri</h1>
          <p className="text-white/30 text-sm mt-1">Müştərilərin sifarişi götürə biləcəyi nöqtələr</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-navy rounded-lg font-chakra font-bold text-sm hover:bg-gold-light transition"
        >
          <Plus size={16} /> YENİ NÖQTƏ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">CƏMİ</p>
            <p className="text-2xl font-chakra font-bold text-gold">{points.length}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">AKTİV</p>
            <p className="text-2xl font-chakra font-bold text-green-400">{activeCount}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">DEAKTİV</p>
            <p className="text-2xl font-chakra font-bold text-white/30">{points.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-white/30 text-center py-20">Yüklənir...</div>
      ) : points.length === 0 ? (
        <div className="text-center py-20">
          <MapPin size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-chakra">Hələ pickup nöqtəsi yoxdur</p>
          <button
            onClick={() => setModal(true)}
            className="mt-4 px-4 py-2 text-sm text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition"
          >
            İlk nöqtəni əlavə et
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {points.map((point) => (
            <div
              key={point.id}
              className={`bg-[#0f2448] border rounded-xl p-5 transition ${
                point.is_active ? 'border-blue-zep/15 hover:border-blue-zep/30' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-chakra font-bold text-white truncate">{point.name}</p>
                  {point.lat && point.lng && (
                    <p className="text-xs text-white/20 font-mono mt-0.5">
                      {point.lat}, {point.lng}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleActive.mutate({ id: point.id, is_active: !point.is_active })}
                  className={`ml-2 shrink-0 transition ${point.is_active ? 'text-green-400 hover:text-red-400' : 'text-white/20 hover:text-green-400'}`}
                  title={point.is_active ? 'Deaktiv et' : 'Aktiv et'}
                >
                  {point.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm text-white/50">
                  <MapPin size={14} className="text-white/30 mt-0.5 shrink-0" />
                  <span className="leading-snug">{point.address}</span>
                </div>
                {point.working_hours && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Clock size={14} className="text-white/30 shrink-0" />
                    {point.working_hours}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => setEditing(point)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/40 hover:text-gold border border-white/10 hover:border-gold/30 rounded-lg transition font-chakra tracking-wider"
                >
                  <Pencil size={12} /> REDAKTƏ
                </button>
                {deleteConfirm === point.id ? (
                  <button
                    onClick={() => deleteMutation.mutate(point.id)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition font-chakra tracking-wider"
                  >
                    <Trash2 size={12} /> TƏSDİQLƏ
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(point.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition font-chakra tracking-wider"
                  >
                    <Trash2 size={12} /> SİL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal || editing) && (
        <PickupModal
          onClose={() => { setModal(false); setEditing(null) }}
          existing={editing ?? undefined}
        />
      )}
    </div>
  )
}
