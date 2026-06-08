import { useNavigate, NavLink } from 'react-router-dom'
import {
  Bell, MessageSquare, CircleUser, LogOut,
  Plus, Briefcase, Users, Building2, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import './EmployerDashboard.css'

export default function EmployerDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const firstName = user?.firstName || 'vous'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="ed-shell">

      {/* ── Top Navigation ── */}
      <header className="ed-navbar">
        <div className="ed-navbar-brand">
          <span className="ed-logo-icon">S</span>
          <span className="ed-logo-text">SkillSet</span>
        </div>

        <nav className="ed-nav">
          <NavLink to="/dashboard/employer" end className={({ isActive }) => `ed-nav-link ${isActive ? 'ed-nav-link--active' : ''}`}>
            Tableau de bord
          </NavLink>
          <NavLink to="/employer/jobs" className={({ isActive }) => `ed-nav-link ${isActive ? 'ed-nav-link--active' : ''}`}>
            Mes offres
          </NavLink>
          <NavLink to="/employer/candidates" className={({ isActive }) => `ed-nav-link ${isActive ? 'ed-nav-link--active' : ''}`}>
            Candidatures
          </NavLink>
          <NavLink to="/employer/company" className={({ isActive }) => `ed-nav-link ${isActive ? 'ed-nav-link--active' : ''}`}>
            Mon entreprise
          </NavLink>
        </nav>

        <div className="ed-navbar-actions">
          <button className="ed-post-btn" onClick={() => navigate('/employer/jobs/new')}>
            <Plus size={15} /> Publier une offre
          </button>
          <NavLink to="/messages"      className="ed-icon-btn" aria-label="Messages"><MessageSquare size={20} /></NavLink>
          <NavLink to="/notifications" className="ed-icon-btn" aria-label="Notifications"><Bell size={20} /></NavLink>
          <NavLink to="/profile"       className="ed-icon-btn" aria-label="Profil"><CircleUser size={22} /></NavLink>
          <button                      className="ed-icon-btn" onClick={handleLogout} aria-label="Déconnexion"><LogOut size={20} /></button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="ed-main">
        <div className="ed-content">

          {/* Welcome */}
          <h1 className="ed-welcome">
            Bienvenue, <span className="ed-welcome-name">{firstName}</span>
          </h1>
          <p className="ed-welcome-sub">Gérez vos recrutements depuis votre espace employeur</p>

          {/* CTA principal */}
          <div className="ed-cta-banner">
            <div className="ed-cta-text">
              <h2>Publiez votre première offre d'emploi</h2>
              <p>Attirez les meilleurs talents grâce à l'IA de matching de SkillSet</p>
            </div>
            <button className="ed-cta-btn" onClick={() => navigate('/employer/jobs/new')}>
              <Plus size={16} /> Créer une offre
            </button>
          </div>

          {/* Quick links */}
          <section className="ed-section">
            <h2 className="ed-section-title">Accès rapides</h2>
            <div className="ed-quick-grid">
              <button className="ed-quick-card" onClick={() => navigate('/employer/jobs/new')}>
                <div className="ed-quick-icon ed-quick-icon--cherry"><Plus size={22} /></div>
                <div>
                  <p className="ed-quick-label">Publier une offre</p>
                  <p className="ed-quick-desc">Créez une nouvelle annonce</p>
                </div>
                <ChevronRight size={16} className="ed-quick-arrow" />
              </button>

              <button className="ed-quick-card" onClick={() => navigate('/employer/jobs')}>
                <div className="ed-quick-icon ed-quick-icon--blue"><Briefcase size={22} /></div>
                <div>
                  <p className="ed-quick-label">Mes offres</p>
                  <p className="ed-quick-desc">Gérez vos annonces actives</p>
                </div>
                <ChevronRight size={16} className="ed-quick-arrow" />
              </button>

              <button className="ed-quick-card" onClick={() => navigate('/employer/candidates')}>
                <div className="ed-quick-icon ed-quick-icon--green"><Users size={22} /></div>
                <div>
                  <p className="ed-quick-label">Candidatures reçues</p>
                  <p className="ed-quick-desc">Consultez les profils</p>
                </div>
                <ChevronRight size={16} className="ed-quick-arrow" />
              </button>

              <button className="ed-quick-card" onClick={() => navigate('/employer/company')}>
                <div className="ed-quick-icon ed-quick-icon--violet"><Building2 size={22} /></div>
                <div>
                  <p className="ed-quick-label">Mon entreprise</p>
                  <p className="ed-quick-desc">Complétez votre profil</p>
                </div>
                <ChevronRight size={16} className="ed-quick-arrow" />
              </button>
            </div>
          </section>

          {/* Stats vierges */}
          <section className="ed-section">
            <h2 className="ed-section-title">Statistiques</h2>
            <div className="ed-stats-grid">
              <div className="ed-stat-card">
                <p className="ed-stat-value">0</p>
                <p className="ed-stat-label">Offres actives</p>
              </div>
              <div className="ed-stat-card">
                <p className="ed-stat-value">0</p>
                <p className="ed-stat-label">Candidatures reçues</p>
              </div>
              <div className="ed-stat-card">
                <p className="ed-stat-value">0</p>
                <p className="ed-stat-label">Entretiens planifiés</p>
              </div>
              <div className="ed-stat-card">
                <p className="ed-stat-value">0</p>
                <p className="ed-stat-label">Recrutements finalisés</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
