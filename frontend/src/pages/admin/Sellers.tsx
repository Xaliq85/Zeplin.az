import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/client'
import { Search, CheckCircle, XCircle, Users } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminSellers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => api.get('/api/auth/sellers/').then(r => r.data),
  })

  const toggleVerify = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) =>
      api.patch(`/api/auth/sellers/${id}/`, { is_verified: val }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sellers'] })
      toast.success('Yeniləndi')
    },
  })

  const sellers = (data?.results || data || []).filter((s: any) =>
    (s.company_name || s.user?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.user?.phone?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-chakra text-2xl font-bold">Satıcılar</h1>
        <span className="text-xs bg-gold/10 text-gold px-3 py-1.5 rounded-full font-chakra flex items-center gap-1.5">
          <Users size={13} /> {sellers.length} satıcı
        </span>
      </div>

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
              <th className="text-left p-4">BALANs</th>
              <th className="text-center p-4">VERİFİKASİYA</th>
              <th className="text-center p-4">ƏMƏLİYYAT</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
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
                <td className="p-4">
                  <span className="font-chakra font-bold text-gold">{s.balance} ₼</span>
                </td>
                <td className="p-4 text-center">
                  {s.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                      <CheckCircle size={12} /> Təsdiqlənib
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                      <XCircle size={12} /> Gözləyir
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleVerify.mutate({ id: s.id, val: !s.is_verified })}
                    className={`text-xs px-3 py-1.5 rounded-lg font-chakra transition ${
                      s.is_verified
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
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
    </div>
  )
}
