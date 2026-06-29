import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  Mail, Phone, MapPin, ChevronRight, ChevronDown,
  Save, CheckCircle, Upload, CircleUser,
} from 'lucide-react'
import { useAuthStore }  from '../../store/AuthStore'
import { updateProfile } from '../../api/AuthApi'
import AppNavbar         from '../../components/common/AppNavbar'
import './ProfileSettings.css'

const ACCORDIONS = [
  { id: 'qualifications',    label: 'Qualifications',          sub: 'Mettez vos compétences et votre expérience en avant.' },
  { id: 'preferences',       label: 'Préférences d\'emploi',   sub: 'Précisez certaines informations, telles que le salaire minimum et l\'horaire désiré.' },
  { id: 'exclude',           label: 'Exclure des types d\'emplois', sub: 'Gérez les qualifications et préférences pour masquer certains emplois.' },
  { id: 'available',         label: 'Disponible maintenant',   sub: 'Indiquez aux employeurs que vous pouvez commencer dès que possible.' },
]

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [visible, setVisible]       = useState(true)

  const [form, setForm] = useState({
    firstName:       user?.firstName || '',
    lastName:        user?.lastName  || '',
    email:           user?.email     || '',
    phone:           user?.phoneNumber || '',
    location:        '',
    jobDomain:       '',
    desiredRole:     '',
    experienceLevel: '',
    contractType:    '',
    skills:          '',
    bio:             '',
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = (e) => {
    e.preventDefault()
    updateUser({ firstName: form.firstName, lastName: form.lastName, phoneNumber: form.phone })
    if (user?.id) {
      updateProfile(user.id, {
        firstName: form.firstName,
        lastName:  form.lastName,
        phoneNumber: form.phone,
      }).catch(() => {})
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const initials = `${(form.firstName[0] || '').toUpperCase()}${(form.lastName[0] || '').toUpperCase()}`

  return (
    <div className="ps-shell">

      <AppNavbar />

      <main className="ps-main">
        <div className="ps-content">

          {/* ── Profile header — GRACE DIVINE style ── */}
          <div className="ps-profile-header">
            <div className="ps-profile-left">
              <h1 className="ps-full-name">{form.firstName.toUpperCase()} {form.lastName.toUpperCase()}</h1>
              <div className="ps-contact-rows">
                <div className="ps-contact-row">
                  <Mail size={15} className="ps-contact-icon" />
                  <span>{form.email}</span>
                </div>
                <button className="ps-contact-add-btn">
                  <Phone size={15} className="ps-contact-icon" />
                  <span>{form.phone || 'Ajoutez un numéro de téléphone'}</span>
                  <ChevronRight size={14} />
                </button>
                <button className="ps-contact-add-btn">
                  <MapPin size={15} className="ps-contact-icon" />
                  <span>{form.location || 'Ajouter un lieu.'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
              {/* Visibility toggle */}
              <div className={`ps-visibility-banner ${visible ? 'ps-visibility-banner--on' : 'ps-visibility-banner--off'}`}>
                <span className="ps-vis-dot" />
                <span>{visible ? 'Les employeurs peuvent vous trouver' : 'Invisible aux employeurs'}</span>
                <button className="ps-vis-toggle" onClick={() => setVisible(v => !v)}>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
            <div className="ps-avatar-circle">
              {initials || <CircleUser size={32} />}
            </div>
          </div>

          {/* ── CV section ── */}
          <section className="ps-section">
            <h2 className="ps-section-title">CV</h2>
            <div className="ps-cv-card">
              <div className="ps-cv-icon">PDF</div>
              <div className="ps-cv-info">
                <p className="ps-cv-name">cv_skillset.pdf</p>
                <p className="ps-cv-date">Ajouté le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button className="ps-cv-more">•••</button>
            </div>
            <button className="ps-cv-upload-btn">
              <Upload size={15} /> Ajouter un CV
            </button>
          </section>

          <hr className="ps-divider" />

          {/* ── Improve job suggestions ── */}
          <section className="ps-section">
            <h2 className="ps-section-title">Améliorez la pertinence des emplois suggérés</h2>
            <div className="ps-accordion-list">
              {ACCORDIONS.map(acc => (
                <div key={acc.id} className="ps-accordion-item">
                  <button
                    className="ps-accordion-btn"
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                  >
                    <div className="ps-accordion-text">
                      <span className="ps-accordion-label">{acc.label}</span>
                      <span className="ps-accordion-sub">{acc.sub}</span>
                    </div>
                    <ChevronRight size={18} className={`ps-accordion-arrow ${openAccordion === acc.id ? 'ps-accordion-arrow--open' : ''}`} />
                  </button>
                  {openAccordion === acc.id && (
                    <div className="ps-accordion-body">
                      {acc.id === 'qualifications' && (
                        <form onSubmit={handleSave} className="ps-form-group">
                          <div className="ps-field">
                            <label>Domaine professionnel</label>
                            <select name="jobDomain" value={form.jobDomain} onChange={handleChange}>
                              <option value="">Sélectionner un domaine</option>
                              <option>Informatique &amp; Tech</option>
                              <option>Finance &amp; Comptabilité</option>
                              <option>Marketing &amp; Communication</option>
                              <option>Ressources Humaines</option>
                              <option>Santé &amp; Médical</option>
                              <option>Commerce &amp; Vente</option>
                              <option>Ingénierie &amp; BTP</option>
                              <option>Autre</option>
                            </select>
                          </div>
                          <div className="ps-field">
                            <label>Niveau d&apos;expérience</label>
                            <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                              <option value="">Sélectionner</option>
                              <option>Junior (0-2 ans)</option>
                              <option>Intermédiaire (2-5 ans)</option>
                              <option>Senior (5-10 ans)</option>
                              <option>Expert (10+ ans)</option>
                            </select>
                          </div>
                          <div className="ps-field">
                            <label>Compétences</label>
                            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Python, Excel… (virgules)" />
                          </div>
                          <div className="ps-field">
                            <label>Bio / Présentation</label>
                            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Présentez-vous en quelques lignes…" />
                          </div>
                          <button type="submit" className="ps-save-btn">
                            <Save size={14} /> Enregistrer
                          </button>
                          {saved && <span className="ps-saved-msg"><CheckCircle size={14} /> Enregistré</span>}
                        </form>
                      )}
                      {acc.id === 'preferences' && (
                        <form onSubmit={handleSave} className="ps-form-group">
                          <div className="ps-field">
                            <label>Poste recherché</label>
                            <input name="desiredRole" value={form.desiredRole} onChange={handleChange} placeholder="Ex : Développeur Full-Stack…" />
                          </div>
                          <div className="ps-field">
                            <label>Type de contrat</label>
                            <select name="contractType" value={form.contractType} onChange={handleChange}>
                              <option value="">Sélectionner</option>
                              <option>CDI</option><option>CDD</option>
                              <option>Freelance</option><option>Stage</option><option>Alternance</option>
                            </select>
                          </div>
                          <button type="submit" className="ps-save-btn">
                            <Save size={14} /> Enregistrer
                          </button>
                          {saved && <span className="ps-saved-msg"><CheckCircle size={14} /> Enregistré</span>}
                        </form>
                      )}
                      {acc.id === 'exclude' && (
                        <form onSubmit={handleSave} className="ps-form-group">
                          <div className="ps-field">
                            <label>Localisation souhaitée</label>
                            <input name="location" value={form.location} onChange={handleChange} placeholder="Paris, Remote, Yaoundé…" />
                          </div>
                          <button type="submit" className="ps-save-btn">
                            <Save size={14} /> Enregistrer
                          </button>
                          {saved && <span className="ps-saved-msg"><CheckCircle size={14} /> Enregistré</span>}
                        </form>
                      )}
                      {acc.id === 'available' && (
                        <div className="ps-form-group">
                          <p className="ps-accordion-hint">En activant cette option, les recruteurs verront que vous êtes immédiatement disponible.</p>
                          <button className="ps-save-btn">Activer la disponibilité</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <hr className="ps-divider" />

          {/* ── Personal info (inline edit) ── */}
          <section className="ps-section">
            <h2 className="ps-section-title">Aidez les autres chercheurs d&apos;emploi</h2>
            <NavLink to="/my-jobs" className="ps-review-link">
              <div>
                <p className="ps-review-label">Mes avis</p>
                <p className="ps-review-sub">Vos avis, questions et réponses apparaîtront sur la page entreprise.</p>
              </div>
              <ChevronRight size={18} />
            </NavLink>
          </section>

        </div>
      </main>
    </div>
  )
}
