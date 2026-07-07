import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Briefcase, ChevronRight } from 'lucide-react'
import { registerUser } from '../../api/AuthApi'
import { useAuthStore } from '../../store/AuthStore'
import './RegisterPage.css'
import './AuthPage.css'

const ROLE_ROUTES = {
  CANDIDATE: '/dashboard/candidate',
  EMPLOYER:  '/dashboard/employer',
}

const resolveRedirect = (data) =>
  data.onboardingCompleted ? (ROLE_ROUTES[data.role] ?? '/dashboard/candidate') : '/onboarding'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [step, setStep]           = useState('select')
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: '' })
  const [showPassword, setShowPw] = useState(false)
  const [showConfirm, setShowCf]  = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const selectRole = (role) => { setForm({ ...form, role }); setStep('form') }
  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password)
      return setError('Veuillez remplir tous les champs.')
    if (form.password.length < 8)
      return setError('Le mot de passe doit contenir au moins 8 caractères.')
    if (form.password !== form.confirmPassword)
      return setError('Les mots de passe ne correspondent pas.')
    setLoading(true)
    try {
      const data = await registerUser({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password, role: form.role,
      })
      setAuth(data)
      navigate(resolveRedirect(data))
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  /* ── Étape 1 — Choix du profil ── */
  if (step === 'select') {
    return (
      <div className="reg-select-shell">

        <div className="reg-select-header">
          <div className="auth-logo" style={{ justifyContent: 'center' }}>
            <div className="auth-logo-icon">S</div>
            <span className="auth-logo-text" style={{ color: '#1a1a1a' }}>SkillSet</span>
          </div>
          <h1>Rejoignez SkillSet</h1>
          <p>Choisissez votre profil pour commencer</p>
        </div>

        <div className="reg-select-cards">

          <button className="reg-role-card reg-role-card--candidate" onClick={() => selectRole('CANDIDATE')}>
            <div className="reg-role-card-body">
              <div className="reg-role-icon"><User size={24} /></div>
              <h2>Candidat</h2>
              <p>Trouvez votre prochain emploi grâce à notre matching IA et des milliers d&apos;offres vérifiées.</p>
            </div>
            <div className="reg-role-card-footer">
              <span>Commencer</span>
              <ChevronRight size={16} />
            </div>
            <div className="reg-role-card-deco" />
          </button>

          <button className="reg-role-card reg-role-card--employer" onClick={() => selectRole('EMPLOYER')}>
            <div className="reg-role-card-body">
              <div className="reg-role-icon"><Briefcase size={24} /></div>
              <h2>Recruteur</h2>
              <p>Publiez vos offres et trouvez les meilleurs talents grâce à notre analyse de CV intelligente.</p>
            </div>
            <div className="reg-role-card-footer">
              <span>Commencer</span>
              <ChevronRight size={16} />
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

  /* ── Étape 2 — Formulaire d'inscription ── */
  return (
    <div className="auth-shell">

      {/* Panneau gauche */}
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
            {form.role === 'CANDIDATE'
              ? <>Trouvez le poste <span className="auth-brand-accent">idéal</span></>
              : <>Recrutez les <span className="auth-brand-accent">meilleurs talents</span></>
            }
          </h1>
          <p className="auth-brand-subtitle">
            {form.role === 'CANDIDATE'
              ? "Des milliers d'offres vous attendent. Notre IA analyse votre profil pour des recommandations personnalisées."
              : "Publiez vos offres et accédez à un vivier de talents qualifiés. L'IA sélectionne les meilleurs profils pour vous."
            }
          </p>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="auth-form-panel">
        <div className="auth-card auth-card-register">

          <div className="auth-card-header">
            <button className="reg-back-btn" onClick={() => setStep('select')}>
              ← Retour
            </button>
            <h2>Vos informations</h2>
            <p>Créez votre compte en quelques secondes</p>
            <div className="reg-profile-badge">
              {form.role === 'CANDIDATE'
                ? <><User size={13} /> Candidat</>
                : <><Briefcase size={13} /> Recruteur</>
              }
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate className="auth-form">

            <div className="auth-field-group">
              <div className="auth-field">
                <label htmlFor="firstName">Prénom</label>
                <input
                  id="firstName" name="firstName" type="text" placeholder="Prénom"
                  value={form.firstName} onChange={handleChange} autoComplete="given-name"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Nom</label>
                <input
                  id="lastName" name="lastName" type="text" placeholder="Nom"
                  value={form.lastName} onChange={handleChange} autoComplete="family-name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email" name="email" type="email" placeholder="vous@exemple.com"
                value={form.email} onChange={handleChange} autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="auth-input-wrap">
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="8 caractères minimum"
                  value={form.password} onChange={handleChange} autoComplete="new-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="auth-input-wrap">
                <input
                  id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword} onChange={handleChange} autoComplete="new-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowCf(v => !v)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? <span className="auth-spinner" /> : 'Créer mon compte'}
            </button>

          </form>

          <p className="auth-switch" style={{ marginTop: '20px' }}>
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>

        </div>
      </div>

    </div>
  )
}
