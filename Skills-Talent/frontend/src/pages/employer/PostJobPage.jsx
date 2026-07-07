import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import AppNavbar        from '../../components/common/AppNavbar'
import './PostJobPage.css'

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']
const SECTORS = ['Tech', 'Finance', 'Marketing', 'RH', 'Commercial', 'Design', 'Conseil', 'Énergie', 'Santé', 'Éducation']
const EXPERIENCE_LEVELS = ['Sans expérience', '1-2 ans', '2-4 ans', '4-7 ans', '7+ ans']

export default function PostJobPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    title: '', company: user?.company || '', location: '', country: 'Cameroun',
    type: 'CDI', sector: 'Tech', experience: '2-4 ans',
    salaryMin: '', salaryMax: '', currency: 'FCFA',
    remote: false, description: '', requirements: '', skills: [],
  })
  const [skillInput, setSkillInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) {
      set('skills', [...form.skills, s])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="pj-shell">
        <div className="pj-success">
          <div className="pj-success-icon">✅</div>
          <h2 className="pj-success-title">Offre publiée avec succès !</h2>
          <p className="pj-success-sub">Votre annonce est maintenant visible par les candidats.</p>
          <div className="pj-success-actions">
            <button className="pj-btn-primary" onClick={() => navigate('/dashboard/employer')}>Retour au tableau de bord</button>
            <button className="pj-btn-ghost" onClick={() => { setDone(false); setForm({ ...form, title: '', description: '' }) }}>
              Publier une autre offre
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pj-shell">
      <div className="pj-blob pj-blob--main" />

      <AppNavbar />

      <main className="pj-main">
        <div className="pj-header">
          <h1 className="pj-title">Publier une offre d'emploi</h1>
          <p className="pj-sub">Complétez les informations pour attirer les meilleurs talents</p>
        </div>

        <form className="pj-form" onSubmit={handleSubmit}>

          {/* Infos générales */}
          <div className="pj-card">
            <h2 className="pj-card-title">Informations générales</h2>
            <div className="pj-grid-2">
              <div className="pj-field">
                <label className="pj-label">Titre du poste *</label>
                <input className="pj-input" required placeholder="Ex: Développeur React Senior" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="pj-field">
                <label className="pj-label">Entreprise *</label>
                <input className="pj-input" required placeholder="Nom de l'entreprise" value={form.company} onChange={e => set('company', e.target.value)} />
              </div>
              <div className="pj-field">
                <label className="pj-label">Ville *</label>
                <input className="pj-input" required placeholder="Ex: Douala" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div className="pj-field">
                <label className="pj-label">Pays</label>
                <input className="pj-input" value={form.country} onChange={e => set('country', e.target.value)} />
              </div>
            </div>

            <div className="pj-grid-3">
              <div className="pj-field">
                <label className="pj-label">Type de contrat</label>
                <select className="pj-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="pj-field">
                <label className="pj-label">Secteur</label>
                <select className="pj-select" value={form.sector} onChange={e => set('sector', e.target.value)}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="pj-field">
                <label className="pj-label">Expérience requise</label>
                <select className="pj-select" value={form.experience} onChange={e => set('experience', e.target.value)}>
                  {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="pj-field">
              <label className="pj-toggle-label">
                <input type="checkbox" checked={form.remote} onChange={e => set('remote', e.target.checked)} />
                <span className="pj-toggle-track" />
                Poste en télétravail (partiel ou total)
              </label>
            </div>
          </div>

          {/* Salaire */}
          <div className="pj-card">
            <h2 className="pj-card-title">Rémunération</h2>
            <div className="pj-grid-3">
              <div className="pj-field">
                <label className="pj-label">Salaire minimum</label>
                <input className="pj-input" type="number" placeholder="Ex: 300000" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} />
              </div>
              <div className="pj-field">
                <label className="pj-label">Salaire maximum</label>
                <input className="pj-input" type="number" placeholder="Ex: 600000" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} />
              </div>
              <div className="pj-field">
                <label className="pj-label">Devise</label>
                <select className="pj-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  <option>FCFA</option>
                  <option>EUR</option>
                  <option>USD</option>
                  <option>MAD</option>
                </select>
              </div>
            </div>
            <div className="pj-stella-hint">
              <Sparkles size={14} />
              STELLA analysera la fourchette et suggérera si elle est compétitive pour votre secteur.
            </div>
          </div>

          {/* Description */}
          <div className="pj-card">
            <h2 className="pj-card-title">Description du poste</h2>
            <div className="pj-field">
              <label className="pj-label">Description *</label>
              <textarea className="pj-textarea" required rows={5} placeholder="Décrivez le poste, les missions, le contexte de l'équipe…" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="pj-field">
              <label className="pj-label">Profil recherché</label>
              <textarea className="pj-textarea" rows={3} placeholder="Formation, expériences, qualités attendues…" value={form.requirements} onChange={e => set('requirements', e.target.value)} />
            </div>
          </div>

          {/* Compétences */}
          <div className="pj-card">
            <h2 className="pj-card-title">Compétences clés</h2>
            <div className="pj-skill-input-row">
              <input
                className="pj-input"
                placeholder="Ajouter une compétence (ex: React, Python…)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              />
              <button type="button" className="pj-add-skill-btn" onClick={addSkill}>
                <Plus size={16} />
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="pj-skills-list">
                {form.skills.map(s => (
                  <span key={s} className="pj-skill-tag">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} aria-label={`Supprimer ${s}`}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pj-form-footer">
            <button type="button" className="pj-btn-ghost" onClick={() => navigate('/dashboard/employer')}>Annuler</button>
            <button type="submit" className="pj-btn-primary" disabled={submitting}>
              {submitting ? 'Publication en cours…' : 'Publier l\'offre'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
