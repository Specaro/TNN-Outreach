import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  Users, Mail, Send, Building2, Home, TrendingUp, Plus, ArrowRight, CheckCircle, Clock,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/contacts/stats/summary'),
      axios.get('/api/campaigns/stats/summary'),
      axios.get('/api/campaigns'),
    ]).then(([contactsRes, campaignsRes, allCampaigns]) => {
      setStats({ contacts: contactsRes.data, campaigns: campaignsRes.data })
      setCampaigns(allCampaigns.data.slice(0, 5))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-3">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back — here's your outreach overview.</p>
        </div>
        <Link to="/campaigns" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Total Contacts" value={stats?.contacts.total ?? 0}
          sub={`${stats?.contacts.active ?? 0} active`} color="bg-blue-600" />
        <StatCard icon={Building2} label="Hospitals" value={stats?.contacts.hospitals ?? 0}
          sub="Top US facilities" color="bg-indigo-500" />
        <StatCard icon={Home} label="Nursing Homes" value={stats?.contacts.nursingHomes ?? 0}
          sub="Senior care facilities" color="bg-purple-500" />
        <StatCard icon={Send} label="Emails Sent" value={stats?.campaigns.totalEmailsSent ?? 0}
          sub={`${stats?.campaigns.sent ?? 0} campaigns`} color="bg-emerald-500" />
      </div>

      {/* Quick Actions + Recent Campaigns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/campaigns" className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Send Email Campaign</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/contacts" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Manage Contacts</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/templates" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Browse Templates</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/settings" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Configure Email (SMTP)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Recent Campaigns
            </h2>
            <Link to="/campaigns" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-10">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No campaigns yet.</p>
              <Link to="/campaigns" className="btn-primary mt-4 text-sm">
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                  <div className="flex-shrink-0">
                    {c.status === 'sent' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.subject}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={c.status === 'sent' ? 'badge-sent' : 'badge-draft'}>
                      {c.status === 'sent' ? 'Sent' : 'Draft'}
                    </span>
                    {c.status === 'sent' && (
                      <p className="text-xs text-slate-400 mt-1">{c.sent_count} sent</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Banner */}
      <div className="mt-6 card p-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Ready to reach out?</h3>
            <p className="text-blue-100 text-sm mt-1">
              You have {stats?.contacts.active ?? 0} active contacts across {stats?.contacts.hospitals ?? 0} hospitals and {stats?.contacts.nursingHomes ?? 0} nursing homes.
            </p>
          </div>
          <Link to="/campaigns" className="flex-shrink-0 px-5 py-2.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm">
            Start a Campaign
          </Link>
        </div>
      </div>
    </div>
  )
}
