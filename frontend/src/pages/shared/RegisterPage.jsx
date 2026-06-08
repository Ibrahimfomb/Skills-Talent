import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react'
import { registerUser } from '../../api/AuthApi'
import { useAuthStore } from '../../store/AuthStore'
import './AuthPage.css'
import './RegisterPage.css'

const ROLE_ROUTES = {
  CANDIDATE: '/dashboard/candidate',
  EMPLOYER: '/dashboard/employer',
}

const resolveRedirect = (data) =>
  data.onboardingCompleted ? (ROLE_ROUTES[data.role] ?? '/dashboard/candidate') : '/onboarding'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [step, setStep] = useState('select') // 'select' | 'form'
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectRole = (role) => {
    setForm({ ...form, role })
    setStep('form')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const data = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      setAuth(data)
      navigate(resolveRedirect(data))
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  /* ── Étape 1 : sélection du rôle ── */
  if (step === 'select') {
    return (
      <div className="reg-select-shell">
        <div className="reg-select-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">S</span>
            <span className="auth-logo-text">SkillSet</span>
          </div>
          <h1>Créer un compte</h1>
          <p>Choisissez votre profil pour commencer</p>
        </div>

        <div className="reg-select-cards">
          {/* Carte Candidat */}
          <button className="reg-role-card reg-role-card--candidate" onClick={() => selectRole('CANDIDATE')}>
            <div className="reg-role-card-body">
              <div className="reg-role-icon">
                <User size={32} />
              </div>
              <h2>Candidat</h2>
              <p>Vous cherchez un emploi ? Trouvez l'offre idéale grâce au matching IA.</p>
            </div>
            <div className="reg-role-card-footer">
              <span>Créer un compte candidat</span>
              <ArrowRight size={18} />
            </div>
            <div className="reg-role-card-deco" />
          </button>

          {/* Carte Employeur */}
          <button className="reg-role-card reg-role-card--employer" onClick={() => selectRole('EMPLOYER')}>
            <div className="reg-role-card-body">
              <div className="reg-role-icon">
                <Briefcase size={32} />
              </div>
              <h2>Employeur</h2>
              <p>Vous recrutez ? Publiez vos offres et gérez vos candidatures en un seul endroit.</p>
            </div>
            <div className="reg-role-card-footer">
              <span>Créer un compte employeur</span>
              <ArrowRight size={18} />
            </div>
            <div className="reg-role-card-deco" />
          </button>
        </div>

        <p className="reg-select-login">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    )
  }

  /* ── Étape 2 : formulaire ── */
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="auth-logo-icon">S</span>
            <span className="auth-logo-text">SkillSet</span>
          </div>
          <h1 className="auth-brand-title">
            {form.role === 'CANDIDATE' ? (
              <>Trouvez l'offre<br /><span className="auth-brand-accent">qui vous correspond</span></>
            ) : (
              <>Recrutez les<br /><span className="auth-brand-accent">meilleurs talents</span></>
            )}
          </h1>
          <p className="auth-brand-subtitle">
            {form.role === 'CANDIDATE'
              ? 'Notre IA analyse votre profil et vous propose des offres avec un score de matching personnalisé.'
              : 'Publiez vos offres, gérez le pipeline de candidatures et communiquez directement avec les candidats.'}
          </p>
          <div className="reg-profile-badge">
            {form.role === 'CANDIDATE' ? <User size={20} /> : <Briefcase size={20} />}
            <span>Compte {form.role === 'CANDIDATE' ? 'Candidat' : 'Employeur'}</span>
          </div>
        </div>
        <div className="auth-brand-decoration">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card auth-card-register">
          <button className="reg-back-btn" onClick={() => setStep('select')}>
            <ArrowLeft size={16} />
            Changer de profil
          </button>

          <div className="auth-card-header">
            <h2>Vos informations</h2>
            <p>Remplissez le formulaire pour créer votre compte</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field-group">
              <div className="auth-field">
                <label htmlFor="firstName">Prénom</label>
                <input id="firstName" name="firstName" type="text" placeholder="Jean"
                  value={form.firstName} onChange={handleChange} autoComplete="given-name" />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Nom</label>
                <input id="lastName" name="lastName" type="text" placeholder="Dupont"
                  value={form.lastName} onChange={handleChange} autoComplete="family-name" />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" name="email" type="email" placeholder="vous@exemple.com"
                value={form.email} onChange={handleChange} autoComplete="email" />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="auth-input-wrap">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="8 caractères minimum" value={form.password}
                  onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="auth-input-wrap">
                <input id="confirmPassword" name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                  value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="auth-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>
          <p className="auth-switch">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
