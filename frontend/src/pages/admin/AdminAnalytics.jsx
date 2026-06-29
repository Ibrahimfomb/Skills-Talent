import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import {
  LayoutDashboard, Users, Briefcase, FileText, ShieldCheck, BarChart2,
  LogOut, Bell, Clock, TrendingUp, CircleUser, Loader2, AlertTriangle, Download,
} from 'lucide-react'
import { useAuthStore }                      from '../../store/AuthStore'
import { getAdminAnalytics, exportApplicationsCsv } from '../../api/AdminApi'
import './AdminStats.css'
import './AdminAnalytics.css'

function Sidebar({ onLogout }) {
  return (
    <aside className="ad-sidebar">
      <div className="ad-sidebar-logo">
        <div className="ad-logo-icon">S</div>
        <span className="ad-logo-text">SkillSet</span>
        <span className="ad-admin-badge">Admin</span>
      </div>
      <nav className="ad-nav">
        <NavLink to="/dashboard/admin" end className={({ isActive }) => `ad-nav-item${isActive ? ' ad-nav-item--active' : ''}`}>
          <LayoutDashboard size={18} /> Vue d&apos;ensemble
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `ad-nav-item${isActive ? ' ad-nav-item--active' : ''}`}>
          <Users size={18} /> Utilisateurs
        </NavLink>
        <NavLink to="/admin/jobs" className={({ isActive }) => `ad-nav-item${isActive ? ' ad-nav-item--active' : ''}`}>
          <Briefcase size={18} /> Offres d&apos;emploi
        </NavLink>
        <NavLink to="/admin/applications" className={({ isActive }) => `ad-nav-item${isActive ? ' ad-nav-item--active' : ''}`}>
          <FileText size={18} /> Candidatures
        </NavLink>
        <NavLink to="/admin/moderation" className={({ isActive }) => `ad-nav-item${isActive ? ' ad-nav-item--active' : ''}`}>
          <ShieldCheck size={18} /> Modération
        </NavLink>
        <NavLink to="/admin/analytics" className={({ isActive }) => `ad-nav-item${isActive ? ' ad-nav-item--active' : ''}`}>
          <BarChart2 size={18} /> Analytics
        </NavLink>
      </nav>
      <button className="ad-logout" onClick={onLogout}>
        <LogOut size={18} /> Déconnexion
      </button>
    </aside>
  )
}

const FUNNEL_LABELS = {
  SUBMITTED: 'Soumis',
  SCREENING: 'Screening',
  INTERVIEW: 'Entretien',
  OFFER:     'Offre',
  APPROVED:  'Accepté',
  REJECTED:  'Refusé',
}

const FUNNEL_COLORS = {
  SUBMITTED: '#2b4fbf',
  SCREENING: '#a05a00',
  INTERVIEW: '#7c3aed',
  OFFER:     '#0d7a5f',
  APPROVED:  '#1a6e44',
  REJECTED:  '#c42033',
}

function fmtHours(h) {
  if (h == null) return '—'
  if (h < 24) return `${Math.round(h)} h`
  return `${(h / 24).toFixed(1)} j`
}

const RATE_LABELS = {
  SUBMITTED_TO_SCREENING: 'Soumis → Screening',
  SCREENING_TO_INTERVIEW: 'Screening → Entretien',
  INTERVIEW_TO_OFFER:     'Entretien → Offre',
  OFFER_TO_APPROVED:      'Offre → Accepté',
}

