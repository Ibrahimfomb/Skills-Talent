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

/* ─── Sidebar ────────────────────────────────────────────────── */
function Sidebar({ onLogout }) {
  return (
    <aside className="ad-sidebar">
      <div className="ad-sidebar-logo">
        <div className="ad-logo-icon">S</div>
        <span className="ad-logo-text">SkillSet</span>
        <span className="ad-admin-badge">Admin</span>
      </div>
      <nav className="ad-nav">
        <NavLink to="/dashboard/admin" end className={({ isActive }) => `ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}>
          <LayoutDashboard size={18} /><span>Vue d'ensemble</span>
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}>
          <Users size={18} /><span>Utilisateurs</span>
        </NavLink>
        <NavLink to="/admin/jobs" className={({ isActive }) => `ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}>
          <Briefcase size={18} /><span>Offres d'emploi</span>
        </NavLink>
        <NavLink to="/admin/applications" className={({ isActive }) => `ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}>
          <FileText size={18} /><span>Candidatures</span>
        </NavLink>
        <NavLink to="/admin/moderation" className={({ isActive }) => `ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}>
          <ShieldCheck size={18} /><span>Modération</span>
        </NavLink>
      </nav>
      <button className="ad-logout" onClick={onLogout}>
        <LogOut size={16} /><span>Déconnexion</span>
      </button>
    </aside>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function AdminStats() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('users')

  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError]         = useState('')

  const handleLogout = () => { logout(); navigate('/login') }
  const adminName = user?.firstName || 'Administrateur'

  /* Fetch global stats on mount */
  useEffect(() => {
    getAdminStats()
      .then(data => { setStats(data); setUsers(data.recentUsers || []) })
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [])

  /* Search users */
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

  /* Toggle user active/inactive */
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
      <div className="ad-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="ob-spinner" />
      </div>
    )
  }

  const totalUsers      = stats?.totalUsers      ?? 0
  const totalJobs       = stats?.totalJobs       ?? 0
  const totalApps       = stats?.totalApplications ?? 0
  const acceptedApps    = stats?.acceptedApplications ?? 0
  const totalCandidates = stats?.totalCandidates ?? 0
  const totalEmployers  = stats?.totalEmployers  ?? 0
  const activity        = stats?.recentActivity  ?? []

  const candidatePct = totalUsers > 0 ? Math.round((totalCandidates / totalUsers) * 100) : 0
  const employerPct  = totalUsers > 0 ? Math.round((totalEmployers  / totalUsers) * 100) : 0

  return (
    <div className="ad-shell">
      <Sidebar onLogout={handleLogout} />

      <main className="ad-main">
        {/* ── Header ── */}
        <header className="ad-header">
          <div>
            <h1 className="ad-greeting">
              Panneau d'administration — <span className="ad-greeting-name">{adminName}</span>
            </h1>
            <p className="ad-greeting-sub">Gérez la plateforme SkillSet</p>
          </div>
          <div className="ad-header-right">
            <button className="ad-icon-btn"><Bell size={20} /></button>
            <div className="ad-avatar"><CircleUser size={34} /></div>
          </div>
        </header>

        {error && <div className="ad-alert" style={{ margin: '0 0 1rem' }}><AlertTriangle size={16} /><p>{error}</p></div>}

        {/* ── Global stats ── */}
        <section className="ad-stats">
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--amber"><Users size={20} /></div>
            <div>
              <p className="ad-stat-value">{totalUsers}</p>
              <p className="ad-stat-label">Utilisateurs total</p>
            </div>
            <div className="ad-stat-trend up"><TrendingUp size={14} /> {stats?.activeUsers ?? 0} actifs</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--indigo"><Briefcase size={20} /></div>
            <div>
              <p className="ad-stat-value">{totalJobs}</p>
              <p className="ad-stat-label">Offres publiées</p>
            </div>
            <div className="ad-stat-trend up"><TrendingUp size={14} /> {stats?.openJobs ?? 0} ouvertes</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--cherry"><FileText size={20} /></div>
            <div>
              <p className="ad-stat-value">{totalApps}</p>
              <p className="ad-stat-label">Candidatures</p>
            </div>
            <div className="ad-stat-trend up"><TrendingUp size={14} /> {stats?.pendingApplications ?? 0} en attente</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon--green"><CheckCircle size={20} /></div>
            <div>
              <p className="ad-stat-value">{acceptedApps}</p>
              <p className="ad-stat-label">Recrutements finalisés</p>
            </div>
          </div>
        </section>

        <div className="ad-grid">
          {/* ── Users table ── */}
          <section className="ad-content">
            <div className="ad-tabs">
              <button className={`ad-tab ${activeTab === 'users' ? 'ad-tab--active' : ''}`} onClick={() => setActiveTab('users')}>
                <Users size={15} /> Utilisateurs
              </button>
              <button className={`ad-tab ${activeTab === 'jobs' ? 'ad-tab--active' : ''}`} onClick={() => setActiveTab('jobs')}>
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
                  {usersLoading && <Loader2 size={16} className="ob-spinner" style={{ marginLeft: 8 }} />}
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
                              <div className="ad-user-avatar"><CircleUser size={26} /></div>
                              <div>
                                <p className="ad-user-name">{u.name}</p>
                                <p className="ad-user-email">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className={`ad-role-badge ${roleMeta.cls}`}>{roleMeta.label}</span></td>
                          <td>
                            <span className={`ad-status-badge ${u.status === 'ACTIVE' ? 'st--active' : 'st--inactive'}`}>
                              {u.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {u.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="ad-date">{u.joinedAt}</td>
                          <td>
                            <div className="ad-actions">
                              <button className="ad-action-btn">Voir</button>
                              {u.status === 'ACTIVE'
                                ? <button className="ad-action-btn ad-action-btn--danger" onClick={() => handleToggle(u.id)}>Désactiver</button>
                                : <button className="ad-action-btn ad-action-btn--success" onClick={() => handleToggle(u.id)}>Activer</button>
                              }
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {users.length === 0 && !usersLoading && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Aucun utilisateur trouvé</td></tr>
                    )}
                  </tbody>
                </table>
                <button className="ad-see-all">Gérer tous les utilisateurs <ChevronRight size={14} /></button>
              </>
            )}

            {activeTab === 'jobs' && (
              <div className="ad-empty">
                <Briefcase size={40} className="ad-empty-icon" />
                <p>Gestion des offres d'emploi</p>
                <span>Fonctionnalité en cours d'implémentation</span>
              </div>
            )}
          </section>

          {/* ── Activity feed ── */}
          <section className="ad-activity">
            <h3 className="ad-section-title"><Activity size={16} /> Activité récente</h3>
            <div className="ad-feed">
              {activity.length === 0
                ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Aucune activité récente</p>
                : activity.map((a, i) => (
                  <div key={i} className="ad-feed-item">
                    <div className={`ad-feed-dot dot--${a.type}`} />
                    <div>
                      <p className="ad-feed-msg">{a.message}</p>
                      <p className="ad-feed-time"><Clock size={11} /> {a.time}</p>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* User distribution */}
            <div className="ad-quick">
              <h4 className="ad-quick-title">Répartition des utilisateurs</h4>
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
                    <div className="ad-bar-fill ad-bar-fill--amber" style={{ width: '5%' }} />
                  </div>
                  <span className="ad-bar-val">{totalUsers - totalCandidates - totalEmployers}</span>
                </div>
              </div>
            </div>

            <div className="ad-alert">
              <AlertTriangle size={16} />
              <p>{stats?.pendingApplications ?? 0} candidature(s) en attente de traitement</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
