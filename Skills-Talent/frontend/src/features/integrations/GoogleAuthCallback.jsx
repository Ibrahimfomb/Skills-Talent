import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { confirmGoogleAuth } from '../../api/IntegrationsApi'

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) {
          setStatus('error')
          setError('Code d\'autorisation manquant. Veuillez réessayer.')
          return
        }

        // Send code to backend to exchange for access token
        await confirmGoogleAuth(code)

        setStatus('success')

        // Redirect to integrations page after 2 seconds
        setTimeout(() => {
          navigate('/settings/integrations')
        }, 2000)
      } catch (err) {
        console.error('Error during Google auth callback:', err)
        setStatus('error')
        setError(
          err.response?.data?.message ||
            'Erreur lors de la connexion à Google Calendar. Veuillez réessayer.'
        )
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  const handleRetry = () => {
    navigate('/settings/integrations')
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9f9f9',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px 32px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {status === 'loading' && (
          <>
            <Loader2
              size={48}
              style={{
                color: '#c42033',
                marginBottom: '20px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h1 style={{ fontSize: '20px', color: '#222', margin: '0 0 8px 0' }}>
              Connexion en cours...
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Veuillez patienter pendant la connexion à Google Calendar
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle
              size={48}
              style={{
                color: '#2e7d32',
                marginBottom: '20px',
              }}
            />
            <h1 style={{ fontSize: '20px', color: '#222', margin: '0 0 8px 0' }}>
              Connexion réussie !
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
              Votre Google Calendar a été connecté avec succès
            </p>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
              Redirection vers les paramètres...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle
              size={48}
              style={{
                color: '#c42033',
                marginBottom: '20px',
              }}
            />
            <h1 style={{ fontSize: '20px', color: '#222', margin: '0 0 8px 0' }}>
              Erreur de connexion
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
              {error}
            </p>
            <button
              onClick={handleRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                background: '#c42033',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(196,32,51,0.15)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#a81729'
                e.target.style.boxShadow = '0 4px 12px rgba(196,32,51,0.25)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#c42033'
                e.target.style.boxShadow = '0 2px 4px rgba(196,32,51,0.15)'
              }}
            >
              Retour aux paramètres
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
