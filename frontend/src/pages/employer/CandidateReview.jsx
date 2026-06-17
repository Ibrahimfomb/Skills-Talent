import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Users, CheckCircle2, XCircle, Calendar, ChevronDown, Filter, Search,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import { JOBS }         from '../../data/mockData'
import AppNavbar        from '../../components/common/AppNavbar'
import './CandidateReview.css'

const FIRST_NAMES = ['Yves','Aisha','Jean-Paul','Christelle','Bruno','Sandra','Thierry','Grace','Patrick','Laure','Serge','Marie-Claire','Hervé','Félicité','Rodrigue','Patience','Armel','Nadège','Cédric','Vanessa']
const LAST_NAMES  = ['Mbarga','Fofana','Essomba','Ngo','Kamdem','Ewome','Abanda','Mfou','Ndzana','Biyong','Fouda','Onana','Ateba','Ndoumbe','Talla','Eyebe','Melingui','Otele','Mendo','Beti']
const DEGREES     = ['Bac+3 Informatique','Bac+5 Finance','Bac+4 Marketing','Bac+5 Gestion','Bac+3 Commerce','Bac+5 Ingénierie','Bac+2 Comptabilité','Bac+4 RH','MBA Finance','Bac+5 Data Science']
const STATUSES    = ['Nouveau','En cours','Entretien planifié','Accepté','Refusé']

const STATUS_CLASS = {
  'Nouveau':            'cr-status--new',
  'En cours':           'cr-status--progress',
  'Entretien planifié': 'cr-status--interview',
  'Accepté':            'cr-status--accepted',
  'Refusé':             'cr-status--refused',
}

const NAV_LINKS = [
  ['/dashboard/employer', 'Tableau de bord', true],
  ['/employer/jobs',      'Mes offres',        false],
  ['/employer/candidates','Candidatures',      false],
  ['/employer/company',   'Mon entreprise',    false],
]

export default function CandidateReview() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterJob,    setFilterJob]    = useState('all')
  const [search,       setSearch]       = useState('')
  const [statuses,     setStatuses]     = useState({})

  const companyName = user?.companyName || user?.company || null
  const userSeed = useMemo(
    () => (user?.id || 'default').split('').reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0),
    [user?.id]
  )

  const jobs = useMemo(() =>
    companyName
      ? JOBS.filter(j => j.company.toLowerCase().includes(companyName.toLowerCase()))
      : JOBS.slice(0, 3),
    [companyName]
  )

  const candidates = useMemo(() => {
    let s = userSeed
    const rand = () => {
      s = ((s * 1664525 + 1013904223) & 0xffffffff) >>> 0
      return s / 0xffffffff
    }
    const result = []
    jobs.forEach((job, ji) => {
      const count = 2 + Math.floor(rand() * 4)
      for (let i = 0; i < count; i++) {
        const fi = Math.floor(rand() * FIRST_NAMES.length)
        const li = Math.floor(rand() * LAST_NAMES.length)
        const di = Math.floor(rand() * DEGREES.length)
        const si = Math.floor(rand() * STATUSES.length)
        const match = 45 + Math.floor(rand() * 50)
        const yearsExp = Math.floor(rand() * 8) + 1
        result.push({
          id: `cand-${ji}-${i}`,
          name: `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`,
          initials: `${FIRST_NAMES[fi][0]}${LAST_NAMES[li][0]}`,
          degree: DEGREES[di],
          defaultStatus: STATUSES[si],
          match,
          yearsExp,
          jobId: job.id,
          jobTitle: job.title,
          appliedDate: new Date(2026, 5, 10 - Math.floor(rand() * 14)).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        })
      }
    })
    return result
  }, [jobs, userSeed])

  const getStatus = (id, def) => statuses[id] ?? def
  const setStatus = (id, s) => setStatuses(prev => ({ ...prev, [id]: s }))

  const filtered = candidates.filter(c => {
    const st = getStatus(c.id, c.defaultStatus)
    return (
      (filterStatus === 'all' || st === filterStatus) &&
      (filterJob === 'all' || c.jobId === filterJob) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.jobTitle.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div className="cr-shell">
      <div className="cr-blob cr-blob--main" />
      <div className="cr-blob cr-blob--accent" />

      <AppNavbar />

      <main className="cr-main">
        {/* Page header */}
        <div className="cr-header">
          <h1 className="cr-title">Candidatures reçues</h1>
          <p className="cr-subtitle">
            {candidates.length} candidat{candidates.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Filters */}
        <div className="cr-filters">
          {/* Search */}
          <div className="cr-filter-wrap">
            <Search size={14} className="cr-filter-icon" />
            <input
              className="cr-select"
              style={{ paddingLeft: 32 }}
              placeholder="Rechercher un candidat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Status filter */}
          <div className="cr-filter-wrap">
            <Filter size={13} className="cr-filter-icon" />
            <select
              className="cr-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="cr-filter-arrow" />
          </div>
          {/* Job filter */}
          <div className="cr-filter-wrap">
            <Filter size={13} className="cr-filter-icon" />
            <select
              className="cr-select"
              value={filterJob}
              onChange={e => setFilterJob(e.target.value)}
            >
              <option value="all">Tous les postes</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <ChevronDown size={13} className="cr-filter-arrow" />
          </div>
        </div>

        {/* Candidate list */}
        {filtered.length === 0 ? (
          <div className="cr-empty">
            <Users size={48} strokeWidth={1} className="cr-empty-icon" />
            <h3>Aucun candidat trouvé</h3>
            <p>Modifiez les filtres ou publiez une offre pour recevoir des candidatures.</p>
          </div>
        ) : (
          <div className="cr-list">
            {filtered.map(c => {
              const status = getStatus(c.id, c.defaultStatus)
              return (
                <div key={c.id} className="cr-card">
                  {/* Avatar */}
                  <div className="cr-avatar" style={{
                    width: 44, height: 44, borderRadius: '50%', background: '#fde8ea',
                    color: '#c42033', fontSize: 15, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {c.initials}
                  </div>
                  {/* Info */}
                  <div className="cr-info">
                    <div className="cr-info-top">
                      <span className="cr-name">{c.name}</span>
                      <span className={`cr-status ${STATUS_CLASS[status] ?? ''}`}>{status}</span>
                    </div>
                    <p className="cr-degree">{c.degree} · {c.yearsExp} an{c.yearsExp > 1 ? 's' : ''} d&apos;exp.</p>
                    <div className="cr-meta">
                      <span className="cr-job-tag">{c.jobTitle}</span>
                      <span className="cr-date"><Calendar size={11} /> {c.appliedDate}</span>
                    </div>
                  </div>
                  {/* Match score */}
                  <div className="cr-match">
                    <span className="cr-match-value">{c.match}%</span>
                    <span className="cr-match-label">Score IA</span>
                  </div>
                  {/* Actions */}
                  <div className="cr-actions">
                    <button
                      className="cr-btn cr-btn--accept"
                      onClick={() => setStatus(c.id, 'Accepté')}
                      disabled={status === 'Accepté'}
                      title="Accepter"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      className="cr-btn cr-btn--interview"
                      onClick={() => setStatus(c.id, 'Entretien planifié')}
                      disabled={status === 'Entretien planifié'}
                      title="Planifier entretien"
                    >
                      <Calendar size={14} />
                    </button>
                    <button
                      className="cr-btn cr-btn--refuse"
                      onClick={() => setStatus(c.id, 'Refusé')}
                      disabled={status === 'Refusé'}
                      title="Refuser"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
