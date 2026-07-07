import { useState } from 'react'
import { COUNTRIES, getContextFromAnswers } from '../../data/contextualData'
import { X, ChevronDown } from 'lucide-react'
import './CountrySelector.css'

const COUNTRY_FLAGS = {
  CM: '🇨🇲', FR: '🇫🇷', SN: '🇸🇳', CI: '🇨🇮', MA: '🇲🇦', TN: '🇹🇳',
  BE: '🇧🇪', CH: '🇨🇭', GA: '🇬🇦', CD: '🇨🇩', CG: '🇨🇬', CA: '🇨🇦'
}

/**
 * Sélecteur de pays contextualisé.
 * Gère le reset en cascade : quand on change de pays,
 * on réinitialise city, salary, contractType, workMode, phone.
 */
export default function CountrySelector({ value, onChange, previousAnswers = [] }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 12)

  const handleSelect = (country) => {
    // 1. Changer le pays
    onChange('country', country.name)

    // 2. Reset dépendances en cascade
    onChange('city', '')
    onChange('salary', '')
    onChange('contractType', '')
    onChange('workMode', '')
    onChange('phone', '')

    // 3. Fermer dropdown
    setSearch('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange('country', '')
    setSearch('')
    setOpen(false)
  }

  const selectedCountry = COUNTRIES.find(c => c.name === value)
  const flag = selectedCountry ? COUNTRY_FLAGS[selectedCountry.code] : '🌍'

  return (
    <div className="cs-container">
      <div className="cs-label">Pays de résidence / travail</div>

      {value ? (
        // CHIP mode — pays sélectionné
        <div className="cs-chip">
          <span className="cs-chip-flag">{flag}</span>
          <span className="cs-chip-text">{value}</span>
          <button
            type="button"
            className="cs-chip-clear"
            onClick={handleClear}
            aria-label="Changer de pays"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        // DROPDOWN mode — recherche
        <div className="cs-dropdown-wrapper">
          <div className="cs-search-input-wrapper">
            <input
              type="text"
              className="cs-search-input"
              placeholder="Rechercher un pays..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            <ChevronDown size={16} className={`cs-chevron ${open ? 'cs-chevron--open' : ''}`} />
          </div>

          {open && (
            <div className="cs-dropdown">
              {filtered.length > 0 ? (
                filtered.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    className="cs-dropdown-item"
                    onMouseDown={() => handleSelect(country)}
                  >
                    <span className="cs-dropdown-flag">{COUNTRY_FLAGS[country.code]}</span>
                    <span className="cs-dropdown-text">{country.name}</span>
                  </button>
                ))
              ) : (
                <div className="cs-dropdown-empty">Aucun pays trouvé</div>
              )}
            </div>
          )}
        </div>
      )}

      {value && (
        <div className="cs-help-text">
          ✓ Pays sélectionné — Les villes, salaires et conditions seront adaptés à {value}
        </div>
      )}
    </div>
  )
}
