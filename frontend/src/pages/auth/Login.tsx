import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useAuthStore } from '../../store/auth'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login/', { phone, password })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      const me = await api.get('/api/auth/me/')
      setUser(me.data)
      const role = me.data.role
      navigate(`/${role}`)
    } catch {
      toast.error('Telefon və ya şifrə yanlışdır')
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
          PANEL GİRİŞİ
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 font-chakra tracking-wider">TELEFON</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994501234567"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-gold transition"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 font-chakra tracking-wider">ŞİFRƏ</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gold text-navy font-chakra font-bold tracking-widest rounded-lg hover:bg-gold-light transition disabled:opacity-50"
          >
            {loading ? 'GİRİLİR...' : 'DAXİL OL →'}
          </button>
        </form>
      </div>
    </div>
  )
}
