import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import { Search, CheckCircle, XCircle, Users, Clock, UserPlus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

type Tab = 'sellers' | 'applications'

const STATUS_BADGE: Record<string, JSX.Element> = {
  pending:  <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded"><Clock size={11} /> Gözləyir</span>,
  approved: <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded"><CheckCircle size={11} /> Təsdiqləndi</span>,
  rejected: <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded"><XCircle size={11} /> Rədd edildi</span>,
}

export default function AdminSellers() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState<Tab>('sellers')
  const [search, setSearch] = useState('')

  // Sellers
  const { data: sellersData, isLoading: sellersLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => api.get('/api/auth/sellers/').then(r => r.data),
  })

  const toggleVerify = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) =>
      api.patch(`/api/auth/sellers/${id}/`, { is_verified: val }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-sellers'] }); toast.success('Yeniləndi') },
  })

  // Applications
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['seller-applications'],
    queryFn: () => api.get('/api/auth/applications/').then(r => r.data),
    enabled: tab === 'applications',
  })

  const approve = useMutation({
    mutationFn: (id: number) => api.post(`/api/auth/applications/${id}/approve/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seller-applications'] }); toast.success('Təsdiqləndi, email göndərildi') },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Xəta'),
  })

  const reject = useMutation({
    mutationFn: (id: number) => api.post(`/api/auth/applications/${id}/reject/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seller-applications'] }); toast.success('Rədd edildi') },
  })

  const sellers = (sellersData?.results || sellersData || []).filter((s: any) =>
    (s.user?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.user?.phone?.includes(search)
  )

  const apps = (appsData?.results || appsData || [])
  const pendingCount = apps.filter((a: any) => a.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-chakra text-2xl font-bold">Satıcılar</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-blue-zep/15">
        <button
          onClick={() => setTab('sellers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-chakra tracking-wide transition border-b-2 -mb-px ${
            tab === 'sellers' ? 'border-gold text-gold' : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <Users size={15} /> Aktiv satıcılar
        </button>
        <button
          onClick={() => setTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-chakra tracking-wide transition border-b-2 -mb-px ${
            tab === 'applications' ? 'border-gold text-gold' : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <UserPlus size={15} /> Müraciətlər
          {pendingCount > 0 && (
            <span className="bg-gold text-navy text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
      </div>

      {tab === 'sellers' && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ad və ya telefon ilə axtar..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0f2448] border border-blue-zep/15 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition"
            />
          </div>
          <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
                  <th className="text-left p-4">SATIÇI</th>
                  <th className="text-left p-4">TELEFON</th>
                  <th className="text-left p-4">BALANS</th>
                  <th className="text-center p-4">VERİFİKASİYA</th>
                  <th className="text-center p-4">ƏMƏLİYYAT</th>
                </tr>
              </thead>
              <tbody>
                {sellersLoading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-white/30">Yüklənir...</td></tr>
                ) : sellers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-white/20 text-xs">Satıcı tapılmadı</td></tr>
                ) : sellers.map((s: any) => (
                  <tr key={s.id} className="border-b border-blue-zep/10 hover:bg-white/2 transition">
                    <td className="p-4">
                      <p className="text-white font-medium">{s.company_name || `${s.user?.first_name} ${s.user?.last_name}`}</p>
                      <p className="text-xs text-white/30 mt-0.5">#{s.id}</p>
                    </td>
                    <td className="p-4 text-white/60 font-mono text-xs">{s.user?.phone}</td>
                    <td className="p-4"><span className="font-chakra font-bold text-gold">{s.balance} ₼</span></td>
                    <td className="p-4 text-center">
                      {s.is_verified
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded"><CheckCircle size={12} /> Təsdiqlənib</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded"><XCircle size={12} /> Gözləyir</span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleVerify.mutate({ id: s.id, val: !s.is_verified })}
                        className={`text-xs px-3 py-1.5 rounded-lg font-chakra transition ${
                          s.is_verified ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {s.is_verified ? 'Blokla' : 'Təsdiqlə'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'applications' && (
        <div className="bg-[#0f2448] border border-blue-zep/15 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-zep/15 text-white/40 font-chakra text-xs tracking-wider">
                <th className="text-left p-4">MÜRACİƏT EDƏN</th>
                <th className="text-left p-4">ƏLAQƏ</th>
                <th className="text-left p-4">QEYD</th>
                <th className="text-center p-4">STATUS</th>
                <th className="text-center p-4">ƏMƏLİYYAT</th>
              </tr>
            </thead>
            <tbody>
              {appsLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/30">Yüklənir...</td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/20 text-xs">Müraciət yoxdur</td></tr>
              ) : apps.map((a: any) => (
                <tr key={a.id} className="border-b border-blue-zep/10 hover:bg-white/2 transition">
                  <td className="p-4">
                    <p className="text-white font-medium">{a.first_name} {a.last_name}</p>
                    <p className="text-xs text-white/30 mt-0.5">{new Date(a.created_at).toLocaleDateString('az')}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white/70 font-mono text-xs">{a.phone}</p>
                    <p className="text-white/40 text-xs mt-0.5">{a.email}</p>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="text-white/50 text-xs truncate">{a.note || '—'}</p>
                  </td>
                  <td className="p-4 text-center">{STATUS_BADGE[a.status]}</td>
                  <td className="p-4 text-center">
                    {a.status === 'pending' ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => approve.mutate(a.id)}
                          disabled={approve.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg font-chakra bg-green-500/10 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
                        >
                          Təsdiqlə
                        </button>
                        <button
                          onClick={() => reject.mutate(a.id)}
                          disabled={reject.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg font-chakra bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                        >
                          Rədd et
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
