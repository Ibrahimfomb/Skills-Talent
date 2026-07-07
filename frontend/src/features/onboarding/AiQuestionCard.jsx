import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import CountrySelector from './CountrySelector'
import SalarySelector from './SalarySelector'
import './AiQuestionCard.css'

/**
 * Composant dispatcher pour les questions d'onboarding IA.
 * Affiche le bon type d'input selon inputType :
 * - country → CountrySelector
 * - city → Select avec villes filtrées
 * - salary → SalarySelector
 * - phone → Input avec préfixe pays
 * - select → Select standard avec options
 * - text/textarea → Input/Textarea standard
 */
export default function AiQuestionCard({
  question,
  value = '',
  onChange,
  onSubmit,
  context = {},
  isLoading = false,
  disabled = false
}) {
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!value || !String(value).trim()) {
      setError('Veuillez répondre à cette question')
      return
    }
    setError('')
    onSubmit?.(value)
  }

  if (!question) {
    return null
  }

  const renderInput = () => {
    switch (question.inputType) {
      case 'country':
        return (
          <CountrySelector
            value={value}
            onChange={(fieldKey, val) => onChange(val)}
            previousAnswers={[]} // À passer depuis parent si nécessaire
          />
        )

      case 'city':
        return (
          <div className="aqc-field">
            <label className="aqc-label">{question.placeholder || 'Ville'}</label>
            <select
              className={`aqc-input aqc-select ${error ? 'aqc-input--error' : ''}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={context.availableCities?.length === 0}
            >
              <option value="">Sélectionner une ville...</option>
              {context.availableCities?.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {context.availableCities?.length === 0 && (
              <p className="aqc-help-text">Choisissez d'abord votre pays</p>
            )}
          </div>
        )

      case 'salary':
        return (
          <SalarySelector
            value={value}
            onChange={(fieldKey, val) => onChange(val)}
            salaryRanges={context.salaryRanges || []}
            currencySymbol={context.currencySymbol || '€'}
            salaryPeriod={context.salaryPeriod || 'annuel'}
            disabled={!context.country}
            disabledMessage="Choisissez d'abord votre pays"
          />
        )

      case 'phone':
        return (
          <div className="aqc-field">
            <label className="aqc-label">Téléphone</label>
            <div className="aqc-phone-wrapper">
              <span className="aqc-phone-prefix">{context.phonePrefix || '+'}</span>
              <input
                type="tel"
                className={`aqc-input aqc-phone-input ${error ? 'aqc-input--error' : ''}`}
                placeholder={question.placeholder || 'Numéro de téléphone'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          </div>
        )

      case 'select':
        return (
          <div className="aqc-field">
            <label className="aqc-label">{question.question}</label>
            <select
              className={`aqc-input aqc-select ${error ? 'aqc-input--error' : ''}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {question.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )

      case 'textarea':
        return (
          <div className="aqc-field">
            <label className="aqc-label">{question.question}</label>
            <textarea
              className={`aqc-input aqc-textarea ${error ? 'aqc-input--error' : ''}`}
              placeholder={question.placeholder || 'Tapez votre réponse...'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
            />
          </div>
        )

      case 'text':
      case 'number':
      default:
        return (
          <div className="aqc-field">
            <label className="aqc-label">{question.question}</label>
            <input
              type={question.inputType === 'number' ? 'number' : 'text'}
              className={`aqc-input ${error ? 'aqc-input--error' : ''}`}
              placeholder={question.placeholder || 'Tapez votre réponse...'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )
    }
  }

  return (
    <div className="aqc-container">
      <div className="aqc-card">
        {/* QUESTION PRINCIPALE */}
        {question.inputType !== 'country' && question.inputType !== 'city' && question.inputType !== 'salary' && (
          <h3 className="aqc-question">{question.question}</h3>
        )}

        {/* INPUT CONTEXTUEL */}
        <div className="aqc-input-wrapper">
          {renderInput()}
        </div>

        {/* ERREUR */}
        {error && (
          <p className="aqc-error">{error}</p>
        )}

        {/* NOTE CONTEXTUELLE */}
        {question.contextualNote && (
          <p className="aqc-note">💡 {question.contextualNote}</p>
        )}

        {/* BOUTON SUBMIT */}
        <button
          className="aqc-submit"
          onClick={handleSubmit}
          disabled={isLoading || disabled || !value}
        >
          {isLoading ? 'Chargement...' : 'Continuer'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
