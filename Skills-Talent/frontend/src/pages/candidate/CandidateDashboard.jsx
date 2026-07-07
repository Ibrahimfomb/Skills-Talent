import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, CircleUser,
  Clock, X, Briefcase, FileText, Sparkles,
  BookmarkCheck, CalendarCheck,
} from 'lucide-react'
import { useAuthStore }     from '../../store/AuthStore'
import { useUserDataStore } from '../../store/UserDataStore'
import { getRecommendedJobs, profileCompleteness } from '../../utils/matchingUtils'
import AppNavbar            from '../../components/common/AppNavbar'
import './CandidateDashboard.css'

const SUGGESTIONS = [
  'Développeur web', 'Commercial', 'Comptable', 'Data analyst',
  'Chef de projet', 'Community manager', 'Infirmier', 'Graphiste',
  'Ressources humaines', 'Chargé de communication',
]

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const { user }                                = useAuthStore()
  const { savedJobs, applications, interviews } = useUserDataStore()
  const firstName = user?.firstName || 'vous'

  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ss_profile') || 'null') ?? user } catch { return user }
  }, [user])

  const recommendedJobs = useMemo(() => getRecommendedJobs(profile, 3), [profile])
  const completeness    = useMemo(() => profileCompleteness(profile), [profile])

  const [query, setQuery]       = useState('')
  const [location, setLocation] = useState('')
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ss_searches_${user?.id}`) || '[]') } catch { return [] }
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

  return (
    <div className="cd-shell">
      <div className="cd-blob cd-blob--main" />
      <div className="cd-blob cd-blob--accent" />

      <AppNavbar />

      {/* ── Zone de recherche (dégradé rosé) ── */}
      <div className="cd-search-wrap">
        <div className="cd-search-bar">
          <div className="cd-search-field">
            <Search size={16} className="cd-search-icon" />
            <input
              className="cd-search-input"
              placeholder="Poste, compétences, mots-clés…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
          </div>
          <div className="cd-search-sep" />
          <div className="cd-search-field">
            <MapPin size={16} className="cd-search-icon" />
            <input
              className="cd-search-input"
              placeholder="Ville ou code postal…"
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

      {/* ── Contenu principal ── */}
      <main className="cd-main">
        <div className="cd-content">

          <p className="cd-welcome">
            Bonjour, <span className="cd-welcome-name">{firstName}</span> 👋
          </p>

          {/* Complétude du profil */}
          {completeness < 100 && (
            <div className="cd-profile-bar-wrap">
              <div className="cd-profile-bar-info">
                <span>Profil complété à <strong>{completeness}%</strong></span>
              </div>
              <div className="cd-profile-bar-track">
                <div className="cd-profile-bar-fill" style={{ width: `${completeness}%` }} />
              </div>
              <button className="cd-profile-bar-btn" onClick={() => navigate('/profile')}>
                Compléter mon profil →
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="cd-stats-row">
            <div className="cd-stat-chip">
              <Briefcase size={14} />
              {applications.length} Candidature{applications.length !== 1 ? 's' : ''}
            </div>
            <div className="cd-stat-chip">
              <BookmarkCheck size={14} />
              {savedJobs.length} Offre{savedJobs.length !== 1 ? 's' : ''} sauvegardée{savedJobs.length !== 1 ? 's' : ''}
            </div>
            <div className="cd-stat-chip">
              <CalendarCheck size={14} />
              {interviews.length} Entretien{interviews.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Recommandations STELLA */}
          {recommendedJobs.length > 0 && (
            <div className="cd-section">
              <p className="cd-section-title">
                <Sparkles size={14} /> Recommandations STELLA
              </p>
              <div className="cd-recommended-list">
                {recommendedJobs.map(job => (
                  <button
                    key={job.id}
                    className="cd-recommended-card"
                    onClick={() => navigate(`/jobs?q=${encodeURIComponent(job.title)}`)}
                  >
                    <span className="cd-rec-logo">{job.logo}</span>
                    <div className="cd-rec-info">
                      <p className="cd-rec-title">{job.title}</p>
                      <p className="cd-rec-company">{job.company} · {job.location}</p>
                    </div>
                    <span className="cd-rec-match">{job.matchPct}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recherches récentes */}
          <div className="cd-section">
            <p className="cd-section-title">
              <Clock size={14} /> Recherches récentes
            </p>
            {recentSearches.length === 0 ? (
              <p className="cd-empty-hint">Aucune recherche enregistrée.</p>
            ) : (
              <div className="cd-recent-list">
                {recentSearches.map(s => (
                  <div key={s.id} className="cd-recent-chip">
                    <button
                      className="cd-recent-chip-btn"
                      onClick={() => { setQuery(s.q); setLocation(s.l); doSearch(s.q, s.l) }}
                    >
                      {s.q || 'Toutes offres'}
                      {s.l && <span className="cd-recent-loc">· {s.l}</span>}
                    </button>
                    <button
                      className="cd-recent-del"
                      onClick={() => removeSearch(s.id)}
                      aria-label="Supprimer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="cd-section">
            <p className="cd-section-title">Suggestions</p>
            <div className="cd-suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="cd-suggestion"
                  onClick={() => { setQuery(s); doSearch(s, location) }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Accès rapides */}
          <div className="cd-section">
            <p className="cd-section-title">Accès rapides</p>
            <div className="cd-quick-links">
              {[
                { icon: <Briefcase size={22} />,  label: 'Explorer les offres', path: '/jobs'         },
                { icon: <CircleUser size={22} />,  label: 'Mon profil',          path: '/profile'      },
                { icon: <FileText size={22} />,    label: 'Mes candidatures',    path: '/applications' },
              ].map(({ icon, label, path }) => (
                <button key={path} className="cd-quick-card" onClick={() => navigate(path)}>
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
