import './PhaseIndicator.css'

const PHASES = {
  CANDIDATE: [
    'INTRO',
    'LOCALISATION',
    'EXPERIENCE',
    'COMPETENCES',
    'CONDITIONS',
    'FINISH'
  ],
  EMPLOYER: [
    'INTRO',
    'LOCALISATION',
    'POSTE',
    'PROFIL_RECHERCHE',
    'CONDITIONS',
    'PROCESSUS',
    'FINISH'
  ]
}

/**
 * Indicateur de progression par phases d'onboarding.
 * Affiche les phases complétées, en cours, et à venir.
 */
export default function PhaseIndicator({ currentPhase, userRole = 'CANDIDATE', totalQuestions = 0, completedQuestions = 0 }) {
  const phases = PHASES[userRole] || PHASES.CANDIDATE
  const currentIndex = phases.indexOf(currentPhase)

  const phaseLabels = {
    INTRO: '📋 Intro',
    LOCALISATION: '📍 Localisation',
    EXPERIENCE: '💼 Expérience',
    COMPETENCES: '🎯 Compétences',
    PROJETS: '🚀 Projets',
    CONDITIONS: '💰 Conditions',
    PROCESSUS: '⏳ Processus',
    POSTE: '📌 Poste',
    PROFIL_RECHERCHE: '👥 Profil',
    FINISH: '✅ Fin'
  }

  return (
    <div className="pi-container">
      <div className="pi-phases">
        {phases.map((phase, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isNext = index > currentIndex

          return (
            <div
              key={phase}
              className={`pi-phase ${isCurrent ? 'pi-phase--current' : ''} ${isCompleted ? 'pi-phase--completed' : ''} ${isNext ? 'pi-phase--next' : ''}`}
              title={phase}
            >
              <div className="pi-phase-dot" />
              <span className="pi-phase-label">{phaseLabels[phase] || phase}</span>
              {index < phases.length - 1 && <div className="pi-phase-line" />}
            </div>
          )
        })}
      </div>

      {/* Progress bar détaillée si questions comptabilisées */}
      {totalQuestions > 0 && (
        <div className="pi-progress-bar">
          <div className="pi-progress-track">
            <div
              className="pi-progress-fill"
              style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="pi-progress-label">
            Question {completedQuestions + 1} / {totalQuestions}
          </span>
        </div>
      )}
    </div>
  )
}
