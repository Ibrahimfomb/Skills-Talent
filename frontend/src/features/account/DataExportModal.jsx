import { useState } from 'react'
import { X, Download, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import { exportMyData } from '../../api/GdprApi'

export default function DataExportModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuthStore()

  const handleExport = async () => {
    setLoading(true)
    setError('')
    try {
      await exportMyData()
      setSent(true)
    } catch (e) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="dem-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="dem-modal">
        <div className="dem-header">
          <h2 className="dem-title">Exporter mes données (Article 20 RGPD)</h2>
          <button className="dem-close" onClick={onClose}><X size={18} /></button>
        </div>

        {!sent ? (
          <>
            <p className="dem-desc">
              Conformément au RGPD, vous pouvez obtenir une copie de l'ensemble
              de vos données personnelles. L'export contiendra :
            </p>
            <ul className="dem-list">
              <li>Votre profil et informations personnelles</li>
              <li>Vos candidatures et réponses aux questions</li>
              <li>Vos messages et conversations</li>
              <li>Vos entretiens planifiés</li>
              <li>Vos préférences et paramètres</li>
              <li>Votre historique de consentements</li>
            </ul>
            <p className="dem-note">
              La génération peut prendre quelques minutes.
            </p>
            {error && <p className="dem-error">{error}</p>}
            <div className="dem-actions">
              <button className="dem-cancel-btn" onClick={onClose}>Annuler</button>
              <button className="dem-export-btn" onClick={handleExport} disabled={loading}>
                {loading
                  ? <><Loader2 size={16} className="dem-spin" /> Envoi en cours…</>
                  : <><Download size={16} /> Recevoir mes données par email</>
                }
              </button>
            </div>
          </>
        ) : (
          <div className="dem-success">
            <CheckCircle size={40} className="dem-check" />
            <p>Un email a été envoyé à <strong>{user?.email}</strong></p>
            <p className="dem-note">La génération peut prendre quelques minutes.</p>
            <button className="dem-cancel-btn" onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>

      <style>{`
        .dem-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }
        .dem-modal {
          background: var(--color-surface, #fff); border-radius: 12px;
          padding: 28px; width: 100%; max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .dem-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .dem-title { font-size: 1.05rem; font-weight: 600; margin: 0; }
        .dem-close {
          background: none; border: none; cursor: pointer;
          color: var(--color-text-muted, #666); padding: 4px;
        }
        .dem-desc {
          color: var(--color-text, #333); font-size: 0.875rem;
          line-height: 1.6; margin-bottom: 12px;
        }
        .dem-list {
          color: var(--color-text-muted, #555); font-size: 0.875rem;
          line-height: 1.8; padding-left: 20px; margin-bottom: 16px;
        }
        .dem-note {
          font-size: 0.8rem; color: var(--color-text-muted, #888);
          font-style: italic; margin-bottom: 20px;
        }
        .dem-error { color: #c0392b; font-size: 0.85rem; margin-bottom: 12px; }
        .dem-actions {
          display: flex; gap: 10px; justify-content: flex-end;
        }
        .dem-cancel-btn {
          padding: 10px 20px; border: 1.5px solid #ddd; border-radius: 8px;
          background: none; cursor: pointer; font-size: 0.9rem;
          color: var(--color-text, #333);
        }
        .dem-export-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border: none; border-radius: 8px;
          background: var(--color-primary, #2563eb); color: #fff;
          cursor: pointer; font-size: 0.9rem; font-weight: 500;
        }
        .dem-export-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .dem-success {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 20px 0; text-align: center;
        }
        .dem-check { color: #27ae60; }
        .dem-success p { margin: 0; font-size: 0.95rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dem-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}
