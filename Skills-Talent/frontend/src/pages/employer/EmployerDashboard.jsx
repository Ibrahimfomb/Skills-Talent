import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleUser, Plus,
  Briefcase, Users, CheckCircle, ChevronRight,
  BarChart2, Calendar,
} from 'lucide-react'
import { useAuthStore }       from '../../store/AuthStore'
import { JOBS }               from '../../data/mockData'
import AppNavbar              from '../../components/common/AppNavbar'
import AutomationRulesPanel   from '../../features/automation/AutomationRulesPanel'
import TalentPoolsPanel       from '../../features/talentpool/TalentPoolList'
import './EmployerDashboard.css'

function DonutChart({ pct = 0 }) {
  const r = 40, cx = 60, cy = 60
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circ
  return (
    <svg width="130" height="130" viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C42033" strokeWidth="14"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#111" fontFamily="system-ui">{pct}</text>
    </svg>
  )
}

function MiniCalendar() {
  const today = new Date()
  const year = today.getFullYear(), month = today.getMonth()
  const monthName = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  return (
    <div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#555', textTransform: 'capitalize', marginBottom: '12px' }}>{monthName}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {dayLabels.map((d, i) => (
          <div key={i} style={{ fontSize: '11px', color: '#aaa', padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} style={{
            fontSize: '11px', padding: '5px 0', borderRadius: '50%', lineHeight: 1,
            background: d === today.getDate() ? '#c42033' : 'transparent',
            color: d === today.getDate() ? '#fff' : d ? '#555' : 'transparent',
            fontWeight: d === today.getDate() ? 700 : 400,
          }}>{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

const ACQUISITIONS = [
  { label: 'Candidatures', value: 84 },
  { label: 'Sélectionnés',  value: 64 },
  { label: 'Entretiens',    value: 54 },
  { label: 'Embauchés',     value: 37 },
]

const RECENT_CANDIDATES = [
  { name: 'Aisha Mbarga',      role: 'Développeur React',  score: 78 },
  { name: 'Jean-Paul Fofana',  role: 'Full Stack Engineer', score: 35 },
  { name: 'Christelle Ngo',    role: 'Product Designer',    score: 60 },
  { name: 'Bruno Kamdem',      role: 'Chef de projet',      score: 90 },
  { name: 'Sandra Ewome',      role: 'QA Engineer',         score: 90 },
  { name: 'Rodrigue Talla',    role: 'Data Analyst',        score: 55 },
]

const scoreColor = s =>
  s >= 75 ? { background: '#e7f4e0', color: '#2d7600' } :
  s >= 50 ? { background: '#fff4e0', color: '#9a5700' } :
             { background: '#fff0f2', color: '#c42033' }

const NAV_LINKS = [
  ['/dashboard/employer', 'Tableau de bord', true],
  ['/employer/jobs',      'Mes offres',       false],
  ['/employer/candidates','Candidatures',     false],
  ['/employer/company',   'Mon entreprise',   false],
]

const QUICK_LINKS = [
  { icon: Plus,      iconClass: 'ed-quick-icon--cherry', label: 'Publier une offre',     desc: 'Rédigez une nouvelle offre d\'emploi',    path: '/employer/jobs/new'   },
  { icon: Users,     iconClass: 'ed-quick-icon--blue',   label: 'Voir les candidatures', desc: 'Examinez les profils reçus',              path: '/employer/candidates' },
  { icon: Briefcase, iconClass: 'ed-quick-icon--green',  label: 'Mes offres actives',    desc: 'Gérez vos annonces publiées',             path: '/employer/jobs'       },
  { icon: CircleUser,iconClass: 'ed-quick-icon--violet', label: 'Profil entreprise',     desc: 'Mettez à jour vos informations',          path: '/employer/company'    },
]

export default function EmployerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const firstName = user?.firstName || 'vous'

  const companyName = user?.companyName || user?.company || null
  const jobs = useMemo(() =>
    companyName
      ? JOBS.filter(j => j.company.toLowerCase().includes(companyName.toLowerCase()))
      : JOBS.slice(0, 4),
    [companyName]
  )

  const hiringStates = useMemo(() =>
    jobs.map(job => {
      const app = job.applicants ?? 10
      return {
        ...job,
        applied:   app,
        interview: Math.max(1, Math.floor(app * 0.38)),
        offer:     Math.max(0, Math.floor(app * 0.14)),
        hired:     Math.max(0, Math.floor(app * 0.06)),
      }
    }),
    [jobs]
  )

  const totalApplied = hiringStates.reduce((a, j) => a + j.applied, 0)
  const totalHired   = hiringStates.reduce((a, j) => a + j.hired, 0)
  const hiringRatio  = totalApplied ? Math.round((totalHired / totalApplied) * 100) : 0

  return (
    <div className="ed-shell">
      {/* Blobs de fond rosés */}
      <div className="ed-blob ed-blob--main" />
      <div className="ed-blob ed-blob--accent" />

      <AppNavbar />

      {/* ── Contenu principal ── */}
      <main className="ed-main">
        <div className="ed-content">

          {/* Accueil */}
          <h1 className="ed-welcome">
            Bonjour, <span className="ed-welcome-name">{firstName}</span>
          </h1>
          <p className="ed-welcome-sub">Faisons du recrutement intelligemment aujourd&apos;hui.</p>

          {/* Bannière CTA */}
          <div className="ed-cta-banner">
            <div>
              <h2>Publiez votre prochaine offre</h2>
              <p>Atteignez des milliers de candidats qualifiés en quelques minutes.</p>
            </div>
            <button className="ed-cta-btn" onClick={() => navigate('/employer/jobs/new')}>
              <Plus size={16} /> Publier une offre
            </button>
          </div>

          {/* Statistiques */}
          <div className="ed-section">
            <p className="ed-section-title">Statistiques globales</p>
            <div className="ed-stats-grid">
              {[
                { label: 'Offres actives',   value: String(jobs.length).padStart(2, '0'),     icon: <Briefcase size={18} />,   color: '#c42033' },
                { label: 'Candidatures',     value: String(totalApplied).padStart(2, '0'),    icon: <Users size={18} />,       color: '#2b4fbf' },
                { label: 'Embauchés',        value: String(totalHired).padStart(2, '0'),      icon: <CheckCircle size={18} />, color: '#1a6e44' },
                { label: 'Taux d\'embauche', value: `${hiringRatio}%`,                        icon: <BarChart2 size={18} />,   color: '#6629a6' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="ed-stat-card">
                  <div style={{ color, marginBottom: '8px' }}>{icon}</div>
                  <p className="ed-stat-value" style={{ color }}>{value}</p>
                  <p className="ed-stat-label">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accès rapides */}
          <div className="ed-section">
            <p className="ed-section-title">Accès rapides</p>
            <div className="ed-quick-grid">
              {QUICK_LINKS.map(({ icon: Icon, iconClass, label, desc, path }) => (
                <button key={path} className="ed-quick-card" onClick={() => navigate(path)}>
                  <div className={`ed-quick-icon ${iconClass}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="ed-quick-label">{label}</p>
                    <p className="ed-quick-desc">{desc}</p>
                  </div>
                  <ChevronRight size={16} className="ed-quick-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* États du recrutement + Candidats récents */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', marginBottom: '32px', alignItems: 'start' }}>

            {/* Table de recrutement */}
            <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>États du recrutement</strong>
                <button style={{ fontSize: '12px', color: '#c42033', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/employer/jobs')}>
                  Tout voir →
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      {['Offre', 'Reçues', 'Entretiens', 'Offre', 'Embauché'].map((h, i) => (
                        <th key={h + i} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hiringStates.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                          Aucune offre.{' '}
                          <button style={{ color: '#c42033', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/employer/jobs/new')}>
                            Publier →
                          </button>
                        </td>
                      </tr>
                    ) : hiringStates.map(job => (
                      <tr key={job.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{job.title}</p>
                          <p style={{ fontSize: '11px', color: '#aaa' }}>{job.type} · {job.experience}</p>
                        </td>
                        {[job.applied, job.interview, job.offer, job.hired].map((val, idx) => (
                          <td key={idx} style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {val > 0 ? (
                              <button
                                style={{ fontWeight: 700, fontSize: '13px', color: idx === 3 ? '#c42033' : '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                onClick={() => navigate('/employer/candidates')}
                              >
                                {val} <ChevronRight size={11} style={{ color: '#ccc' }} />
                              </button>
                            ) : <span style={{ color: '#e0e0e0', fontSize: '11px' }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidats récents */}
            <div style={{ width: '260px', background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Candidats récents</strong>
                <button style={{ fontSize: '12px', color: '#c42033', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/employer/candidates')}>
                  Voir →
                </button>
              </div>
              {RECENT_CANDIDATES.map((c, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/employer/candidates')}
                  style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f9f9f9', cursor: 'pointer' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff0f2', color: '#c42033', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                    <p style={{ fontSize: '11px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.role}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', flexShrink: 0, ...scoreColor(c.score) }}>
                    {c.score}%
                  </span>
                </div>
              ))}
              <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                <button style={{ fontSize: '12px', color: '#c42033', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/employer/candidates')}>
                  Voir toutes les candidatures →
                </button>
              </div>
            </div>
          </div>

          {/* Acquisitions + Taux d'embauche + Planning */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

            {/* Acquisitions */}
            <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Acquisitions</strong>
                <BarChart2 size={15} style={{ color: '#ccc' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ACQUISITIONS.map((a, i) => (
                  <div key={a.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#777' }}>{a.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>{a.value}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', background: '#c42033', width: `${a.value}%`, opacity: 1 - i * 0.18 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Taux d'embauche */}
            <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <strong style={{ fontSize: '14px', color: '#1a1a1a', alignSelf: 'flex-start' }}>Taux d&apos;embauche</strong>
              <DonutChart pct={hiringRatio} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>{totalApplied}</p>
                  <p style={{ fontSize: '11px', color: '#aaa' }}>Candidatures</p>
                </div>
                <div style={{ background: '#fff0f2', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#c42033' }}>{totalHired}</p>
                  <p style={{ fontSize: '11px', color: '#aaa' }}>Embauchés</p>
                </div>
              </div>
            </div>

            {/* Planning */}
            <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Planning</strong>
                <Calendar size={15} style={{ color: '#ccc' }} />
              </div>
              <MiniCalendar />
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#fff0f2', borderRadius: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c42033', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Entretien RH planifié</p>
                    <p style={{ fontSize: '11px', color: '#aaa' }}>Aujourd&apos;hui · 09:30</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f9f9f9', borderRadius: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ccc', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Revue des candidatures</p>
                    <p style={{ fontSize: '11px', color: '#aaa' }}>Demain · 14:00</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Règles d'automatisation */}
          <div className="ed-section">
            <AutomationRulesPanel />
          </div>

          {/* Viviers de talents */}
          <div className="ed-section">
            <p className="ed-section-title">Viviers de talents</p>
            <TalentPoolsPanel />
          </div>

        </div>
      </main>
    </div>
  )
}
