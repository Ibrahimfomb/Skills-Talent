import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleUser,
  MapPin, Clock, ChevronRight, Video, Building2, AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { useUserDataStore } from '../../store/UserDataStore'
import AppNavbar            from '../../components/common/AppNavbar'
import './MyApplications.css'

const STAGE_STEPS = ['CV transmis', 'Test technique', 'Entretien RH', 'Entretien final', 'Décision']

const STATUS_STYLE = {
  'En cours':   { background: '#dbeafe', color: '#1d4ed8' },
  'En attente': { background: '#fef3c7', color: '#92400e' },
  'Refusé':     { background: '#fde8ea', color: '#c42033' },
  'Confirmé':   { background: '#dcfce7', color: '#166534' },
}

export default function MyApplications() {
  const navigate = useNavigate()
  const { savedJobs, applications, interviews, archives, unsaveJob } = useUserDataStore()

  const [activeTab, setActiveTab] = useState('saved')

  const TABS = [
    { id: 'saved',        count: savedJobs.length,    label: 'Emplois enregistrés' },
    { id: 'applications', count: applications.length, label: 'Candidatures' },
    { id: 'interviews',   count: interviews.length,   label: 'Entretiens' },
    { id: 'archives',     count: archives.length,     label: 'Archivées' },
  ]

  return (
    <div className="ma-shell">
      <div className="ma-blob ma-blob--main" />
      <div className="ma-blob ma-blob--accent" />

      <AppNavbar />

      {/* Page header */}
      <div className="ma-page-header">
        <h1 className="ma-page-title">Mes emplois</h1>
      </div>

      {/* Tab bar */}
      <div className="ma-tabs-wrap">
        <div className="ma-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ma-tab${activeTab === tab.id ? ' ma-tab--active' : ''}`}
            >
              <span className="ma-tab-count">{tab.count}</span>
              <span className="ma-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="ma-tabs-line" />
      </div>

      {/* Content */}
      <div className="ma-content">

        {/* ── SAVED JOBS ── */}
        {activeTab === 'saved' && (
          <div className="ma-list">
            {savedJobs.length === 0 && (
              <div className="ma-empty">
                <div className="ma-empty-illo">🔖</div>
                <p className="ma-empty-title">Aucun emploi enregistré</p>
                <p className="ma-empty-hint">Les offres que vous enregistrez sont affichées ici.</p>
                <button className="ma-cta-btn" onClick={() => navigate('/jobs')}>
                  Rechercher un emploi <ArrowRight size={15} />
                </button>
              </div>
            )}
            {savedJobs.map(job => (
              <div key={job.id} className="ma-job-row">
                <span className="ma-job-logo">{job.logo}</span>
                <div className="ma-job-info">
                  <p className="ma-job-title">{job.title}</p>
                  <p className="ma-job-company">{job.company}</p>
                  <div className="ma-job-meta">
                    <span><MapPin size={11} />{job.location}</span>
                    <span><Clock size={11} />Sauvegardé le {job.savedAt?.split('T')[0]}</span>
                    {job.type && <span className="ma-badge">{job.type}</span>}
                  </div>
                </div>
                <div className="ma-job-actions">
                  <button className="ma-btn-primary" onClick={() => navigate('/jobs')}>Voir l&apos;offre</button>
                  <button className="ma-btn-ghost" onClick={() => unsaveJob(job.id)}>Retirer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {activeTab === 'applications' && (
          <div className="ma-list">
            {applications.length === 0 && (
              <div className="ma-empty">
                <div className="ma-empty-illo">📄</div>
                <p className="ma-empty-title">Aucune candidature envoyée</p>
                <p className="ma-empty-hint">Postulez à des offres pour suivre vos candidatures ici.</p>
                <button className="ma-cta-btn" onClick={() => navigate('/jobs')}>
                  Chercher un emploi <ArrowRight size={15} />
                </button>
              </div>
            )}
            {applications.map(app => (
              <div key={app.id} className="ma-app-row">
                <div className="ma-app-head">
                  <span className="ma-job-logo">{app.logo || '💼'}</span>
                  <div className="ma-job-info">
                    <p className="ma-job-title">{app.jobTitle}</p>
                    <p className="ma-job-company">{app.company}{app.location ? ` · ${app.location}` : ''}</p>
                  </div>
                  <span
                    className="ma-status-badge"
                    style={STATUS_STYLE[app.status] ?? { background: '#f3f2f1', color: '#595959' }}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="ma-app-meta">
                  <span><Clock size={11} />Postulé le {app.appliedDate}</span>
                  {app.type   && <span className="ma-badge">{app.type}</span>}
                  {app.salary && <span className="ma-salary-text">{app.salary}</span>}
                </div>
                {app.status !== 'Refusé' && (
                  <div className="ma-pipeline">
                    {STAGE_STEPS.map((s, i) => {
                      const done    = i < (app.stageIndex ?? 0)
                      const current = i === (app.stageIndex ?? 0)
                      return (
                        <div key={s} className="ma-pipeline-step">
                          {i < STAGE_STEPS.length - 1 && (
                            <div className={`ma-pipeline-line${done ? ' done' : ''}`} />
                          )}
                          <div className={`ma-pipeline-dot${done ? ' done' : current ? ' current' : ''}`} />
                          <span className={`ma-pipeline-label${current ? ' current' : ''}`}>{s}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {app.status === 'Refusé' && (
                  <div className="ma-refused-note">
                    <AlertCircle size={13} /> {app.stage || 'Candidature non retenue'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── INTERVIEWS ── */}
        {activeTab === 'interviews' && (
          <div className="ma-list">
            {interviews.length === 0 && (
              <div className="ma-empty">
                <div className="ma-empty-illo">📅</div>
                <p className="ma-empty-title">Aucun entretien prévu</p>
                <p className="ma-empty-hint">Vos entretiens programmés apparaîtront ici.</p>
              </div>
            )}
            {interviews.map(itv => (
              <div key={itv.id} className="ma-interview-row">
                <div className="ma-itv-head">
                  <span className="ma-job-logo">{itv.logo || '🏢'}</span>
                  <div className="ma-job-info">
                    <p className="ma-job-title">{itv.jobTitle}</p>
                    <p className="ma-job-company">{itv.company}</p>
                  </div>
                  <span
                    className="ma-status-badge"
                    style={{ background: '#dcfce7', color: '#166534' }}
                  >
                    {itv.status}
                  </span>
                </div>
                <div className="ma-itv-details">
                  <div className="ma-itv-detail-item">
                    <Clock size={14} className="ma-itv-icon" />
                    <div>
                      <p className="ma-itv-label">Date &amp; heure</p>
                      <p className="ma-itv-value">{itv.date} à {itv.time}</p>
                    </div>
                  </div>
                  <div className="ma-itv-detail-item">
                    {itv.type === 'Visioconférence'
                      ? <Video size={14} className="ma-itv-icon" />
                      : <Building2 size={14} className="ma-itv-icon" />}
                    <div>
                      <p className="ma-itv-label">Format</p>
                      <p className="ma-itv-value">{itv.type}{itv.platform ? ` · ${itv.platform}` : ''}</p>
                    </div>
                  </div>
                  <div className="ma-itv-detail-item">
                    <CircleUser size={14} className="ma-itv-icon" />
                    <div>
                      <p className="ma-itv-label">Contact</p>
                      <p className="ma-itv-value">{itv.contact}</p>
                    </div>
                  </div>
                </div>
                {itv.calendlyLink && (
                  <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0' }}>
                    <a
                      href={itv.calendlyLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', background: '#6366f1', color: '#fff',
                        borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      📅 Confirmer via Calendly
                    </a>
                  </div>
                )}
                {itv.notes && (
                  <div className="ma-itv-notes">
                    <p className="ma-itv-notes-label">Notes de préparation</p>
                    <p className="ma-itv-notes-body">{itv.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ARCHIVES ── */}
        {activeTab === 'archives' && (
          <div className="ma-list">
            {archives.length === 0 && (
              <div className="ma-empty">
                <div className="ma-empty-illo">📁</div>
                <p className="ma-empty-title">Aucune archive</p>
                <p className="ma-empty-hint">Les candidatures clôturées seront archivées ici.</p>
              </div>
            )}
            {archives.map(arc => (
              <div key={arc.id} className="ma-job-row ma-job-row--muted">
                <span className="ma-job-logo">{arc.logo || '📁'}</span>
                <div className="ma-job-info">
                  <p className="ma-job-title">{arc.jobTitle}</p>
                  <p className="ma-job-company">{arc.company}</p>
                  <div className="ma-job-meta">
                    <span><Clock size={11} />Postulé le {arc.appliedDate}</span>
                    {arc.closedDate && <span><Clock size={11} />Clôturé le {arc.closedDate}</span>}
                  </div>
                  {arc.reason && <p className="ma-archive-reason">{arc.reason}</p>}
                </div>
                <ChevronRight size={16} className="ma-row-arrow" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
