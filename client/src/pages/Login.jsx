import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Lock, Loader2 } from 'lucide-react'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { password })
      localStorage.setItem('tnn_token', res.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      onLogin()
    } catch {
      toast.error('Incorrect password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://i.imgur.com/fyIsumc.jpeg"
            alt="Total Nurses Network"
            className="w-32 h-auto mx-auto rounded-xl shadow-2xl"
          />
          <h1 className="text-white font-bold text-xl mt-4">TNN Outreach</h1>
          <p className="text-blue-300 text-sm mt-1">Staff Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-700" />
            </div>
            <h2 className="font-bold text-slate-800">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                autoFocus
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Total Nurses Network &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
