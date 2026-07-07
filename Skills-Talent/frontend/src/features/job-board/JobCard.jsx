import { MapPin, Clock, Users, Wifi, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react'
import './JobCard.css'

function postedLabel(days) {
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  return `Il y a ${days} j`
}

export default function JobCard({ job, onSave, onClick, compact }) {
  const saved = job.saved ?? false

  const handleSave = (e) => {
    e.stopPropagation()
    onSave?.()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') onClick?.(job)
  }

  const salaryStr = `${(job.salary.min / 1000).toFixed(0)}k – ${(job.salary.max / 1000).toFixed(0)}k ${job.salary.currency}`

  return (
    <div
      className={`jc-card ${compact ? 'jc-card--compact' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(job)}
      onKeyDown={handleKey}
    >
      <div className="jc-top">
        <span className="jc-logo" aria-hidden="true">{job.logo}</span>
        <div className="jc-meta">
          <h3 className="jc-title">{job.title}</h3>
          <p className="jc-company">{job.company}</p>
        </div>
        <button
          className={`jc-save ${saved ? 'jc-save--active' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Retirer des favoris' : 'Sauvegarder'}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <div className="jc-badges">
        <span className="jc-badge">{job.type}</span>
        {job.remote && <span className="jc-badge jc-badge--remote"><Wifi size={10} /> Télétravail</span>}
        {job.featured && <span className="jc-badge jc-badge--featured">⭐ En vedette</span>}
      </div>

      {!compact && <p className="jc-description">{job.description}</p>}

      <div className="jc-info">
        <span className="jc-info-item"><MapPin size={13} />{job.location}</span>
        <span className="jc-info-item"><Clock size={13} />{postedLabel(job.postedDaysAgo)}</span>
        <span className="jc-info-item"><Users size={13} />{job.applicants} candidats</span>
      </div>

      <div className="jc-footer">
        <span className="jc-salary">💰 {salaryStr}</span>
        <span className="jc-apply">Voir l'offre <ChevronRight size={14} /></span>
      </div>

      {!compact && (
        <div className="jc-skills">
          {job.skills.slice(0, 4).map(s => (
            <span key={s} className="jc-skill">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}
