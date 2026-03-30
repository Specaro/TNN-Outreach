import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Users, Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  Building2, Home, Phone, Mail, MapPin, X, ChevronDown,
} from 'lucide-react'

const EMPTY_FORM = {
  name: '', type: 'hospital', address: '', city: '', state: '',
  phone: '', email: '', contact_person: '', title: '', notes: '',
}

function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState(contact || EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      if (contact?.id) {
        const res = await axios.put(`/api/contacts/${contact.id}`, form)
        onSave(res.data, 'update')
      } else {
        const res = await axios.post('/api/contacts', form)
        onSave(res.data, 'create')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            {contact?.id ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Facility Name *</label>
              <input name="name" value={form.name} onChange={handle} className="input" placeholder="e.g. City General Hospital" required />
            </div>
            <div>
              <label className="label">Type *</label>
              <select name="type" value={form.type} onChange={handle} className="input">
                <option value="hospital">Hospital</option>
                <option value="nursing_home">Nursing Home / Long-Term Care</option>
              </select>
            </div>
            <div>
              <label className="label">Contact Person</label>
              <input name="contact_person" value={form.contact_person} onChange={handle} className="input" placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <label className="label">Title</label>
              <input name="title" value={form.title} onChange={handle} className="input" placeholder="e.g. HR Manager" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="staffing@hospital.com" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" value={form.phone} onChange={handle} className="input" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="label">Address</label>
              <input name="address" value={form.address} onChange={handle} className="input" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input name="city" value={form.city} onChange={handle} className="input" placeholder="New York" />
              </div>
              <div>
                <label className="label">State</label>
                <input name="state" value={form.state} onChange={handle} className="input" placeholder="NY" maxLength={2} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handle} rows={3} className="input resize-none" placeholder="Any additional notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : contact?.id ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [modal, setModal] = useState(null) // null | 'add' | contact object
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const loadContacts = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filterType !== 'all') params.type = filterType
    if (search) params.search = search
    axios.get('/api/contacts', { params })
      .then(r => setContacts(r.data))
      .catch(() => toast.error('Failed to load contacts'))
      .finally(() => setLoading(false))
  }, [filterType, search])

  useEffect(() => {
    const timer = setTimeout(loadContacts, 300)
    return () => clearTimeout(timer)
  }, [loadContacts])

  const handleSave = (contact, action) => {
    if (action === 'create') {
      toast.success('Contact added successfully')
      setContacts(prev => [...prev, contact].sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      toast.success('Contact updated')
      setContacts(prev => prev.map(c => c.id === contact.id ? contact : c))
    }
    setModal(null)
  }

  const handleToggle = async (contact) => {
    try {
      const res = await axios.patch(`/api/contacts/${contact.id}/toggle`)
      setContacts(prev => prev.map(c => c.id === contact.id ? res.data : c))
      toast.success(res.data.active ? 'Contact enabled' : 'Contact disabled')
    } catch {
      toast.error('Failed to update contact')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/contacts/${id}`)
      setContacts(prev => prev.filter(c => c.id !== id))
      toast.success('Contact deleted')
      setDeleteConfirm(null)
    } catch {
      toast.error('Failed to delete contact')
    }
  }

  const hospitals = contacts.filter(c => c.type === 'hospital')
  const nursingHomes = contacts.filter(c => c.type === 'nursing_home')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contacts</h1>
          <p className="text-slate-500 mt-1">
            {contacts.length} contacts — {hospitals.length} hospitals, {nursingHomes.length} nursing homes
          </p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search contacts, city, or email..."
          />
        </div>
        <div className="flex gap-2">
          {['all', 'hospital', 'nursing_home'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'all' ? 'All' : t === 'hospital' ? 'Hospitals' : 'Nursing Homes'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No contacts found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map(contact => (
                  <tr key={contact.id} className={`hover:bg-slate-50 transition-colors ${!contact.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{contact.name}</p>
                      {contact.phone && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />{contact.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={contact.type === 'hospital' ? 'badge-hospital' : 'badge-nursing'}>
                        {contact.type === 'hospital' ? 'Hospital' : 'Nursing Home'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {contact.contact_person ? (
                        <div>
                          <p className="text-slate-700 font-medium">{contact.contact_person}</p>
                          {contact.title && <p className="text-xs text-slate-400">{contact.title}</p>}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[160px]">{contact.email}</span>
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      {contact.city ? (
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{contact.city}{contact.state ? `, ${contact.state}` : ''}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${contact.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {contact.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleToggle(contact)}
                          title={contact.active ? 'Disable' : 'Enable'}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                        >
                          {contact.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setModal(contact)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(contact)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <ContactModal
          contact={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Contact?</h3>
            <p className="text-slate-500 text-sm mb-5">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
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
