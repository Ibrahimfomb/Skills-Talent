import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase, Users, Zap } from 'lucide-react'
import { loginUser } from '../../api/AuthApi'
import { useAuthStore } from '../../store/AuthStore'
import './AuthPage.css'

const ROLE_ROUTES = {
  CANDIDATE: '/dashboard/candidate',
  EMPLOYER: '/dashboard/employer',
  ADMIN: '/dashboard/admin',
}

const resolveRedirect = (data) =>
  data.onboardingCompleted ? (ROLE_ROUTES[data.role] ?? '/dashboard/candidate') : '/onboarding'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      const data = await loginUser({ email: form.email, password: form.password })
      setAuth(data)
      navigate(resolveRedirect(data))
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="auth-logo-icon">S</span>
            <span className="auth-logo-text">SkillSet</span>
          </div>
          <h1 className="auth-brand-title">
            La plateforme de recrutement<br />
            <span className="auth-brand-accent">pilotée par l'IA</span>
          </h1>
          <p className="auth-brand-subtitle">
            Connectez candidats et employeurs grâce à un matching intelligent
            et un suivi complet du processus de recrutement.
          </p>
          <ul className="auth-features">
            <li>
              <span className="auth-feature-icon"><Users size={16} /></span>
              Matching IA candidats / offres
            </li>
            <li>
              <span className="auth-feature-icon"><Briefcase size={16} /></span>
              Pipeline de candidatures complet
            </li>
            <li>
              <span className="auth-feature-icon"><Zap size={16} /></span>
              Messagerie et notifications en temps réel
            </li>
          </ul>
        </div>
        <div className="auth-brand-decoration">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Bon retour</h2>
            <p>Connectez-vous à votre espace</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="password">Mot de passe</label>
                <Link to="#" className="auth-forgot">Mot de passe oublié ?</Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Se connecter'}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
