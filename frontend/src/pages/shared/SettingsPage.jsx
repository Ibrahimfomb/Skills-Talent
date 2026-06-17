import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleUser, Lock, Mail, Monitor, Shield,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import AppNavbar        from '../../components/common/AppNavbar'
import './SettingsPage.css'

const SECTIONS = [
  {
    id: 'account',
    icon: <CircleUser size={18} />,
    label: 'Paramètres du compte',
    sub: 'Vos coordonnées',
  },
  {
    id: 'security',
    icon: <Lock size={18} />,
    label: 'Paramètres de sécurité',
    sub: 'Gestion de la sécurité de votre compte',
    badge: 'Nouveau',
  },
  {
    id: 'communication',
    icon: <Mail size={18} />,
    label: 'Paramètres de communication',
    sub: 'Gestion des notifications et des paramètres des messages',
  },
  {
    id: 'devices',
    icon: <Monitor size={18} />,
    label: 'Gestion des appareils',
    sub: 'Gestion des appareils actifs et des sessions',
  },
  {
    id: 'privacy',
    icon: <Shield size={18} />,
    label: 'Paramètres de confidentialité',
    sub: 'Informations à propos de la protection de la vie privée',
  },
]

const DEVICES = [
  { device: 'Chrome Windows', loginDate: '10 juin 2026', ip: '102.244.45.246', city: 'Yaoundé', current: true },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState('account')
  const [onlineStatus, setOnlineStatus]   = useState(true)
  const [readReceipts, setReadReceipts]   = useState(true)

  const dashPath = user?.role === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard/candidate'

  return (
    <div className="st-shell">

      <AppNavbar />

      {/* ── Body ── */}
      <div className="st-body">

        {/* ── Sidebar ── */}
        <aside className="st-sidebar">
          <h1 className="st-sidebar-title">Paramètres</h1>
          <nav className="st-sidebar-nav">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`st-sidebar-item ${activeSection === s.id ? 'st-sidebar-item--active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="st-sidebar-icon">{s.icon}</span>
                <div className="st-sidebar-text">
                  <span className="st-sidebar-label">
                    {s.label}
                    {s.badge && <span className="st-badge">{s.badge}</span>}
                  </span>
                  <span className="st-sidebar-sub">{s.sub}</span>
                </div>
                <ChevronRight size={16} className="st-sidebar-arrow" />
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="st-content">

          {/* Account settings */}
          {activeSection === 'account' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Paramètres du compte</h2>
              <hr className="st-hr" />

              <div className="st-row">
                <div className="st-row-left">
                  <p className="st-row-label">Type de compte :</p>
                  <p className="st-row-value">{user?.role === 'EMPLOYER' ? 'Employeur' : 'Chercheur d\'emploi'}</p>
                </div>
                <button className="st-row-btn">Modifier le type du compte</button>
              </div>
              <hr className="st-hr" />

              <div className="st-row">
                <div className="st-row-left">
                  <p className="st-row-label">Email</p>
                  <p className="st-row-value">{user?.email}</p>
                </div>
                <button className="st-row-btn">Modifier l&apos;adresse email</button>
              </div>
              <hr className="st-hr" />

              <div className="st-row">
                <div className="st-row-left">
                  <p className="st-row-label">Numéro de téléphone</p>
                  <p className="st-row-value">{user?.phoneNumber || '—'}</p>
                </div>
                <button className="st-row-btn">Modifier le numéro de téléphone</button>
              </div>
              <hr className="st-hr" />

              <div className="st-row">
                <div className="st-row-left">
                  <p className="st-row-label">Clé d&apos;accès</p>
                </div>
                <div className="st-row-btns">
                  <button className="st-row-btn">Créer une clé d&apos;accès</button>
                  <button className="st-row-btn">Gérer les clés d&apos;accès</button>
                </div>
              </div>
              <hr className="st-hr" />

              <div className="st-row">
                <p className="st-row-value">{user?.email}</p>
                <button className="st-row-btn" onClick={handleLogout}>Déconnexion</button>
              </div>
              <hr className="st-hr" />

              <button className="st-danger-btn">Fermer mon compte</button>
            </div>
          )}

          {/* Security settings */}
          {activeSection === 'security' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Paramètres de sécurité <span className="st-badge">Nouveau</span></h2>
              <hr className="st-hr" />
              <h3 className="st-sub-title">Protection du compte</h3>
              <hr className="st-hr" />
              <h3 className="st-sub-title">Applications tierces</h3>
              <hr className="st-hr" />
              <p className="st-empty-text">Aucune application tierce n&apos;a accès à votre compte.</p>
            </div>
          )}

          {/* Communication settings */}
          {activeSection === 'communication' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Paramètres de communication</h2>
              <hr className="st-hr" />

              <div className="st-row st-row--link">
                <p className="st-row-label-big">Adresse email</p>
                <ChevronRight size={18} className="st-row-arrow" />
              </div>
              <hr className="st-hr" />

              <div className="st-row st-row--link">
                <p className="st-row-label-big">SMS</p>
                <ChevronRight size={18} className="st-row-arrow" />
              </div>
              <hr className="st-hr" />

              <div className="st-toggle-row">
                <div className="st-toggle-text">
                  <p className="st-toggle-label">Afficher le statut En ligne</p>
                  <p className="st-toggle-sub">Montrez aux personnes avec qui vous conversez que vous êtes en ligne sur SkillSet. Si cette option est désactivée, celles-ci ne verront pas votre statut « En ligne ».</p>
                </div>
                <button
                  className={`st-toggle ${onlineStatus ? 'st-toggle--on' : ''}`}
                  onClick={() => setOnlineStatus(v => !v)}
                  aria-label="Statut en ligne"
                >
                  <span className="st-toggle-knob" />
                </button>
              </div>
              <hr className="st-hr" />

              <div className="st-toggle-row">
                <div className="st-toggle-text">
                  <p className="st-toggle-label">Afficher les accusés de lecture</p>
                  <p className="st-toggle-sub">Lorsque vous avez lu un message, notifiez-en les personnes qui vous l&apos;ont envoyé. Si cette option est désactivée, ces personnes ne verront pas quand vous avez lu leurs messages.</p>
                </div>
                <button
                  className={`st-toggle ${readReceipts ? 'st-toggle--on' : ''}`}
                  onClick={() => setReadReceipts(v => !v)}
                  aria-label="Accusés de lecture"
                >
                  <span className="st-toggle-knob" />
                </button>
              </div>
              <hr className="st-hr" />
            </div>
          )}

          {/* Devices */}
          {activeSection === 'devices' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Gestion des appareils</h2>
              <hr className="st-hr" />
              <p className="st-devices-hint">Vous êtes actuellement connecté(e) à votre compte SkillSet sur ces appareils.</p>
              <table className="st-devices-table">
                <thead>
                  <tr>
                    <th>Appareil</th>
                    <th>Date de connexion</th>
                    <th>Adresse IP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {DEVICES.map((d, i) => (
                    <tr key={i}>
                      <td>{d.device}</td>
                      <td>{d.loginDate}</td>
                      <td>{d.ip}<br /><span className="st-city">{d.city}</span></td>
                      <td>{d.current ? <em className="st-current-device">Cet appareil</em> : <button className="st-row-btn">Déconnecter</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Paramètres de confidentialité</h2>
              <hr className="st-hr" />
              <p className="st-empty-text">Vos données personnelles sont protégées conformément à notre politique de confidentialité.</p>
              <hr className="st-hr" />
              <div className="st-row st-row--link">
                <p className="st-row-label-big">Télécharger mes données</p>
                <ChevronRight size={18} className="st-row-arrow" />
              </div>
              <hr className="st-hr" />
              <div className="st-row st-row--link">
                <p className="st-row-label-big">Supprimer mes données</p>
                <ChevronRight size={18} className="st-row-arrow" />
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
