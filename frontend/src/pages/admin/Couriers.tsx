import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import { Plus, X, Truck, MapPin, ToggleLeft, ToggleRight, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const VEHICLE_LABELS: Record<string, string> = {
  bike: '🚲 Velosiped',
  motorcycle: '🏍️ Motosiklet',
  car: '🚗 Avtomobil',
  foot: '🚶 Piyada',
}

const ZONE_LABELS: Record<string, string> = {
  sumgayit: 'Sumqayıt',
  baku: 'Bakı',
  both: 'Hər ikisi',
}

function AddCourierModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    vehicle: 'motorcycle',
    zone: 'sumgayit',
    note: '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/api/couriers/create/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-couriers'] })
      toast.success('Kuryer əlavə edildi')
      onClose()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.phone?.[0] || 'Xəta baş verdi'
      toast.error(msg)
    },
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f2448] border border-blue-zep/20 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-chakra font-bold text-lg">Yeni kuryer</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">AD</label>
              <input
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">SOYAD</label>
              <input
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">TELEFON</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+994501234567"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">ŞİFRƏ</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">NƏQLİYYAT</label>
              <select
                value={form.vehicle}
                onChange={e => setForm({ ...form, vehicle: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              >
                <option value="motorcycle">🏍️ Motosiklet</option>
                <option value="car">🚗 Avtomobil</option>
                <option value="bike">🚲 Velosiped</option>
                <option value="foot">🚶 Piyada</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 font-chakra tracking-wider">ZONA</label>
              <select
                value={form.zone}
                onChange={e => setForm({ ...form, zone: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition"
              >
                <option value="sumgayit">Sumqayıt</option>
                <option value="baku">Bakı</option>
                <option value="both">Hər ikisi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 font-chakra tracking-wider">QEYD</label>
            <textarea
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              rows={2}
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
            {mutation.isPending ? 'ƏLAVƏ EDİLİR...' : 'ƏLAVƏ ET →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCouriers() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-couriers'],
    queryFn: () => api.get('/api/couriers/').then(r => r.data),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.patch(`/api/couriers/${id}/`, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-couriers'] })
      toast.success('Status yeniləndi')
    },
  })

  const couriers = data?.results || data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-chakra text-2xl font-bold">Kuryerlər</h1>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-navy rounded-lg font-chakra font-bold text-sm hover:bg-gold-light transition"
        >
          <Plus size={16} /> YENİ KURYER
        </button>
      </div>

      {/* Statistika kartları */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">CƏMİ</p>
            <p className="text-2xl font-chakra font-bold text-gold">{couriers.length}</p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">AKTİV</p>
            <p className="text-2xl font-chakra font-bold text-green-400">
              {couriers.filter((c: any) => c.is_active).length}
            </p>
          </div>
        </div>
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-zep/20 border border-blue-light/20 flex items-center justify-center text-blue-light">
            <ShoppingCart size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 font-chakra tracking-wider">BU GÜN</p>
            <p className="text-2xl font-chakra font-bold text-blue-light">
              {couriers.reduce((sum: number, c: any) => sum + (c.today_orders || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Kuryer kartları */}
      {isLoading ? (
        <div className="text-white/30 text-center py-20">Yüklənir...</div>
      ) : couriers.length === 0 ? (
        <div className="text-center py-20">
          <Truck size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-chakra">Hələ kuryer yoxdur</p>
          <button
            onClick={() => setModal(true)}
            className="mt-4 px-4 py-2 text-sm text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition"
          >
            İlk kuryeri əlavə et
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {couriers.map((courier: any) => (
            <div
              key={courier.id}
              className={`bg-[#0f2448] border rounded-xl p-5 transition ${
                courier.is_active ? 'border-blue-zep/15 hover:border-blue-zep/30' : 'border-white/5 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-chakra font-bold text-white">{courier.full_name}</p>
                  <p className="text-xs text-white/30 mt-0.5 font-mono">
                    {courier.user?.phone}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive.mutate({ id: courier.id, is_active: !courier.is_active })}
                  className={`transition ${courier.is_active ? 'text-green-400 hover:text-red-400' : 'text-white/20 hover:text-green-400'}`}
                  title={courier.is_active ? 'Deaktiv et' : 'Aktiv et'}
                >
                  {courier.is_active
                    ? <ToggleRight size={28} />
                    : <ToggleLeft size={28} />
                  }
                </button>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Truck size={14} className="text-white/30" />
                  {VEHICLE_LABELS[courier.vehicle] || courier.vehicle}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin size={14} className="text-white/30" />
                  {ZONE_LABELS[courier.zone] || courier.zone}
                </div>
              </div>

              {/* Statistika */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                <div className="text-center">
                  <p className="text-xl font-chakra font-bold text-gold">{courier.today_orders}</p>
                  <p className="text-xs text-white/30 mt-0.5">Bu gün</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-chakra font-bold text-white/60">{courier.total_orders}</p>
                  <p className="text-xs text-white/30 mt-0.5">Cəmi</p>
                </div>
              </div>

              {courier.note && (
                <p className="mt-3 text-xs text-white/30 italic border-t border-white/5 pt-3">
                  {courier.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && <AddCourierModal onClose={() => setModal(false)} />}
    </div>
  )
}
