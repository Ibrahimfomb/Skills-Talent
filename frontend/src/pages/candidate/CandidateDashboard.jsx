import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  Search, MapPin, Bell, MessageSquare, CircleUser,
  LogOut, Clock, X, Briefcase, FileText,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import './CandidateDashboard.css'

const SUGGESTIONS = [
  'Développeur web', 'Commercial', 'Comptable', 'Data analyst',
  'Chef de projet', 'Community manager', 'Infirmier', 'Graphiste',
  'Ressources humaines', 'Chargé de communication',
]

export default function CandidateDashboard() {
  const navigate   = useNavigate()
  const { user, logout } = useAuthStore()
  const firstName  = user?.firstName || 'vous'

  const [query, setQuery]       = useState('')
  const [location, setLocation] = useState('')
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`ss_searches_${user?.id}`) || '[]')
    } catch { return [] }
  })

  const doSearch = (q = query, l = location) => {
    const trimQ = q.trim()
    const trimL = l.trim()
    if (!trimQ && !trimL) return
    const entry = { id: Date.now(), q: trimQ, l: trimL }
    const updated = [entry, ...recentSearches.filter(s => !(s.q === trimQ && s.l === trimL))].slice(0, 6)
    setRecentSearches(updated)
    try { localStorage.setItem(`ss_searches_${user?.id}`, JSON.stringify(updated)) } catch { /* ignore */ }
    navigate(`/jobs?q=${encodeURIComponent(trimQ)}&location=${encodeURIComponent(trimL)}`)
  }

  const removeSearch = (id) => {
    const updated = recentSearches.filter(s => s.id !== id)
    setRecentSearches(updated)
    try { localStorage.setItem(`ss_searches_${user?.id}`, JSON.stringify(updated)) } catch { /* ignore */ }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="cd-shell">

      {/* ── Top Navigation ── */}
      <header className="cd-navbar">
        <div className="cd-navbar-brand">
          <span className="cd-logo-icon">S</span>
          <span className="cd-logo-text">SkillSet</span>
        </div>

        <nav className="cd-nav">
          <NavLink to="/dashboard/candidate" end className={({ isActive }) => `cd-nav-link ${isActive ? 'cd-nav-link--active' : ''}`}>
            Page d'accueil
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `cd-nav-link ${isActive ? 'cd-nav-link--active' : ''}`}>
            Offres d'emploi
          </NavLink>
          <NavLink to="/applications" className={({ isActive }) => `cd-nav-link ${isActive ? 'cd-nav-link--active' : ''}`}>
            Mes candidatures
          </NavLink>
        </nav>

        <div className="cd-navbar-actions">
          <NavLink to="/messages"      className="cd-icon-btn" aria-label="Messages"><MessageSquare size={20} /></NavLink>
          <NavLink to="/notifications" className="cd-icon-btn" aria-label="Notifications"><Bell size={20} /></NavLink>
          <NavLink to="/profile"       className="cd-icon-btn" aria-label="Profil"><CircleUser size={22} /></NavLink>
          <button                      className="cd-icon-btn" onClick={handleLogout} aria-label="Déconnexion"><LogOut size={20} /></button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="cd-main">

        {/* Search bar */}
        <div className="cd-search-wrap">
          <div className="cd-search-bar">
            <div className="cd-search-field">
              <Search size={17} className="cd-search-icon" />
              <input
                className="cd-search-input"
                placeholder="Intitulé de poste, mots-clés ou..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
            </div>
            <div className="cd-search-sep" />
            <div className="cd-search-field">
              <MapPin size={17} className="cd-search-icon" />
              <input
                className="cd-search-input"
                placeholder="Ville, département, code postal..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
            </div>
            <button className="cd-search-btn" onClick={() => doSearch()}>
              Rechercher
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="cd-content">
          <h1 className="cd-welcome">Bienvenue, <span className="cd-welcome-name">{firstName}</span></h1>

          {/* Recent searches */}
          <section className="cd-section">
            <h2 className="cd-section-title">Mes recherches récentes</h2>
            {recentSearches.length === 0 ? (
              <p className="cd-empty-hint">Vos dernières recherches s'afficheront ici.</p>
            ) : (
              <div className="cd-recent-list">
                {recentSearches.map(s => (
                  <div key={s.id} className="cd-recent-chip" onClick={() => { setQuery(s.q); setLocation(s.l); doSearch(s.q, s.l) }}>
                    <Clock size={14} />
                    <span className="cd-recent-label">{s.q || 'Toutes offres'}</span>
                    {s.l && <span className="cd-recent-loc">— {s.l}</span>}
                    <button
                      className="cd-recent-del"
                      onClick={e => { e.stopPropagation(); removeSearch(s.id) }}
                      aria-label="Supprimer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Suggestions */}
          <section className="cd-section">
            <h2 className="cd-section-title">Suggestions de recherche</h2>
            <div className="cd-suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="cd-suggestion"
                  onClick={() => { setQuery(s); doSearch(s, location) }}
                >
                  <Search size={13} />
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section className="cd-section cd-quick-links">
            <button className="cd-quick-card" onClick={() => navigate('/jobs')}>
              <Briefcase size={22} />
              <span>Explorer les offres</span>
            </button>
            <button className="cd-quick-card" onClick={() => navigate('/profile')}>
              <CircleUser size={22} />
              <span>Compléter mon profil</span>
            </button>
            <button className="cd-quick-card" onClick={() => navigate('/applications')}>
              <FileText size={22} />
              <span>Mes candidatures</span>
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
