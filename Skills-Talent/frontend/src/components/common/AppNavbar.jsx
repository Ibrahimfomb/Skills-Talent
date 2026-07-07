import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, MessageSquare, CircleUser, LogOut, Plus, Menu, X } from 'lucide-react'
import { useAuthStore }          from '../../store/AuthStore'
import { useNotificationStore }  from '../../store/NotificationStore'
import { useMessageStore }       from '../../store/MessageStore'
import './AppNavbar.css'

const CANDIDATE_LINKS = [
  { to: '/dashboard/candidate', label: 'Accueil',      end: true  },
  { to: '/jobs',                label: 'Offres',        end: false },
  { to: '/my-jobs',             label: 'Mes emplois',  end: false },
]

const EMPLOYER_LINKS = [
  { to: '/dashboard/employer',  label: 'Tableau de bord',  end: true  },
  { to: '/employer/jobs',       label: 'Mes offres',        end: false },
  { to: '/employer/candidates', label: 'Candidatures',      end: false },
  { to: '/employer/company',    label: 'Mon entreprise',    end: false },
]

const ADMIN_LINKS = [
  { to: '/dashboard/admin', label: "Vue d'ensemble", end: true },
]

export default function AppNavbar() {
  const navigate = useNavigate()
  const { user, logout }             = useAuthStore()
  const { unreadCount: notifCount }  = useNotificationStore()
  const { totalUnread: msgCount }    = useMessageStore()
  const [drawerOpen, setDrawerOpen]  = useState(false)

  const role  = user?.role ?? 'CANDIDATE'
  const links = role === 'EMPLOYER' ? EMPLOYER_LINKS : role === 'ADMIN' ? ADMIN_LINKS : CANDIDATE_LINKS
  const home  = role === 'EMPLOYER' ? '/dashboard/employer' : role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/candidate'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <header className="an-navbar">
        {/* Logo */}
        <NavLink to={home} className="an-brand">
          <div className="an-logo-icon">S</div>
          <span className="an-logo-text">SkillSet</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="an-nav">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `an-nav-link${isActive ? ' an-nav-link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="an-actions">
          {role === 'EMPLOYER' && (
            <button className="an-post-btn" onClick={() => navigate('/employer/jobs/new')}>
              <Plus size={15} /> Publier
            </button>
          )}
          <NavLink to="/messages" className="an-icon-btn" aria-label="Messages">
            <MessageSquare size={20} />
            {msgCount > 0 && <span className="an-badge">{msgCount}</span>}
          </NavLink>
          <NavLink to="/notifications" className="an-icon-btn" aria-label="Notifications">
            <Bell size={20} />
            {notifCount > 0 && <span className="an-badge">{notifCount}</span>}
          </NavLink>
          <NavLink to="/profile" className="an-icon-btn" aria-label="Profil">
            <CircleUser size={22} />
          </NavLink>
          <button className="an-icon-btn" onClick={handleLogout} aria-label="Déconnexion">
            <LogOut size={20} />
          </button>
          {/* Mobile hamburger */}
          <button className="an-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="an-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="an-drawer">
            <NavLink to={home} className="an-drawer-brand" onClick={() => setDrawerOpen(false)}>
              <div className="an-logo-icon">S</div>
              <span className="an-logo-text">SkillSet</span>
            </NavLink>
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to} to={to} end={end}
                className={({ isActive }) => `an-drawer-link${isActive ? ' an-drawer-link--active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '8px 0' }} />
            <NavLink to="/messages" className="an-drawer-link" onClick={() => setDrawerOpen(false)}>
              Messages {msgCount > 0 && `(${msgCount})`}
            </NavLink>
            <NavLink to="/notifications" className="an-drawer-link" onClick={() => setDrawerOpen(false)}>
              Notifications {notifCount > 0 && `(${notifCount})`}
            </NavLink>
            <NavLink to="/profile" className="an-drawer-link" onClick={() => setDrawerOpen(false)}>
              Mon profil
            </NavLink>
            <button
              style={{ background: 'none', border: 'none', textAlign: 'left', padding: '12px 16px', color: '#c42033', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              onClick={() => { setDrawerOpen(false); handleLogout() }}
            >
              Déconnexion
            </button>
            <button
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              onClick={() => setDrawerOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </>
      )}
    </>
  )
}
