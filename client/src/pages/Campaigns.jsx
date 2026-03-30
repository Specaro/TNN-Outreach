import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Mail, Plus, Send, Trash2, Eye, X, CheckCircle, Clock,
  Users, Building2, Home, ChevronDown, ChevronRight, Loader2,
} from 'lucide-react'

const STEPS = ['Details', 'Recipients', 'Preview & Send']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            i < current ? 'bg-blue-600 text-white' :
            i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
            'bg-slate-100 text-slate-400'
          }`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-sm font-semibold ${i === current ? 'text-blue-700' : i < current ? 'text-slate-600' : 'text-slate-400'}`}>
            {step}
          </span>
          {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />}
        </div>
      ))}
    </div>
  )
}

function CampaignWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [templates, setTemplates] = useState([])
  const [contacts, setContacts] = useState([])
  const [previewHtml, setPreviewHtml] = useState('')
  const [sending, setSending] = useState(false)
  const [sentResult, setSentResult] = useState(null)

  const [form, setForm] = useState({
    name: '',
    subject: '',
    template_id: '',
    custom_message: '',
    recipient_type: 'all',
    selected_contacts: [],
  })

  useEffect(() => {
    axios.get('/api/emails/templates').then(r => setTemplates(r.data))
    axios.get('/api/contacts', { params: { active: 'true' } }).then(r => setContacts(r.data))
  }, [])

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const toggleContact = (id) => setForm(p => ({
    ...p,
    selected_contacts: p.selected_contacts.includes(id)
      ? p.selected_contacts.filter(i => i !== id)
      : [...p.selected_contacts, id]
  }))

  const loadPreview = async () => {
    const res = await axios.post('/api/emails/preview', {
      template_id: form.template_id,
      custom_message: form.custom_message,
      contact_name: 'Healthcare Partner',
    })
    setPreviewHtml(res.data.html)
  }

  const goToStep = async (n) => {
    if (n === 2) await loadPreview()
    setStep(n)
  }

  const handleSend = async () => {
    setSending(true)
    try {
      // Save campaign first
      const campaignRes = await axios.post('/api/campaigns', form)
      const campaignId = campaignRes.data.id
      // Send emails
      const sendRes = await axios.post(`/api/emails/send-campaign/${campaignId}`)
      setSentResult(sendRes.data)
      toast.success(`Campaign sent! ${sendRes.data.sent} emails delivered.`)
      onCreated()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  const filteredContacts = form.recipient_type === 'hospitals'
    ? contacts.filter(c => c.type === 'hospital')
    : form.recipient_type === 'nursing_homes'
    ? contacts.filter(c => c.type === 'nursing_home')
    : contacts

  const recipientCount = form.recipient_type === 'custom'
    ? form.selected_contacts.length
    : filteredContacts.filter(c => c.email).length

  if (sentResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Campaign Sent!</h2>
          <p className="text-slate-500 mb-5">Your outreach campaign has been delivered.</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">{sentResult.total}</p>
              <p className="text-xs text-slate-500 mt-1">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700">{sentResult.sent}</p>
              <p className="text-xs text-slate-500 mt-1">Delivered</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-600">{sentResult.failed}</p>
              <p className="text-xs text-slate-500 mt-1">Failed</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-primary w-full justify-center">Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-slate-800">New Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <StepIndicator current={step} />

          {/* Step 0: Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="label">Campaign Name *</label>
                <input name="name" value={form.name} onChange={handle} className="input"
                  placeholder="e.g. Q2 Hospital Outreach 2024" />
              </div>
              <div>
                <label className="label">Email Subject Line *</label>
                <input name="subject" value={form.subject} onChange={handle} className="input"
                  placeholder="e.g. Qualified Nurses Available for Your Facility" />
              </div>
              <div>
                <label className="label">Email Template *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, template_id: t.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.template_id === t.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <p className="font-semibold text-slate-800 mt-2 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Custom Message <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  name="custom_message"
                  value={form.custom_message}
                  onChange={handle}
                  rows={4}
                  className="input resize-none"
                  placeholder="Add a personalized note that will be included in the email body..."
                />
              </div>
            </div>
          )}

          {/* Step 1: Recipients */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Send To</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {[
                    { value: 'all', label: 'All Contacts', icon: Users },
                    { value: 'hospitals', label: 'Hospitals Only', icon: Building2 },
                    { value: 'nursing_homes', label: 'Nursing Homes', icon: Home },
                    { value: 'custom', label: 'Custom Select', icon: CheckCircle },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, recipient_type: value, selected_contacts: [] }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.recipient_type === value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${form.recipient_type === value ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.recipient_type === 'custom' && (
                <div>
                  <label className="label">Select Contacts ({form.selected_contacts.length} selected)</label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    {contacts.filter(c => c.email).map(c => (
                      <label key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                        <input
                          type="checkbox"
                          checked={form.selected_contacts.includes(c.id)}
                          onChange={() => toggleContact(c.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                        </div>
                        <span className={c.type === 'hospital' ? 'badge-hospital' : 'badge-nursing'}>
                          {c.type === 'hospital' ? 'Hospital' : 'NH'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>{recipientCount}</strong> contact{recipientCount !== 1 ? 's' : ''} will receive this email.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex gap-3"><span className="text-slate-400 w-20 flex-shrink-0">Campaign:</span><span className="font-semibold">{form.name}</span></div>
                <div className="flex gap-3"><span className="text-slate-400 w-20 flex-shrink-0">Subject:</span><span className="font-semibold">{form.subject}</span></div>
                <div className="flex gap-3"><span className="text-slate-400 w-20 flex-shrink-0">Template:</span><span className="font-semibold">{templates.find(t => t.id === form.template_id)?.name}</span></div>
                <div className="flex gap-3"><span className="text-slate-400 w-20 flex-shrink-0">Recipients:</span><span className="font-semibold text-blue-700">{recipientCount} contacts</span></div>
              </div>
              <div>
                <p className="label mb-2">Email Preview</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white" style={{ height: '400px' }}>
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-6 border-t flex justify-between">
          <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="btn-secondary">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < 2 ? (
            <button
              onClick={() => goToStep(step + 1)}
              disabled={step === 0 && (!form.name || !form.subject || !form.template_id)}
              className="btn-primary"
            >
              Next →
            </button>
          ) : (
            <button onClick={handleSend} disabled={sending} className="btn-primary">
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Campaign</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CampaignDetailModal({ campaign, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{campaign.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{campaign.subject}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{campaign.recipients_count}</p>
              <p className="text-xs text-slate-500 mt-1">Recipients</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{campaign.sent_count}</p>
              <p className="text-xs text-slate-500 mt-1">Sent</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{campaign.failed_count}</p>
              <p className="text-xs text-slate-500 mt-1">Failed</p>
            </div>
          </div>
          {campaign.logs && campaign.logs.length > 0 && (
            <div>
              <p className="label mb-3">Delivery Log</p>
              <div className="space-y-2">
                {campaign.logs.map(log => (
                  <div key={log.id} className={`flex items-center gap-3 p-3 rounded-lg ${log.status === 'sent' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {log.status === 'sent' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{log.contact_name}</p>
                      <p className="text-xs text-slate-500 truncate">{log.contact_email}</p>
                      {log.error && <p className="text-xs text-red-500 mt-0.5">{log.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t">
          <button onClick={onClose} className="btn-secondary w-full justify-center">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [viewCampaign, setViewCampaign] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const loadCampaigns = () => {
    setLoading(true)
    axios.get('/api/campaigns')
      .then(r => setCampaigns(r.data))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCampaigns() }, [])

  const handleView = async (campaign) => {
    const res = await axios.get(`/api/campaigns/${campaign.id}`)
    setViewCampaign(res.data)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/campaigns/${id}`)
      setCampaigns(prev => prev.filter(c => c.id !== id))
      toast.success('Campaign deleted')
      setDeleteConfirm(null)
    } catch {
      toast.error('Failed to delete campaign')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaigns</h1>
          <p className="text-slate-500 mt-1">{campaigns.length} total — send professional outreach emails to your contacts.</p>
        </div>
        <button onClick={() => setShowWizard(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card text-center py-20">
          <Mail className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No campaigns yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Create your first outreach campaign to start connecting with hospitals and nursing homes.
          </p>
          <button onClick={() => setShowWizard(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="card p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status === 'sent' ? 'bg-green-100' : 'bg-slate-100'}`}>
                {c.status === 'sent' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <span className={c.status === 'sent' ? 'badge-sent' : 'badge-draft'}>
                    {c.status === 'sent' ? 'Sent' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 truncate">{c.subject}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {c.status === 'sent'
                    ? `Sent ${new Date(c.sent_at).toLocaleDateString()} · ${c.sent_count} delivered · ${c.failed_count} failed`
                    : `Created ${new Date(c.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleView(c)} className="btn-secondary text-sm py-1.5 px-3">
                  <Eye className="w-3.5 h-3.5" />
                  Details
                </button>
                <button onClick={() => setDeleteConfirm(c)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <CampaignWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => { loadCampaigns(); setShowWizard(false) }}
        />
      )}
      {viewCampaign && (
        <CampaignDetailModal campaign={viewCampaign} onClose={() => setViewCampaign(null)} />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Campaign?</h3>
            <p className="text-slate-500 text-sm mb-5">
              Delete <strong>{deleteConfirm.name}</strong>? This will also remove all delivery logs.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
