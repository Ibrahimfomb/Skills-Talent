import { useEffect, useState } from 'react'
import { Check, Download, Eye } from 'lucide-react'
import './CvGenerationScreen.css'

const GENERATION_STEPS = [
  { id: 'analysis', label: 'Analyse de vos réponses', duration: 2000 },
  { id: 'content', label: 'Génération du contenu IA', duration: 2500 },
  { id: 'layout', label: 'Mise en page professionnelle', duration: 2000 },
  { id: 'upload', label: 'Upload sécurisé', duration: 1500 },
  { id: 'email', label: 'Envoi par email', duration: 1000 },
]

/**
 * Écran de génération du CV.
 * Phase 1 : Animation d'étapes (loading)
 * Phase 2 : Écran succès avec aperçu CV + actions
 */
export default function CvGenerationScreen({ cvUrl, country, onDownload, onClose }) {
  const [completedSteps, setCompletedSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    if (currentStep >= GENERATION_STEPS.length) {
      setIsGenerating(false)
      return
    }

    const step = GENERATION_STEPS[currentStep]
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, step.id])
      setCurrentStep(prev => prev + 1)
    }, step.duration)

    return () => clearTimeout(timer)
  }, [currentStep])

  if (isGenerating) {
    return (
      <div className="cgs-generating">
        <div className="cgs-generating-card">
          <div className="cgs-generating-header">
            <h2 className="cgs-generating-title">Génération de votre CV...</h2>
            <p className="cgs-generating-subtitle">Un instant, STELLA prépare votre profil</p>
          </div>

          <div className="cgs-steps">
            {GENERATION_STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = idx === currentStep && !isCompleted

              return (
                <div
                  key={step.id}
                  className={`cgs-step ${isCompleted ? 'cgs-step--completed' : ''} ${isCurrent ? 'cgs-step--current' : ''}`}
                >
                  <div className="cgs-step-icon">
                    {isCompleted ? (
                      <Check size={20} className="cgs-step-check" />
                    ) : isCurrent ? (
                      <div className="cgs-step-spinner" />
                    ) : (
                      <div className="cgs-step-dot" />
                    )}
                  </div>
                  <span className="cgs-step-label">{step.label}</span>
                </div>
              )
            })}
          </div>

          <div className="cgs-progress-bar">
            <div
              className="cgs-progress-fill"
              style={{
                width: `${(completedSteps.length / GENERATION_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // SUCCESS SCREEN
  return (
    <div className="cgs-success">
      <div className="cgs-success-card">
        <div className="cgs-success-header">
          <div className="cgs-success-icon">
            <Check size={32} />
          </div>
          <h2 className="cgs-success-title">CV généré avec succès !</h2>
          <p className="cgs-success-subtitle">Votre profil professionnel est prêt</p>
        </div>

        <div className="cgs-success-body">
          <div className="cgs-cv-preview">
            <div className="cgs-cv-thumbnail">
              <div className="cgs-cv-placeholder">
                <span>📄</span>
                <span>CV</span>
              </div>
            </div>
            <div className="cgs-cv-info">
              <p className="cgs-cv-format">Format : PDF</p>
              <p className="cgs-cv-country">Adapté pour {country || 'votre pays'}</p>
              <p className="cgs-cv-ats">✓ Optimisé ATS</p>
            </div>
          </div>

          <div className="cgs-success-messages">
            <div className="cgs-message cgs-message--email">
              <span className="cgs-message-icon">✉️</span>
              <div className="cgs-message-text">
                <p className="cgs-message-title">Email envoyé</p>
                <p className="cgs-message-desc">Un lien de téléchargement vous a été envoyé</p>
              </div>
            </div>

            <div className="cgs-message cgs-message--offers">
              <span className="cgs-message-icon">🎯</span>
              <div className="cgs-message-text">
                <p className="cgs-message-title">Offres personnalisées</p>
                <p className="cgs-message-desc">Vos offres d'emploi sont maintenant filtrées pour {country || 'vous'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cgs-success-actions">
          {cvUrl && (
            <a
              href={cvUrl}
              download
              className="cgs-btn cgs-btn--primary"
              onClick={onDownload}
            >
              <Download size={16} />
              Télécharger mon CV
            </a>
          )}

          <button className="cgs-btn cgs-btn--secondary" onClick={onClose}>
            <Eye size={16} />
            Voir mon profil
          </button>
        </div>

        <div className="cgs-success-footer">
          <p className="cgs-footer-text">
            💡 Conseil : Mettez à jour votre CV régulièrement pour refléter vos dernières expériences
          </p>
        </div>
      </div>
    </div>
  )
}