export default function AdminAnalytics() {
  const navigate   = useNavigate()
  const { user, logout } = useAuthStore()
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [exporting,  setExporting]  = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  useEffect(() => {
    getAdminAnalytics()
      .then(setData)
      .catch(() => setError('Impossible de charger les analytics.'))
      .finally(() => setLoading(false))
  }, [])

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      const blob = await exportApplicationsCsv()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'candidatures.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Erreur lors de l\'export CSV.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFFBF0' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#D97706' }} />
      </div>
    )
  }

  const funnelData = data?.conversionFunnel
    ? Object.entries(data.conversionFunnel).map(([key, value]) => ({
        name:  FUNNEL_LABELS[key] ?? key,
        key,
        count: value,
        fill:  FUNNEL_COLORS[key] ?? '#888',
      }))
    : []

  const weeklyData = data?.weeklyApplications ?? []
  const topJobs    = data?.topJobs ?? []
  const rates      = data?.conversionRates ?? {}
  const totalApps  = Object.values(data?.conversionFunnel ?? {}).reduce((a, b) => a + b, 0)

  return (
    <div className="ad-shell">
      <Sidebar onLogout={handleLogout} />

      <main className="ad-main">
        <div className="ad-header">
          <div>
            <p className="ad-greeting">Analytics recrutement — <span className="ad-greeting-name">{user?.firstName || 'Admin'}</span></p>
            <p className="ad-greeting-sub">Métriques en temps réel de votre pipeline</p>
          </div>
          <div className="ad-header-right">
            <button
              className="an-export-btn"
              onClick={handleExportCsv}
              disabled={exporting}
              title="Exporter les candidatures en CSV"
            >
              {exporting
                ? <Loader2 size={15} className="an-spin" />
                : <Download size={15} />}
              {exporting ? 'Export…' : 'Export CSV'}
            </button>
            <button className="ad-icon-btn" aria-label="Notifications"><Bell size={18} /></button>
            <CircleUser size={32} className="ad-avatar" />
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fde8ea', border: '1px solid #f5c0c8', borderRadius: 10, color: '#c42033', fontSize: 14, marginBottom: 24 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* KPI row */}
        <div className="an-grid">
          <div className="an-kpi">
            <div className="an-kpi-icon an-kpi-icon--blue"><Clock size={20} /></div>
            <div>
              <p className="an-kpi-label">Temps moyen de recrutement</p>
              <p className="an-kpi-value">{fmtHours(data?.avgTimeToHireHours)}</p>
              <p className="an-kpi-sub">de la candidature à l&apos;acceptation</p>
            </div>
          </div>
          <div className="an-kpi">
            <div className="an-kpi-icon an-kpi-icon--green"><TrendingUp size={20} /></div>
            <div>
              <p className="an-kpi-label">Candidatures acceptées</p>
              <p className="an-kpi-value">{data?.conversionFunnel?.APPROVED ?? 0}</p>
              <p className="an-kpi-sub">sur {totalApps} au total</p>
            </div>
          </div>
        </div>

        {/* Weekly trend */}
        {weeklyData.length > 0 && (
          <div className="an-card">
            <p className="an-card-title">Candidatures — 7 derniers jours</p>
            <p className="an-card-sub">Nombre de nouvelles candidatures par jour</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [v, 'Candidatures']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="count" stroke="#2b4fbf" strokeWidth={2} dot={{ r: 4, fill: '#2b4fbf' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Conversion funnel chart */}
        <div className="an-card">
          <p className="an-card-title">Entonnoir de conversion</p>
          <p className="an-card-sub">Nombre de candidatures par étape</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData} barCategoryGap="30%" margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [v, 'Candidatures']}
                contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {funnelData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion rates */}
        {Object.keys(rates).length > 0 && (
          <div className="an-card">
            <p className="an-card-title">Taux de conversion par étape</p>
            <p className="an-card-sub">Pourcentage de candidats passant à l&apos;étape suivante</p>
            <div className="an-rates">
              {Object.entries(rates).map(([key, rate]) => (
                <div key={key} className="an-rate-item">
                  <span className="an-rate-label">{RATE_LABELS[key] ?? key}</span>
                  <div className="an-rate-bar-wrap">
                    <div className="an-rate-bar" style={{ width: `${Math.min(rate, 100)}%` }} />
                  </div>
                  <span className="an-rate-pct">{rate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top jobs table */}
        {topJobs.length > 0 && (
          <div className="an-card">
            <p className="an-card-title">Top postes (candidatures acceptées)</p>
            <table className="an-table">
              <thead>
                <tr>
                  <th>Poste</th>
                  <th className="an-th-num">Acceptés</th>
                  <th className="an-th-num">Délai moyen</th>
                </tr>
              </thead>
              <tbody>
                {topJobs.map((j) => (
                  <tr key={j.jobTitle}>
                    <td>{j.jobTitle}</td>
                    <td className="an-td-num">{j.applicationCount}</td>
                    <td className="an-td-num">{fmtHours(j.avgTimeToHireHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
