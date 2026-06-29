import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleUser, Lock, Mail, Monitor, Shield, SlidersHorizontal,
  ChevronRight, Loader2, CheckCircle,
} from 'lucide-react'
import { useAuthStore }                    from '../../store/AuthStore'
import AppNavbar                           from '../../components/common/AppNavbar'
import TwoFactorSetup                      from '../../features/auth/TwoFactorSetup'
import { getPreferences, savePreferences } from '../../api/PreferencesApi'
import AccountDeletionModal                from '../../features/account/AccountDeletionModal'
import DataExportModal                     from '../../features/account/DataExportModal'
import { getConsents, updateConsent }      from '../../api/GdprApi'
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
  {
    id: 'preferences',
    icon: <SlidersHorizontal size={18} />,
    label: 'Préférences emploi',
    sub: 'Types de contrats, localisations, salaire attendu',
  },
]

const DEVICES = [
  { device: 'Chrome Windows', loginDate: '10 juin 2026', ip: '102.244.45.246', city: 'Yaoundé', current: true },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeSection, setActiveSection] = useState('account')

  const handleLogout = () => { logout(); navigate('/login') }
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)

  // Preferences state
  const EMPTY_PREF = { preferredJobTypes: '', preferredLocations: '', preferredIndustries: '', salaryExpectationMin: '', salaryExpectationMax: '', notificationsEnabled: true, emailAlertsEnabled: true }
  const [pref,        setPref]        = useState(EMPTY_PREF)
  const [prefLoading, setPrefLoading] = useState(false)
  const [prefSaving,  setPrefSaving]  = useState(false)
  const [prefSaved,   setPrefSaved]   = useState(false)
  const [prefError,   setPrefError]   = useState('')

  const [showDeletionModal, setShowDeletionModal] = useState(false)
  const [showExportModal, setShowExportModal]     = useState(false)
  const [consents, setConsents]                   = useState([])
  const [consentsLoading, setConsentsLoading]     = useState(false)

  useEffect(() => {
    if (activeSection !== 'preferences') return
    setPrefLoading(true)
    getPreferences()
      .then(d => setPref({ preferredJobTypes: d.preferredJobTypes || '', preferredLocations: d.preferredLocations || '', preferredIndustries: d.preferredIndustries || '', salaryExpectationMin: d.salaryExpectationMin ?? '', salaryExpectationMax: d.salaryExpectationMax ?? '', notificationsEnabled: d.notificationsEnabled ?? true, emailAlertsEnabled: d.emailAlertsEnabled ?? true }))
      .catch(() => setPrefError('Impossible de charger les préférences.'))
      .finally(() => setPrefLoading(false))
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'privacy') {
      setConsentsLoading(true)
      getConsents()
        .then(res => setConsents(res.data))
        .catch(() => {})
        .finally(() => setConsentsLoading(false))
    }
  }, [activeSection])

  const isConsentActive = (type) =>
    consents.some(c => c.consentType === type && c.accepted)

  const handleConsentToggle = async (type, accepted) => {
    try {
      await updateConsent(type, accepted)
      setConsents(prev =>
        prev.map(c => c.consentType === type ? { ...c, accepted } : c)
          .concat(prev.some(c => c.consentType === type) ? [] : [{ consentType: type, accepted }])
      )
    } catch (_) {}
  }

  const handleSavePref = async () => {
    setPrefSaving(true); setPrefError('')
    try {
      await savePreferences({ ...pref, userId: user?.id, salaryExpectationMin: pref.salaryExpectationMin ? Number(pref.salaryExpectationMin) : null, salaryExpectationMax: pref.salaryExpectationMax ? Number(pref.salaryExpectationMax) : null })
      setPrefSaved(true); setTimeout(() => setPrefSaved(false), 3000)
    } catch { setPrefError('Erreur lors de la sauvegarde.') }
    finally  { setPrefSaving(false) }
  }

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

              <button className="st-danger-btn" onClick={() => setShowDeletionModal(true)}>Fermer mon compte</button>
            </div>
          )}

          {/* Security settings */}
          {activeSection === 'security' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Paramètres de sécurité <span className="st-badge">Nouveau</span></h2>
              <hr className="st-hr" />
              <h3 className="st-sub-title">Protection du compte</h3>
              <TwoFactorSetup />
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
              <div className="st-row st-row--link" onClick={() => setShowExportModal(true)} style={{ cursor: 'pointer' }}>
                <p className="st-row-label-big">Télécharger mes données</p>
                <ChevronRight size={18} className="st-row-arrow" />
              </div>
              <hr className="st-hr" />
              <div className="st-row st-row--link">
                <p className="st-row-label-big">Supprimer mes données</p>
                <ChevronRight size={18} className="st-row-arrow" />
              </div>
              <hr className="st-hr" />

              <div className="st-section">
                <h2 className="st-section-title">Confidentialité &amp; Consentements</h2>
                {consentsLoading ? (
                  <div className="st-loading"><Loader2 size={18} className="st-spin" /></div>
                ) : (
                  <>
                    <div className="st-row">
                      <div>
                        <p className="st-row-label-big">Cookies analytiques</p>
                        <p className="st-row-label-small">Nous aident à améliorer SkillSet</p>
                      </div>
                      <label className="st-toggle">
                        <input
                          type="checkbox"
                          checked={isConsentActive('ANALYTICS')}
                          onChange={e => handleConsentToggle('ANALYTICS', e.target.checked)}
                        />
                        <span className="st-toggle-slider" />
                      </label>
                    </div>
                    <div className="st-row">
                      <div>
                        <p className="st-row-label-big">Communications marketing</p>
                        <p className="st-row-label-small">Offres d&apos;emploi et actualités SkillSet</p>
                      </div>
                      <label className="st-toggle">
                        <input
                          type="checkbox"
                          checked={isConsentActive('MARKETING')}
                          onChange={e => handleConsentToggle('MARKETING', e.target.checked)}
                        />
                        <span className="st-toggle-slider" />
                      </label>
                    </div>
                    <div className="st-row">
                      <div>
                        <p className="st-row-label-big">Traitement IA — matching &amp; STELLA</p>
                        <p className="st-row-label-small">Personnalisation du matching et chatbot</p>
                      </div>
                      <label className="st-toggle">
                        <input
                          type="checkbox"
                          checked={isConsentActive('AI_PROCESSING')}
                          onChange={e => handleConsentToggle('AI_PROCESSING', e.target.checked)}
                        />
                        <span className="st-toggle-slider" />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="st-panel">
              <h2 className="st-panel-title">Préférences emploi</h2>
              <hr className="st-hr" />
              {prefLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Loader2 size={24} className="st-spin" /></div>
              ) : (
                <>
                  {prefError && <p style={{ color: '#c42033', fontSize: 13, marginBottom: 12 }}>{prefError}</p>}
                  <div className="st-pref-grid">
                    <div className="st-pref-field">
                      <label className="st-row-label">Types de contrat souhaités</label>
                      <input className="st-pref-input" placeholder="CDI, CDD, Freelance…" value={pref.preferredJobTypes} onChange={e => setPref(p => ({ ...p, preferredJobTypes: e.target.value }))} />
                    </div>
                    <div className="st-pref-field">
                      <label className="st-row-label">Localisations préférées</label>
                      <input className="st-pref-input" placeholder="Douala, Yaoundé, Remote…" value={pref.preferredLocations} onChange={e => setPref(p => ({ ...p, preferredLocations: e.target.value }))} />
                    </div>
                    <div className="st-pref-field">
                      <label className="st-row-label">Secteurs d&apos;activité</label>
                      <input className="st-pref-input" placeholder="Tech, Finance, Santé…" value={pref.preferredIndustries} onChange={e => setPref(p => ({ ...p, preferredIndustries: e.target.value }))} />
                    </div>
                    <div className="st-pref-field">
                      <label className="st-row-label">Salaire min. attendu (FCFA/mois)</label>
                      <input className="st-pref-input" type="number" placeholder="150000" value={pref.salaryExpectationMin} onChange={e => setPref(p => ({ ...p, salaryExpectationMin: e.target.value }))} />
                    </div>
                    <div className="st-pref-field">
                      <label className="st-row-label">Salaire max. attendu (FCFA/mois)</label>
                      <input className="st-pref-input" type="number" placeholder="500000" value={pref.salaryExpectationMax} onChange={e => setPref(p => ({ ...p, salaryExpectationMax: e.target.value }))} />
                    </div>
                  </div>
                  <hr className="st-hr" />
                  <div className="st-toggle-row">
                    <div className="st-toggle-text">
                      <p className="st-toggle-label">Notifications push activées</p>
                      <p className="st-toggle-sub">Recevoir des notifications en temps réel sur les nouvelles offres et mises à jour.</p>
                    </div>
                    <button className={`st-toggle ${pref.notificationsEnabled ? 'st-toggle--on' : ''}`} onClick={() => setPref(p => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))} aria-label="Notifications">
                      <span className="st-toggle-knob" />
                    </button>
                  </div>
                  <hr className="st-hr" />
                  <div className="st-toggle-row">
                    <div className="st-toggle-text">
                      <p className="st-toggle-label">Alertes email activées</p>
                      <p className="st-toggle-sub">Recevoir des résumés hebdomadaires et alertes offres par email.</p>
                    </div>
                    <button className={`st-toggle ${pref.emailAlertsEnabled ? 'st-toggle--on' : ''}`} onClick={() => setPref(p => ({ ...p, emailAlertsEnabled: !p.emailAlertsEnabled }))} aria-label="Alertes email">
                      <span className="st-toggle-knob" />
                    </button>
                  </div>
                  <hr className="st-hr" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="st-save-btn" onClick={handleSavePref} disabled={prefSaving}>
                      {prefSaving ? <Loader2 size={14} className="st-spin" /> : null}
                      {prefSaving ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                    {prefSaved && <span style={{ color: '#166534', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Sauvegardé</span>}
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {showDeletionModal && <AccountDeletionModal onClose={() => setShowDeletionModal(false)} />}
      {showExportModal && <DataExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  )
}
