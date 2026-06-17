import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase, Users, Sparkles } from 'lucide-react'
import { loginUser } from '../../api/AuthApi'
import { useAuthStore } from '../../store/AuthStore'
import './AuthPage.css'

const ROLE_ROUTES = {
  CANDIDATE: '/dashboard/candidate',
  EMPLOYER:  '/dashboard/employer',
  ADMIN:     '/dashboard/admin',
}

const resolveRedirect = (data) =>
  data.onboardingCompleted ? (ROLE_ROUTES[data.role] ?? '/dashboard/candidate') : '/onboarding'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPassword, setShowPw] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return }
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

      {/* ── Panneau gauche — brand ── */}
      <div className="auth-brand">
        <div className="auth-brand-decoration">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>

        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">S</div>
            <span className="auth-logo-text">SkillSet</span>
          </div>

          <h1 className="auth-brand-title">
            Votre carrière<br />commence <span className="auth-brand-accent">ici</span>
          </h1>

          <p className="auth-brand-subtitle">
            La plateforme qui connecte les talents aux meilleures opportunités professionnelles en Afrique.
          </p>

          <ul className="auth-features">
            <li>
              <span className="auth-feature-icon"><Briefcase size={14} /></span>
              Des milliers d&apos;offres d&apos;emploi
            </li>
            <li>
              <span className="auth-feature-icon"><Users size={14} /></span>
              Mise en relation directe avec les recruteurs
            </li>
            <li>
              <span className="auth-feature-icon"><Sparkles size={14} /></span>
              Analyse IA de votre profil
            </li>
          </ul>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate className="auth-form">

            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email" name="email" type="email"
                placeholder="vous@exemple.com"
                value={form.email} onChange={handleChange} autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="password">Mot de passe</label>
                <Link to="#" className="auth-forgot">Mot de passe oublié ?</Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange} autoComplete="current-password"
                />
                <button
                  type="button" className="auth-eye"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? <span className="auth-spinner" /> : 'Se connecter'}
            </button>

          </form>

          <p className="auth-switch" style={{ marginTop: '24px' }}>
            Pas encore de compte ?{' '}
            <Link to="/register">S&apos;inscrire</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
