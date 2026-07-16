import { useState } from 'react'
import { ShieldCheck, ShieldOff, ShieldAlert, Copy, Check } from 'lucide-react'
import { setup2fa, confirm2fa, disable2fa } from '../../api/AuthApi'
import { useAuthStore } from '../../store/AuthStore'
import { useTranslation } from '../../i18n/translations'

/**
 * Composant de gestion du 2FA dans les paramètres de sécurité.
 * Trois états : idle → setup (QR affiché) → enabled.
 */
export default function TwoFactorSetup() {
  const t = useTranslation().twoFactorSetup
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
      setError(err.response?.data?.message || t.qrError)
    } finally {
      setLoading(false)
    }
  }

  // ── Confirmer la configuration (premier code) ─────────────────────────────
  const handleConfirm = async (e) => {
    e.preventDefault()
    const cleaned = code.replace(/\s/g, '')
    if (cleaned.length !== 6) { setError(t.codeLength); return }
    setLoading(true)
    setError('')
    try {
      await confirm2fa(cleaned)
      updateUser({ twoFactorEnabled: true })
      setPhase('idle')
      setQrData(null)
      setCode('')
    } catch (err) {
      setError(err.response?.data?.message || t.invalidCode)
    } finally {
      setLoading(false)
    }
  }

  // ── Désactiver ────────────────────────────────────────────────────────────
  const handleDisable = async (e) => {
    e.preventDefault()
    const cleaned = code.replace(/\s/g, '')
    if (cleaned.length !== 6) { setError(t.codeLength); return }
    setLoading(true)
    setError('')
    try {
      await disable2fa(cleaned)
      updateUser({ twoFactorEnabled: false })
      setPhase('idle')
      setCode('')
    } catch (err) {
      setError(err.response?.data?.message || t.invalidCode)
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
          <span>{t.disabledStatus} <strong>{t.disabledLabel}</strong></span>
        </div>
        <p className="tfa-desc">
          {t.protectAccount}
        </p>
        <button className="tfa-btn tfa-btn--primary" onClick={handleSetup} disabled={loading}>
          {loading ? <span className="auth-spinner" /> : t.enable2fa}
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
          <span>{t.settingUp}</span>
        </div>

        <ol className="tfa-steps">
          <li>{t.step1} <strong>{t.step1Apps}</strong></li>
          <li>{t.step2} <strong>+</strong> {t.step2Action}</li>
          <li>{t.step3}</li>
        </ol>

        <div className="tfa-qr-wrap">
          <img src={qrData.qrCodeImageBase64} alt={t.qrAlt} className="tfa-qr" />
        </div>

        <div className="tfa-secret-row">
          <span className="tfa-secret-label">{t.manualKey}</span>
          <code className="tfa-secret">{qrData.secret}</code>
          <button type="button" className="tfa-copy" onClick={copySecret} title={t.copyKey}>
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
            {loading ? <span className="auth-spinner" /> : t.confirmAndEnable}
          </button>
        </form>

        <button
          type="button"
          className="tfa-btn tfa-btn--ghost"
          onClick={() => { setPhase('idle'); setQrData(null); setCode(''); setError('') }}
        >
          {t.cancel}
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
          <span>{t.disabledStatus} <strong>{t.enabledLabel}</strong></span>
        </div>
        <p className="tfa-desc">
          {t.accountProtected}
        </p>
        <button
          className="tfa-btn tfa-btn--danger"
          onClick={() => { setPhase('disabling'); setCode(''); setError('') }}
        >
          {t.disable2fa}
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
          <span>{t.confirmDisableTitle}</span>
        </div>
        <p className="tfa-desc">
          {t.confirmDisableDesc}
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
            {loading ? <span className="auth-spinner" /> : t.confirmDisable}
          </button>
        </form>

        <button
          type="button"
          className="tfa-btn tfa-btn--ghost"
          onClick={() => { setPhase('idle'); setCode(''); setError('') }}
        >
          {t.cancel}
        </button>
      </div>
    )
  }

  return null
}
