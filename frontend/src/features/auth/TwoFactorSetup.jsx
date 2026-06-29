import { useState } from 'react'
import { ShieldCheck, ShieldOff, ShieldAlert, Copy, Check } from 'lucide-react'
import { setup2fa, confirm2fa, disable2fa } from '../../api/AuthApi'
import { useAuthStore } from '../../store/AuthStore'

/**
 * Composant de gestion du 2FA dans les paramètres de sécurité.
 * Trois états : idle → setup (QR affiché) → enabled.
 */
export default function TwoFactorSetup() {
  const { user, updateUser } = useAuthStore()
  const isEnabled = Boolean(user?.twoFactorEnabled)

  const [phase, setPhase]         = useState('idle')   // 'idle' | 'qr' | 'disabling'
  const [qrData, setQrData]       = useState(null)     // { secret, qrCodeUri, qrCodeImageBase64 }
  const [code, setCode]           = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [copied, setCopied]       = useState(false)

  // ── Lancer la configuration ───────────────────────────────────────────────
  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await setup2fa()
      setQrData(data)
      setPhase('qr')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de générer le QR code.')
    } finally {
      setLoading(false)
    }
  }

  // ── Confirmer la configuration (premier code) ─────────────────────────────
  const handleConfirm = async (e) => {
    e.preventDefault()
    const cleaned = code.replace(/\s/g, '')
    if (cleaned.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return }
    setLoading(true)
    setError('')
    try {
      await confirm2fa(cleaned)
      updateUser({ twoFactorEnabled: true })
      setPhase('idle')
      setQrData(null)
      setCode('')
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide.')
    } finally {
      setLoading(false)
    }
  }

  // ── Désactiver ────────────────────────────────────────────────────────────
  const handleDisable = async (e) => {
    e.preventDefault()
    const cleaned = code.replace(/\s/g, '')
    if (cleaned.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return }
    setLoading(true)
    setError('')
    try {
      await disable2fa(cleaned)
      updateUser({ twoFactorEnabled: false })
      setPhase('idle')
      setCode('')
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide.')
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    if (!qrData?.secret) return
    navigator.clipboard.writeText(qrData.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Rendu : 2FA désactivée ────────────────────────────────────────────────
  if (!isEnabled && phase === 'idle') {
    return (
      <div className="tfa-card">
        <div className="tfa-status tfa-status--off">
          <ShieldOff size={20} />
          <span>Authentification à deux facteurs <strong>désactivée</strong></span>
        </div>
        <p className="tfa-desc">
          Protégez votre compte avec une application comme Google Authenticator ou Authy.
          À chaque connexion, un code temporaire vous sera demandé en plus de votre mot de passe.
        </p>
        <button className="tfa-btn tfa-btn--primary" onClick={handleSetup} disabled={loading}>
          {loading ? <span className="auth-spinner" /> : 'Activer la vérification en deux étapes'}
        </button>
        {error && <p className="tfa-error">{error}</p>}
      </div>
    )
  }

  // ── Rendu : affichage du QR code ──────────────────────────────────────────
  if (phase === 'qr' && qrData) {
    return (
      <div className="tfa-card">
        <div className="tfa-status tfa-status--pending">
          <ShieldAlert size={20} />
          <span>Configuration en cours — scannez le QR code</span>
        </div>

        <ol className="tfa-steps">
          <li>Ouvrez <strong>Google Authenticator</strong>, <strong>Authy</strong> ou une app compatible.</li>
          <li>Appuyez sur <strong>+</strong> puis <strong>Scanner un QR code</strong>.</li>
          <li>Scannez le code ci-dessous, puis entrez le code à 6 chiffres généré.</li>
        </ol>

        <div className="tfa-qr-wrap">
          <img src={qrData.qrCodeImageBase64} alt="QR code 2FA" className="tfa-qr" />
        </div>

        <div className="tfa-secret-row">
          <span className="tfa-secret-label">Clé manuelle :</span>
          <code className="tfa-secret">{qrData.secret}</code>
          <button type="button" className="tfa-copy" onClick={copySecret} title="Copier la clé">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {error && <p className="tfa-error">{error}</p>}

        <form onSubmit={handleConfirm} className="tfa-verify-form">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9 ]*"
            maxLength={7}
            placeholder="000 000"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError('') }}
            autoComplete="one-time-code"
            className="tfa-code-input"
            autoFocus
          />
          <button type="submit" className="tfa-btn tfa-btn--primary" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Confirmer et activer'}
          </button>
        </form>

        <button
          type="button"
          className="tfa-btn tfa-btn--ghost"
          onClick={() => { setPhase('idle'); setQrData(null); setCode(''); setError('') }}
        >
          Annuler
        </button>
      </div>
    )
  }

  // ── Rendu : 2FA activée ───────────────────────────────────────────────────
  if (isEnabled && phase === 'idle') {
    return (
      <div className="tfa-card">
        <div className="tfa-status tfa-status--on">
          <ShieldCheck size={20} />
          <span>Authentification à deux facteurs <strong>activée</strong></span>
        </div>
        <p className="tfa-desc">
          Votre compte est protégé. Un code vous sera demandé à chaque connexion.
        </p>
        <button
          className="tfa-btn tfa-btn--danger"
          onClick={() => { setPhase('disabling'); setCode(''); setError('') }}
        >
          Désactiver la vérification en deux étapes
        </button>
      </div>
    )
  }

  // ── Rendu : confirmation pour désactiver ──────────────────────────────────
  if (phase === 'disabling') {
    return (
      <div className="tfa-card">
        <div className="tfa-status tfa-status--on">
          <ShieldCheck size={20} />
          <span>Confirmez la désactivation</span>
        </div>
        <p className="tfa-desc">
          Entrez un code depuis votre application pour confirmer la désactivation.
        </p>

        {error && <p className="tfa-error">{error}</p>}

        <form onSubmit={handleDisable} className="tfa-verify-form">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9 ]*"
            maxLength={7}
            placeholder="000 000"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError('') }}
            autoComplete="one-time-code"
            className="tfa-code-input"
            autoFocus
          />
          <button type="submit" className="tfa-btn tfa-btn--danger" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Confirmer la désactivation'}
          </button>
        </form>

        <button
          type="button"
          className="tfa-btn tfa-btn--ghost"
          onClick={() => { setPhase('idle'); setCode(''); setError('') }}
        >
          Annuler
        </button>
      </div>
    )
  }

  return null
}
