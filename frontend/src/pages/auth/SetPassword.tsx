import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function SetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Şifrələr uyğun gəlmir')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/set-password/', { uid, token, password })
      toast.success('Şifrə təyin edildi! Daxil ola bilərsiniz.')
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Link keçərsizdir və ya vaxtı keçib.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1c38]">
      <div className="w-full max-w-sm p-8 rounded-2xl border border-blue-zep/20 bg-[#0f2448]">
        <h1 className="font-chakra text-2xl font-bold text-center mb-2">
          ZEPLIN<span className="text-gold">.az</span>
        </h1>
        <p className="text-center text-sm text-white/40 font-chakra tracking-widest mb-8">
          ŞİFRƏ TƏYİN ET
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 font-chakra tracking-wider">YENİ ŞİFRƏ</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold transition"
              placeholder="Minimum 8 simvol"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 font-chakra tracking-wider">ŞİFRƏNİ TƏKRARLAYINı</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gold text-navy font-chakra font-bold tracking-widest rounded-lg hover:bg-gold-light transition disabled:opacity-50"
          >
            {loading ? 'SAXLANILIR...' : 'ŞİFRƏ TƏYİN ET →'}
          </button>
        </form>
      </div>
    </div>
  )
}
