import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Search, ChevronDown, Briefcase } from 'lucide-react'
import { getAdminJobs, changeJobStatus } from '../../api/AdminApi'
import './ModerationPanel.css'

const STATUS_LABELS = { OPEN: 'Ouverte', CLOSED: 'Fermée', DRAFT: 'Brouillon' }
const STATUS_OPTIONS = ['', 'OPEN', 'CLOSED', 'DRAFT']

export default function ModerationPanel() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [changing, setChanging] = useState({})

  const load = (status = filterStatus) => {
    setLoading(true)
    setError('')
    getAdminJobs(status)
      .then(setJobs)
      .catch(() => setError('Impossible de charger les offres.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus]) // eslint-disable-line

  const handleStatus = async (jobId, newStatus) => {
    setChanging(c => ({ ...c, [jobId]: true }))
    try {
      const updated = await changeJobStatus(jobId, newStatus)
      setJobs(js => js.map(j => j.id === jobId ? updated : j))
    } catch {
      setError('Erreur lors du changement de statut.')
    } finally {
      setChanging(c => ({ ...c, [jobId]: false }))
    }
  }

  const visible = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = { OPEN: 0, CLOSED: 0, DRAFT: 0 }
  jobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status]++ })

  return (
    <div className="mp-shell">
      <div className="mp-header">
        <h1 className="mp-title">Modération des offres</h1>
        <p className="mp-sub">Gérez la visibilité des offres d&apos;emploi publiées sur la plateforme.</p>
      </div>

      <div className="mp-kpis">
        <div className="mp-kpi mp-kpi--open">
          <CheckCircle size={20} />
          <div>
            <p className="mp-kpi-val">{counts.OPEN}</p>
            <p className="mp-kpi-label">Ouvertes</p>
          </div>
        </div>
        <div className="mp-kpi mp-kpi--closed">
          <XCircle size={20} />
          <div>
            <p className="mp-kpi-val">{counts.CLOSED}</p>
            <p className="mp-kpi-label">Fermées</p>
          </div>
        </div>
        <div className="mp-kpi mp-kpi--draft">
          <Clock size={20} />
          <div>
            <p className="mp-kpi-val">{counts.DRAFT}</p>
            <p className="mp-kpi-label">Brouillons</p>
          </div>
        </div>
        <div className="mp-kpi mp-kpi--total">
          <Briefcase size={20} />
          <div>
            <p className="mp-kpi-val">{jobs.length}</p>
            <p className="mp-kpi-label">Total</p>
          </div>
        </div>
      </div>

      <div className="mp-toolbar">
        <div className="mp-search-wrap">
          <Search size={15} className="mp-search-icon" />
          <input
            className="mp-search"
            placeholder="Rechercher par titre ou lieu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="mp-filter-wrap">
          <select
            className="mp-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s ? STATUS_LABELS[s] : 'Tous les statuts'}</option>
            ))}
          </select>
          <ChevronDown size={14} className="mp-filter-arrow" />
        </div>
      </div>

      {error && <p className="mp-error">{error}</p>}

      {loading ? (
        <div className="mp-loading">Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="mp-empty">
          <Briefcase size={40} color="#d4d2d0" />
          <p>Aucune offre trouvée.</p>
        </div>
      ) : (
        <div className="mp-table-wrap">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Lieu</th>
                <th>Type</th>
                <th>Candidatures</th>
                <th>Publiée le</th>
                <th>Expire le</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(job => (
                <tr key={job.id}>
                  <td className="mp-td-title">
                    <Link to={`/jobs/${job.id}`} className="mp-job-link" target="_blank" rel="noopener noreferrer">
                      {job.title}
                    </Link>
                  </td>
                  <td>{job.location || '—'}</td>
                  <td>{job.jobType || '—'}</td>
                  <td className="mp-td-center">{job.applicationCount}</td>
                  <td>{job.postedAt}</td>
                  <td>{job.expiresAt || '—'}</td>
                  <td>
                    <span className={`mp-badge mp-badge--${job.status.toLowerCase()}`}>
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </td>
                  <td>
                    <div className="mp-actions">
                      {job.status !== 'OPEN' && (
                        <button
                          className="mp-action-btn mp-action-btn--open"
                          disabled={changing[job.id]}
                          onClick={() => handleStatus(job.id, 'OPEN')}
                        >
                          Ouvrir
                        </button>
                      )}
                      {job.status !== 'CLOSED' && (
                        <button
                          className="mp-action-btn mp-action-btn--close"
                          disabled={changing[job.id]}
                          onClick={() => handleStatus(job.id, 'CLOSED')}
                        >
                          Fermer
                        </button>
                      )}
                      {job.status !== 'DRAFT' && (
                        <button
                          className="mp-action-btn mp-action-btn--draft"
                          disabled={changing[job.id]}
                          onClick={() => handleStatus(job.id, 'DRAFT')}
                        >
                          Brouillon
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
