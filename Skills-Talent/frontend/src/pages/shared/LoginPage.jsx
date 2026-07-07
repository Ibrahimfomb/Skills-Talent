import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase, Users, Sparkles, ShieldCheck } from 'lucide-react'
import { loginUser, verify2faLogin } from '../../api/AuthApi'
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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  // ── État 2FA ─────────────────────────────────────────────────────────────
  const [step, setStep]               = useState('credentials') // 'credentials' | 'totp'
  const [preAuthToken, setPreAuth]    = useState('')
  const [totpCode, setTotpCode]       = useState('')

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  // ── Étape 1 : email + mot de passe ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    try {
      const data = await loginUser({ email: form.email, password: form.password })
      if (data.twoFactorRequired) {
        setPreAuth(data.preAuthToken)
        setStep('totp')
        return
      }
      setAuth(data)
      navigate(resolveRedirect(data))
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 2 : code TOTP ───────────────────────────────────────────────────
  const handleTotpSubmit = async (e) => {
    e.preventDefault()
    const cleaned = totpCode.replace(/\s/g, '')
    if (cleaned.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return }
    setLoading(true)
    try {
      const data = await verify2faLogin(preAuthToken, cleaned)
      setAuth(data)
      navigate(resolveRedirect(data))
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.')
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
              <span className="auth-feature-icon"><Briefcase size={14} /></span>{' '}
              Des milliers d&apos;offres d&apos;emploi
            </li>
            <li>
              <span className="auth-feature-icon"><Users size={14} /></span>{' '}
              Mise en relation directe avec les recruteurs
            </li>
            <li>
              <span className="auth-feature-icon"><Sparkles size={14} /></span>{' '}
              Analyse IA de votre profil
            </li>
          </ul>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="auth-form-panel">
        <div className="auth-card">

          {/* ── Étape 1 : identifiants ── */}
          {step === 'credentials' && (
            <>
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
                      onClick={() => setShowPassword(v => !v)}
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
            </>
          )}

          {/* ── Étape 2 : code TOTP ── */}
          {step === 'totp' && (
            <>
              <div className="auth-card-header">
                <span className="auth-2fa-icon"><ShieldCheck size={32} /></span>
                <h2>Vérification en deux étapes</h2>
                <p>Entrez le code à 6 chiffres généré par votre application d&apos;authentification.</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleTotpSubmit} noValidate className="auth-form">
                <div className="auth-field">
                  <label htmlFor="totpCode">Code d&apos;authentification</label>
                  <input
                    id="totpCode"
                    name="totpCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9 ]*"
                    maxLength={7}
                    placeholder="000 000"
                    value={totpCode}
                    onChange={(e) => { setTotpCode(e.target.value); setError('') }}
                    autoComplete="one-time-code"
                    autoFocus
                    style={{ letterSpacing: '0.25em', fontSize: '1.4rem', textAlign: 'center' }}
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? <span className="auth-spinner" /> : 'Vérifier'}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="auth-forgot"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => { setStep('credentials'); setError(''); setTotpCode('') }}
                >
                  Retour à la connexion
                </button>
              </p>
            </>
          )}

        </div>
      </div>

    </div>
  )
}
