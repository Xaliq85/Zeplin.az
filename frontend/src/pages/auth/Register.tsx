import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/apply/', form)
      setDone(true)
    } catch {
      toast.error('Xəta baş verdi. Yenidən cəhd edin.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1c38]">
        <div className="w-full max-w-md p-10 rounded-2xl border border-blue-zep/20 bg-[#0f2448] text-center">
          <div className="text-5xl mb-6">✓</div>
          <h2 className="font-chakra text-2xl font-bold text-gold mb-3">Müraciətiniz qəbul edildi!</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            Komandamız müraciətinizi yoxlayacaq. Təsdiqlədikdən sonra
            <strong className="text-white"> {form.email}</strong> ünvanına email göndəriləcək.
          </p>
          <Link to="/" className="text-sm text-gold/70 hover:text-gold font-chakra tracking-wider transition">
            ← Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1c38] py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-chakra text-2xl font-bold tracking-widest">
            ZEPLIN<span className="text-gold">.az</span>
          </Link>
          <p className="text-white/40 text-sm font-chakra tracking-widest mt-2">SATICI OLMAQ İSTƏYİRƏM</p>
        </div>

        <div className="p-8 rounded-2xl border border-blue-zep/20 bg-[#0f2448]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 font-chakra tracking-wider">AD</label>
                <input
                  required
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold transition text-sm"
                  placeholder="Əli"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-chakra tracking-wider">SOYAD</label>
                <input
                  required
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold transition text-sm"
                  placeholder="Həsənov"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 font-chakra tracking-wider">TELEFON</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold transition text-sm"
                placeholder="+994501234567"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 font-chakra tracking-wider">EMAIL</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold transition text-sm"
                placeholder="ali@gmail.com"
              />
              <p className="text-xs text-white/30 mt-1">Şifrə linki bu emailə göndəriləcək</p>
            </div>

            <div>
              <label className="text-xs text-white/50 font-chakra tracking-wider">QEYD (istəyə bağlı)</label>
              <textarea
                value={form.note}
                onChange={e => set('note', e.target.value)}
                rows={2}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold transition text-sm resize-none"
                placeholder="Nə satırsınız? Instagram hesabınız var?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gold text-navy font-chakra font-bold tracking-widest rounded-lg hover:bg-gold-light transition disabled:opacity-50"
            >
              {loading ? 'GÖNDƏRİLİR...' : 'MÜRACİƏT ET →'}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            Artıq hesabınız var?{' '}
            <Link to="/login" className="text-gold/70 hover:text-gold transition">Daxil olun</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
