import { useState, useEffect, useCallback } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Briefcase, FileText, ShieldCheck,
  LogOut, Bell, TrendingUp, CheckCircle, XCircle, Clock,
  CircleUser, Search, AlertTriangle, Activity, ChevronRight,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import { getAdminStats, getAdminUsers, toggleUserStatus } from '../../api/AdminApi'
import './AdminStats.css'

const ROLE_META = {
  CANDIDATE: { label: 'Candidat',  cls: 'role--candidate' },
  EMPLOYER:  { label: 'Employeur', cls: 'role--employer'  },
  ADMIN:     { label: 'Admin',     cls: 'role--admin'     },
}

const DOT_TYPE = { user: 'dot--user', job: 'dot--job', check: 'dot--check', alert: 'dot--alert', file: 'dot--file' }

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
      </nav>
      <button className="ad-logout" onClick={onLogout}>
        <LogOut size={18} /> Déconnexion
      </button>
    </aside>
  )
}

export default function AdminStats() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [search, setSearch]             = useState('')
  const [activeTab, setActiveTab]       = useState('users')
  const [stats, setStats]               = useState(null)
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError]               = useState('')

  const handleLogout = () => { logout(); navigate('/login') }
  const adminName = user?.firstName || 'Administrateur'

  useEffect(() => {
    getAdminStats()
      .then(data => { setStats(data); setUsers(data.recentUsers || []) })
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = useCallback(async (q) => {
    setUsersLoading(true)
    try {
      const data = await getAdminUsers(q)
      setUsers(data)
    } catch {
      setError('Erreur lors de la recherche.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search, handleSearch])

  const handleToggle = async (userId) => {
    try {
      await toggleUserStatus(userId)
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      ))
      if (stats) {
        setStats(prev => ({ ...prev, activeUsers: prev.activeUsers + (users.find(u => u.id === userId)?.status === 'ACTIVE' ? -1 : 1) }))
      }
    } catch {
      setError('Impossible de modifier le statut de cet utilisateur.')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFFBF0' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#D97706' }} />
      </div>
    )
  }

  const totalUsers      = stats?.totalUsers        ?? 0
  const totalJobs       = stats?.totalJobs         ?? 0
  const totalApps       = stats?.totalApplications ?? 0
  const acceptedApps    = stats?.acceptedApplications ?? 0
  const totalCandidates = stats?.totalCandidates   ?? 0
  const totalEmployers  = stats?.totalEmployers    ?? 0
  const activity        = stats?.recentActivity    ?? []

  const candidatePct = totalUsers > 0 ? Math.round((totalCandidates / totalUsers) * 100) : 0
  const employerPct  = totalUsers > 0 ? Math.round((totalEmployers  / totalUsers) * 100) : 0
  const adminPct     = totalUsers > 0 ? Math.round(((totalUsers - totalCandidates - totalEmployers) / totalUsers) * 100) : 0

  return (
    <div className="ad-shell">
      <Sidebar onLogout={handleLogout} />

      <main className="ad-main">
        {/* Header */}
        <div className="ad-header">
          <div>
            <p className="ad-greeting">
              Panneau d&apos;administration — <span className="ad-greeting-name">{adminName}</span>
            </p>
            <p className="ad-greeting-sub">Gérez la plateforme SkillSet</p>
          </div>
          <div className="ad-header-right">
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

        {/* Stats grid */}
        <div className="ad-stats">
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--amber"><Users size={20} /></div>
            <div>
              <div className="ad-stat-value">{totalUsers}</div>
              <div className="ad-stat-label">Utilisateurs</div>
            </div>
            <div className="ad-stat-trend up"><TrendingUp size={12} /> {stats?.activeUsers ?? 0} actifs</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--indigo"><Briefcase size={20} /></div>
            <div>
              <div className="ad-stat-value">{totalJobs}</div>
              <div className="ad-stat-label">Offres</div>
            </div>
            <div className="ad-stat-trend up"><TrendingUp size={12} /> {stats?.openJobs ?? 0} ouvertes</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--cherry"><FileText size={20} /></div>
            <div>
              <div className="ad-stat-value">{totalApps}</div>
              <div className="ad-stat-label">Candidatures</div>
            </div>
            <div className="ad-stat-trend up"><TrendingUp size={12} /> {stats?.pendingApplications ?? 0} en attente</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--green"><CheckCircle size={20} /></div>
            <div>
              <div className="ad-stat-value">{acceptedApps}</div>
              <div className="ad-stat-label">Finalisées</div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="ad-grid">
          {/* Users table */}
          <div className="ad-content">
            <div className="ad-tabs">
              <button onClick={() => setActiveTab('users')} className={`ad-tab${activeTab === 'users' ? ' ad-tab--active' : ''}`}>
                <Users size={15} /> Users
              </button>
              <button onClick={() => setActiveTab('jobs')} className={`ad-tab${activeTab === 'jobs' ? ' ad-tab--active' : ''}`}>
                <Briefcase size={15} /> Offres
              </button>
            </div>

            {activeTab === 'users' && (
              <>
                <div className="ad-search-bar">
                  <Search size={16} className="ad-search-icon" />
                  <input
                    className="ad-search-input"
                    placeholder="Rechercher un utilisateur…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {usersLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#D97706', flexShrink: 0 }} />}
                </div>
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Inscrit le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const roleMeta = ROLE_META[u.role] || ROLE_META.CANDIDATE
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="ad-user-cell">
                              <CircleUser size={22} className="ad-user-avatar" />
                              <div>
                                <div className="ad-user-name">{u.name}</div>
                                <div className="ad-user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ad-role-badge ${roleMeta.cls}`}>{roleMeta.label}</span>
                          </td>
                          <td>
                            <span className={`ad-status-badge ${u.status === 'ACTIVE' ? 'st--active' : 'st--inactive'}`}>
                              {u.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {u.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td><span className="ad-date">{u.joinedAt}</span></td>
                          <td>
                            <div className="ad-actions">
                              <button className="ad-action-btn">Voir</button>
                              {u.status === 'ACTIVE'
                                ? <button onClick={() => handleToggle(u.id)} className="ad-action-btn ad-action-btn--danger">Désactiver</button>
                                : <button onClick={() => handleToggle(u.id)} className="ad-action-btn ad-action-btn--success">Activer</button>
                              }
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {users.length === 0 && !usersLoading && (
                      <tr>
                        <td colSpan={5}>
                          <div className="ad-empty">
                            <Users size={36} className="ad-empty-icon" />
                            <p>Aucun utilisateur trouvé</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button className="ad-see-all">
                  Gérer tous les utilisateurs <ChevronRight size={16} />
                </button>
              </>
            )}

            {activeTab === 'jobs' && (
              <div className="ad-empty">
                <Briefcase size={40} className="ad-empty-icon" />
                <p>Gestion des offres d&apos;emploi</p>
                <span>Fonctionnalité en cours d&apos;implémentation</span>
              </div>
            )}
          </div>

          {/* Activity sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Activity feed */}
            <div className="ad-activity">
              <div className="ad-section-title">
                <Activity size={16} /> Activité récente
              </div>
              <div className="ad-feed">
                {activity.length === 0
                  ? <span style={{ fontSize: 13, color: '#bbb' }}>Aucune activité récente</span>
                  : activity.map((a, i) => (
                    <div key={a.id || i} className="ad-feed-item">
                      <div className={`ad-feed-dot ${DOT_TYPE[a.type] ?? 'dot--check'}`} />
                      <div>
                        <div className="ad-feed-msg">{a.message}</div>
                        <div className="ad-feed-time"><Clock size={11} /> {a.time}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* User distribution bars */}
            <div className="ad-activity">
              <div className="ad-section-title"><TrendingUp size={16} /> Répartition</div>
              <div className="ad-quick-bar">
                <div className="ad-bar-item">
                  <span className="ad-bar-label">Candidats</span>
                  <div className="ad-bar-track">
                    <div className="ad-bar-fill ad-bar-fill--cherry" style={{ width: `${candidatePct}%` }} />
                  </div>
                  <span className="ad-bar-val">{totalCandidates}</span>
                </div>
                <div className="ad-bar-item">
                  <span className="ad-bar-label">Employeurs</span>
                  <div className="ad-bar-track">
                    <div className="ad-bar-fill ad-bar-fill--indigo" style={{ width: `${employerPct}%` }} />
                  </div>
                  <span className="ad-bar-val">{totalEmployers}</span>
                </div>
                <div className="ad-bar-item">
                  <span className="ad-bar-label">Admins</span>
                  <div className="ad-bar-track">
                    <div className="ad-bar-fill ad-bar-fill--amber" style={{ width: `${adminPct}%` }} />
                  </div>
                  <span className="ad-bar-val">{totalUsers - totalCandidates - totalEmployers}</span>
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="ad-alert">
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              {stats?.pendingApplications ?? 0} candidature(s) en attente de traitement
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
