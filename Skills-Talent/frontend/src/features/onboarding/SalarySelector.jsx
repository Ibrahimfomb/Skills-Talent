import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import './SalarySelector.css'

/**
 * Sélecteur de salaire contextualisé.
 * Affiche fourchettes adaptées au pays + devise locale.
 * Peut être sélect ou input libre selon la devise.
 */
export default function SalarySelector({
  value,
  onChange,
  salaryRanges = [],
  currencySymbol = '€',
  salaryPeriod = 'annuel',
  disabled = false,
  disabledMessage = ''
}) {
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [open, setOpen] = useState(false)

  const handleSelectRange = (range) => {
    onChange('salary', range)
    setIsCustom(false)
    setCustomValue('')
    setOpen(false)
  }

  const handleCustomChange = (e) => {
    const val = e.target.value
    setCustomValue(val)
    onChange('salary', val)
  }

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange('salary', customValue)
      setIsCustom(false)
    }
  }

  const displayValue = isCustom ? customValue : (value || '')

  if (disabled) {
    return (
      <div className="ss-container ss-container--disabled">
        <div className="ss-label">Salaire souhaité</div>
        <div className="ss-disabled-message">
          {disabledMessage || 'Choisissez d\'abord votre pays'}
        </div>
      </div>
    )
  }

  return (
    <div className="ss-container">
      <label className="ss-label">
        Salaire souhaité <span className="ss-period">({salaryPeriod})</span>
      </label>

      {isCustom ? (
        // INPUT libre
        <div className="ss-custom-input-wrapper">
          <input
            type="text"
            className="ss-custom-input"
            placeholder={`Ex: 50 000 ${currencySymbol}/${salaryPeriod === 'mensuel' ? 'mois' : 'an'}`}
            value={customValue}
            onChange={handleCustomChange}
            onBlur={handleCustomSubmit}
            autoFocus
          />
          <button
            type="button"
            className="ss-custom-cancel"
            onClick={() => {
              setIsCustom(false)
              setCustomValue('')
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        // DROPDOWN fourchettes
        <div className="ss-dropdown-wrapper">
          <div className="ss-dropdown-trigger">
            {value ? (
              <div className="ss-selected-value">
                <span className="ss-currency">{currencySymbol}</span>
                <span>{value}</span>
              </div>
            ) : (
              <span className="ss-placeholder">Sélectionner une fourchette...</span>
            )}
            <ChevronDown size={16} className={`ss-chevron ${open ? 'ss-chevron--open' : ''}`} />
          </div>

          {open && (
            <div className="ss-dropdown">
              {salaryRanges && salaryRanges.length > 0 ? (
                <>
                  {salaryRanges.map((range, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`ss-dropdown-item ${value === range ? 'ss-dropdown-item--active' : ''}`}
                      onMouseDown={() => handleSelectRange(range)}
                    >
                      <span className="ss-dropdown-checkbox" />
                      <span>{range}</span>
                    </button>
                  ))}
                  <div className="ss-dropdown-divider" />
                  <button
                    type="button"
                    className="ss-dropdown-item ss-dropdown-item--custom"
                    onMouseDown={() => {
                      setIsCustom(true)
                      setOpen(false)
                    }}
                  >
                    <span className="ss-dropdown-checkbox">+</span>
                    <span>Montant personnalisé...</span>
                  </button>
                </>
              ) : (
                <div className="ss-dropdown-empty">Chargement des fourchettes...</div>
              )}
            </div>
          )}

          {open && (
            <div
              className="ss-dropdown-overlay"
              onMouseDown={() => setOpen(false)}
            />
          )}
        </div>
      )}

      {value && (
        <div className="ss-help-text">
          ✓ {value} {currencySymbol} par {salaryPeriod === 'mensuel' ? 'mois' : 'an'}
        </div>
      )}
    </div>
  )
}
