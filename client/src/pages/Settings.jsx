import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon, Mail, Building2, CheckCircle, Loader2, Send } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    axios.get('/api/settings').then(r => {
      setSettings(r.data)
      setLoading(false)
    })
  }, [])

  const handle = (e) => setSettings(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.put('/api/settings', settings)
      setSettings(res.data)
      toast.success('Settings saved successfully!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      await axios.post('/api/emails/test-connection')
      toast.success('SMTP connection successful! Your email is configured correctly.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection failed. Check your SMTP settings.')
    } finally {
      setTesting(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail.trim()) return toast.error('Enter a recipient email address first')
    setSendingTest(true)
    try {
      const res = await axios.post('/api/emails/send-test', { to_email: testEmail })
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your company info and email delivery settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Company Information</h2>
              <p className="text-xs text-slate-400">Appears in all outgoing emails and templates</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Company Name</label>
              <input name="company_name" value={settings.company_name || ''} onChange={handle} className="input" placeholder="TNN Staffing Solutions" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Tagline</label>
              <input name="company_tagline" value={settings.company_tagline || ''} onChange={handle} className="input" placeholder="Your Trusted Partner in Healthcare Staffing" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="company_phone" value={settings.company_phone || ''} onChange={handle} className="input" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="label">Website</label>
              <input name="company_website" value={settings.company_website || ''} onChange={handle} className="input" placeholder="https://yoursite.com" />
            </div>
          </div>
        </div>

        {/* SMTP Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Email (SMTP) Configuration</h2>
              <p className="text-xs text-slate-400">Required to send outreach emails</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-amber-800">
              <strong>Gmail users:</strong> Use <code className="bg-amber-100 px-1 rounded">smtp.gmail.com</code> with port <code className="bg-amber-100 px-1 rounded">587</code>.
              You must enable 2-Factor Authentication and generate an <strong>App Password</strong> from your Google Account security settings.
              Do not use your regular Gmail password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">SMTP Host</label>
              <input name="smtp_host" value={settings.smtp_host || ''} onChange={handle} className="input" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="label">SMTP Port</label>
              <input name="smtp_port" type="number" value={settings.smtp_port || ''} onChange={handle} className="input" placeholder="587" />
            </div>
            <div>
              <label className="label">Email (Username)</label>
              <input name="smtp_user" type="email" value={settings.smtp_user || ''} onChange={handle} className="input" placeholder="you@gmail.com" />
            </div>
            <div>
              <label className="label">Password / App Password</label>
              <input name="smtp_pass" type="password" value={settings.smtp_pass || ''} onChange={handle} className="input" placeholder="Your app password" />
            </div>
            <div>
              <label className="label">From Name</label>
              <input name="from_name" value={settings.from_name || ''} onChange={handle} className="input" placeholder="TNN Staffing Solutions" />
            </div>
            <div>
              <label className="label">From Email</label>
              <input name="from_email" type="email" value={settings.from_email || ''} onChange={handle} className="input" placeholder="outreach@yourcompany.com" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Settings</>}
          </button>
          <button type="button" onClick={handleTestConnection} disabled={testing} className="btn-secondary">
            {testing ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</> : 'Test SMTP Connection'}
          </button>
        </div>
      </form>

      {/* Test Email */}
      <div className="card p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Send a Test Email</h2>
            <p className="text-xs text-slate-400">Verify everything works before your first campaign</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            className="input flex-1"
            placeholder="recipient@example.com"
          />
          <button onClick={handleSendTest} disabled={sendingTest} className="btn-primary flex-shrink-0">
            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>

      {/* Help Box */}
      <div className="card p-6 mt-6 bg-gradient-to-r from-slate-800 to-slate-900 border-0">
        <h3 className="text-white font-bold mb-3">Quick Setup Guide</h3>
        <ol className="text-slate-400 text-sm space-y-2 list-decimal list-inside leading-relaxed">
          <li>Fill in your <strong className="text-slate-200">Company Information</strong> above (name, phone, website)</li>
          <li>Set up your <strong className="text-slate-200">SMTP credentials</strong> — for Gmail, use an App Password</li>
          <li>Click <strong className="text-slate-200">Save Settings</strong>, then <strong className="text-slate-200">Test SMTP Connection</strong></li>
          <li>Send a <strong className="text-slate-200">Test Email</strong> to yourself to preview the design</li>
          <li>Go to <strong className="text-slate-200">Campaigns</strong> and create your first outreach!</li>
        </ol>
      </div>
    </div>
  )
}
