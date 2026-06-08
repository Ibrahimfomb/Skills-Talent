import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, MessageSquare, User,
  LogOut, Bell, Save, CircleUser, Briefcase, MapPin,
  Phone, Mail, Edit3, CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import './ProfileSettings.css'

function Sidebar({ onLogout }) {
  return (
    <aside className="ps-sidebar">
      <div className="ps-sidebar-logo">
        <div className="ps-logo-icon">S</div>
        <span className="ps-logo-text">SkillSet</span>
      </div>
      <nav className="ps-nav">
        <NavLink to="/dashboard/candidate" end className={({ isActive }) => `ps-nav-item ${isActive ? 'ps-nav-item--active' : ''}`}>
          <LayoutDashboard size={18} /><span>Tableau de bord</span>
        </NavLink>
        <NavLink to="/jobs" className={({ isActive }) => `ps-nav-item ${isActive ? 'ps-nav-item--active' : ''}`}>
          <Search size={18} /><span>Offres d'emploi</span>
        </NavLink>
        <NavLink to="/applications" className={({ isActive }) => `ps-nav-item ${isActive ? 'ps-nav-item--active' : ''}`}>
          <FileText size={18} /><span>Mes candidatures</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => `ps-nav-item ${isActive ? 'ps-nav-item--active' : ''}`}>
          <MessageSquare size={18} /><span>Messages</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `ps-nav-item ${isActive ? 'ps-nav-item--active' : ''}`}>
          <User size={18} /><span>Mon profil</span>
        </NavLink>
      </nav>
      <button className="ps-logout" onClick={onLogout}>
        <LogOut size={16} /><span>Déconnexion</span>
      </button>
    </aside>
  )
}

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    firstName:  user?.firstName || '',
    lastName:   user?.lastName  || '',
    email:      user?.email     || '',
    phone:      user?.phoneNumber || '',
    jobDomain:  '',
    desiredRole:'',
    experienceLevel: '',
    contractType: '',
    location:   '',
    skills:     '',
    bio:        '',
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="ps-shell">
      <Sidebar onLogout={handleLogout} />

      <main className="ps-main">
        <header className="ps-header">
          <div>
            <h1 className="ps-title">Mon profil</h1>
            <p className="ps-subtitle">Gérez vos informations personnelles et professionnelles</p>
          </div>
          <div className="ps-header-right">
            <button className="ps-icon-btn"><Bell size={20} /></button>
            <div className="ps-avatar-sm"><CircleUser size={34} /></div>
          </div>
        </header>

        <form onSubmit={handleSave} className="ps-body">

          {/* ── Avatar card ── */}
          <div className="ps-avatar-card">
            <div className="ps-avatar-circle">
              <span className="ps-avatar-initials">{initials || <CircleUser size={40} />}</span>
            </div>
            <div className="ps-avatar-info">
              <h2 className="ps-full-name">{form.firstName} {form.lastName}</h2>
              <p className="ps-email-display"><Mail size={14} /> {form.email}</p>
              <span className="ps-role-chip"><Briefcase size={13} /> Candidat</span>
            </div>
            <button type="button" className="ps-edit-photo">
              <Edit3 size={14} /> Modifier la photo
            </button>
          </div>

          <div className="ps-grid">
            {/* ── Infos personnelles ── */}
            <section className="ps-section">
              <h3 className="ps-section-title">Informations personnelles</h3>
              <div className="ps-fields">
                <div className="ps-row">
                  <div className="ps-field">
                    <label>Prénom</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" />
                  </div>
                  <div className="ps-field">
                    <label>Nom</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" />
                  </div>
                </div>
                <div className="ps-field">
                  <label><Mail size={14} /> Adresse e-mail</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" disabled />
                  <span className="ps-field-hint">L'e-mail ne peut pas être modifié</span>
                </div>
                <div className="ps-field">
                  <label><Phone size={14} /> Téléphone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+33 6 00 00 00 00" />
                </div>
              </div>
            </section>

            {/* ── Profil professionnel ── */}
            <section className="ps-section">
              <h3 className="ps-section-title">Profil professionnel</h3>
              <div className="ps-fields">
                <div className="ps-field">
                  <label><Briefcase size={14} /> Domaine professionnel</label>
                  <select name="jobDomain" value={form.jobDomain} onChange={handleChange}>
                    <option value="">Sélectionner un domaine</option>
                    <option>Informatique & Tech</option>
                    <option>Finance & Comptabilité</option>
                    <option>Marketing & Communication</option>
                    <option>Ressources Humaines</option>
                    <option>Santé & Médical</option>
                    <option>Éducation & Formation</option>
                    <option>Juridique & Droit</option>
                    <option>Commerce & Vente</option>
                    <option>Ingénierie & BTP</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="ps-field">
                  <label>Poste recherché</label>
                  <input name="desiredRole" value={form.desiredRole} onChange={handleChange} placeholder="Ex : Développeur Full-Stack, Comptable..." />
                </div>
                <div className="ps-row">
                  <div className="ps-field">
                    <label>Niveau d'expérience</label>
                    <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                      <option value="">Sélectionner</option>
                      <option>Junior (0-2 ans)</option>
                      <option>Intermédiaire (2-5 ans)</option>
                      <option>Senior (5-10 ans)</option>
                      <option>Expert (10+ ans)</option>
                    </select>
                  </div>
                  <div className="ps-field">
                    <label>Type de contrat souhaité</label>
                    <select name="contractType" value={form.contractType} onChange={handleChange}>
                      <option value="">Sélectionner</option>
                      <option>CDI</option>
                      <option>CDD</option>
                      <option>Freelance</option>
                      <option>Stage</option>
                      <option>Alternance</option>
                    </select>
                  </div>
                </div>
                <div className="ps-field">
                  <label><MapPin size={14} /> Ville / Localisation</label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="Ex : Paris, Lyon, Remote..." />
                </div>
                <div className="ps-field">
                  <label>Compétences principales</label>
                  <input name="skills" value={form.skills} onChange={handleChange} placeholder="Ex : React, Java, Excel, Photoshop… (séparées par des virgules)" />
                </div>
                <div className="ps-field">
                  <label>Bio / Présentation</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Présentez-vous en quelques lignes : votre parcours, vos motivations, ce que vous recherchez..." />
                </div>
              </div>
            </section>
          </div>

          {/* ── Save button ── */}
          <div className="ps-footer">
            {saved && (
              <span className="ps-saved-msg">
                <CheckCircle size={16} /> Profil enregistré avec succès
              </span>
            )}
            <button type="submit" className="ps-btn-save">
              <Save size={16} /> Enregistrer les modifications
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
