import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Check, Link as LinkIcon } from 'lucide-react'
import { getGoogleAuthUrl, getGoogleStatus, disconnectGoogle, testFranceTravailConnection } from '../../api/IntegrationsApi'
import AppNavbar from '../../components/common/AppNavbar'
import './IntegrationsPage.css'

export default function IntegrationsPage() {
  // Google Calendar state
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleLoading, setGoogleLoading] = useState(true)
  const [googleDisconnecting, setGoogleDisconnecting] = useState(false)

  // France Travail state
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [franceTravailConnected, setFranceTravailConnected] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [franceTravailError, setFranceTravailError] = useState('')
  const [franceTravailSuccess, setFranceTravailSuccess] = useState(false)

  // Toast
  const [toastMessage, setToastMessage] = useState('')

  // Load Google status on mount
  useEffect(() => {
    loadGoogleStatus()
  }, [])

  const loadGoogleStatus = async () => {
    try {
      setGoogleLoading(true)
      const data = await getGoogleStatus()
      setGoogleConnected(data.connected ?? false)
      setGoogleEmail(data.email ?? '')
    } catch (err) {
      console.error('Error loading Google status:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const data = await getGoogleAuthUrl()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (err) {
      console.error('Error getting Google auth URL:', err)
      showToast('Erreur lors de la connexion à Google')
    }
  }

  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir déconnecter votre Google Calendar ?')) return

    try {
      setGoogleDisconnecting(true)
      await disconnectGoogle()
      setGoogleConnected(false)
      setGoogleEmail('')
      showToast('Google Calendar déconnecté')
    } catch (err) {
      console.error('Error disconnecting Google:', err)
      showToast('Erreur lors de la déconnexion')
    } finally {
      setGoogleDisconnecting(false)
    }
  }

  const handleTestFranceTravail = async () => {
    if (!clientId || !clientSecret) {
      setFranceTravailError('Veuillez remplir les champs Client ID et Client Secret')
      return
    }

    try {
      setTestingConnection(true)
      setFranceTravailError('')
      setFranceTravailSuccess(false)

      await testFranceTravailConnection(clientId, clientSecret)
      setFranceTravailConnected(true)
      setFranceTravailSuccess(true)
      showToast('Connexion à France Travail réussie')
      setTimeout(() => setFranceTravailSuccess(false), 3000)
    } catch (err) {
      console.error('Error testing France Travail connection:', err)
      setFranceTravailConnected(false)
      setFranceTravailError(err.response?.data?.message || 'Erreur de connexion à France Travail')
    } finally {
      setTestingConnection(false)
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <div className="st-shell">
      <AppNavbar />

      <div className="st-body">
        <main className="integrations-main">
          <h1 className="integrations-title">Intégrations</h1>
          <p className="integrations-subtitle">Gérez vos connexions avec les services externes</p>

          {/* Toast */}
          {toastMessage && (
            <div className={`integrations-toast ${toastMessage.includes('Erreur') ? 'integrations-toast--error' : ''}`}>
              {toastMessage}
            </div>
          )}

          <div className="integrations-container">
            {/* ── Google Calendar Section ── */}
            <section className="integration-card">
              <div className="integration-header">
                <div>
                  <h2 className="integration-title">Google Calendar</h2>
                  <p className="integration-description">
                    Synchronisez automatiquement vos entretiens avec Google Calendar
                  </p>
                </div>
                {googleLoading ? (
                  <Loader2 size={20} className="integration-spin" />
                ) : googleConnected ? (
                  <div className="integration-badge integration-badge--success">
                    <Check size={14} />
                    Connecté
                  </div>
                ) : (
                  <div className="integration-badge integration-badge--inactive">
                    Non connecté
                  </div>
                )}
              </div>

              <p className="integration-explain">
                Les entretiens créés seront automatiquement ajoutés à votre Google Calendar et des invitations
                envoyées aux candidats.
              </p>

              {googleLoading ? (
                <div className="integration-loading">
                  <Loader2 size={20} className="integration-spin" />
                  Chargement...
                </div>
              ) : googleConnected ? (
                <div className="integration-connected">
                  <div className="integration-info">
                    <p className="integration-info-label">Compte connecté :</p>
                    <p className="integration-info-value">{googleEmail}</p>
                  </div>
                  <button
                    className="integration-btn integration-btn--disconnect"
                    onClick={handleDisconnectGoogle}
                    disabled={googleDisconnecting}
                  >
                    {googleDisconnecting ? <Loader2 size={14} className="integration-spin" /> : null}
                    Déconnecter
                  </button>
                </div>
              ) : (
                <button
                  className="integration-btn integration-btn--primary"
                  onClick={handleConnectGoogle}
                >
                  <LinkIcon size={16} />
                  Connecter Google Calendar
                </button>
              )}
            </section>

            {/* ── France Travail Section ── */}
            <section className="integration-card">
              <div className="integration-header">
                <div>
                  <h2 className="integration-title">France Travail</h2>
                  <p className="integration-description">
                    Publiez vos offres d&apos;emploi sur France Travail
                  </p>
                </div>
                {franceTravailConnected ? (
                  <div className="integration-badge integration-badge--success">
                    <Check size={14} />
                    Connecté
                  </div>
                ) : (
                  <div className="integration-badge integration-badge--inactive">
                    Non connecté
                  </div>
                )}
              </div>

              <p className="integration-explain">
                Connectez vos identifiants France Travail pour pouvoir publier vos offres d&apos;emploi directement
                depuis SkillSet.
              </p>

              {franceTravailError && (
                <div className="integration-error">
                  <AlertCircle size={16} />
                  {franceTravailError}
                </div>
              )}

              {franceTravailSuccess && (
                <div className="integration-success">
                  <Check size={16} />
                  Connexion réussie !
                </div>
              )}

              <div className="integration-form">
                <div className="form-group">
                  <label className="form-label">Client ID</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Entrez votre Client ID"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client Secret</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Entrez votre Client Secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                  />
                </div>

                <button
                  className="integration-btn integration-btn--primary"
                  onClick={handleTestFranceTravail}
                  disabled={testingConnection}
                >
                  {testingConnection ? <Loader2 size={14} className="integration-spin" /> : null}
                  Sauvegarder et tester
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
