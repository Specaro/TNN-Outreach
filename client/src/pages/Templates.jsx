import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { FileText, Eye, X, Send } from 'lucide-react'

function PreviewModal({ template, onClose, onUse }) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.post('/api/emails/preview', {
      template_id: template.id,
      custom_message: '',
      contact_name: 'Healthcare Partner',
    }).then(r => {
      setHtml(r.data.html)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load preview')
      setLoading(false)
    })
  }, [template.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{template.icon} {template.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <iframe
              srcDoc={html}
              className="w-full h-full rounded-xl border border-slate-200"
              title={template.name}
              sandbox="allow-same-origin"
              style={{ minHeight: '500px' }}
            />
          )}
        </div>
        <div className="p-6 border-t flex justify-between">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button onClick={onUse} className="btn-primary">
            <Send className="w-4 h-4" />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/emails/templates').then(r => setTemplates(r.data))
  }, [])

  const handleUse = (template) => {
    setPreview(null)
    navigate('/campaigns', { state: { template_id: template.id } })
  }

  const colors = [
    'from-blue-800 to-blue-700',
    'from-blue-600 to-blue-500',
    'from-blue-700 to-blue-600',
    'from-blue-900 to-blue-700',
    'from-blue-500 to-blue-400',
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Email Templates</h1>
        <p className="text-slate-500 mt-1">
          Professional, beautifully designed email templates ready for your outreach campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {templates.map((t, i) => (
          <div key={t.id} className="card overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className={`h-28 bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center`}>
              <span className="text-5xl">{t.icon}</span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-800 text-base">{t.name}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{t.description}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setPreview(t)}
                  className="btn-secondary flex-1 justify-center text-sm py-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => handleUse(t)}
                  className="btn-primary flex-1 justify-center text-sm py-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Use
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-0">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">How Templates Work</h3>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
              Each template is a professional HTML email designed to showcase your staffing agency.
              When you send a campaign, each email is automatically personalized with the recipient's
              name, your company details, and any custom message you add. Configure your company
              information in <strong className="text-blue-400">Settings</strong> to personalize all templates.
            </p>
          </div>
        </div>
      </div>

      {preview && (
        <PreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onUse={() => handleUse(preview)}
        />
      )}
    </div>
  )
}
