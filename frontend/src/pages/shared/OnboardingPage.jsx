import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/AuthStore'
import { generateQuestions, completeOnboarding } from '../../api/OnboardingApi'
import { ChevronRight, ChevronLeft, FileText, CheckCircle2, X } from 'lucide-react'
import MapPicker from '../../components/MapPicker'
import StellaLoader from '../../components/StellaLoader'
import './OnboardingPage.css'

/* ─── Data ──────────────────────────────────────────────────── */
const INDUSTRIES = [
  'Informatique & Développement logiciel', 'Intelligence Artificielle & Machine Learning',
  'Cybersécurité', 'Cloud Computing', 'E-commerce & Marketplaces',
  'Fintech & Paiements digitaux', 'Télécommunications', 'Banque & Services financiers',
  'Assurance', 'Comptabilité & Audit', 'Gestion d\'actifs & Investissements',
  'Santé & Médecine', 'Pharmacie & Biotechnologies', 'Matériel médical',
  'Éducation & Formation', 'E-learning & EdTech', 'Recherche & Développement',
  'Commerce de détail & Distribution', 'Vente & Marketing', 'Publicité & Communication',
  'Industrie manufacturière', 'Automobile & Mobilité', 'Aéronautique & Spatial',
  'Chimie & Matériaux', 'Textile & Mode', 'Construction & BTP', 'Immobilier',
  'Architecture & Design', 'Ingénierie civile', 'Conseil & Management',
  'Ressources Humaines', 'Juridique & Droit', 'Agriculture & Agroalimentaire',
  'Pêche & Aquaculture', 'Énergie & Utilities', 'Énergies renouvelables',
  'Pétrole & Gaz', 'Mines & Ressources naturelles', 'Transport & Logistique',
  'Maritime & Ports', 'Aviation', 'Tourisme & Hôtellerie', 'Restauration',
  'Événementiel', 'Médias & Presse', 'Production audiovisuelle', 'Arts & Culture',
  'Sport & Loisirs', 'ONG & Associations', 'Administration publique',
  'Sécurité & Défense', 'Autre',
]

const COUNTRIES = [
  { name: 'Sénégal', code: 'sn' }, { name: 'Côte d\'Ivoire', code: 'ci' },
  { name: 'Mali', code: 'ml' }, { name: 'Guinée', code: 'gn' },
  { name: 'Cameroun', code: 'cm' }, { name: 'Burkina Faso', code: 'bf' },
  { name: 'Niger', code: 'ne' }, { name: 'Bénin', code: 'bj' },
  { name: 'Togo', code: 'tg' }, { name: 'Congo (RDC)', code: 'cd' },
  { name: 'Congo (Brazzaville)', code: 'cg' }, { name: 'Gabon', code: 'ga' },
  { name: 'Madagascar', code: 'mg' }, { name: 'Maroc', code: 'ma' },
  { name: 'Algérie', code: 'dz' }, { name: 'Tunisie', code: 'tn' },
  { name: 'Mauritanie', code: 'mr' }, { name: 'Nigeria', code: 'ng' },
  { name: 'Ghana', code: 'gh' }, { name: 'Kenya', code: 'ke' },
  { name: 'Tanzanie', code: 'tz' }, { name: 'Afrique du Sud', code: 'za' },
  { name: 'Éthiopie', code: 'et' }, { name: 'Rwanda', code: 'rw' },
  { name: 'France', code: 'fr' }, { name: 'Belgique', code: 'be' },
  { name: 'Suisse', code: 'ch' }, { name: 'Luxembourg', code: 'lu' },
  { name: 'Espagne', code: 'es' }, { name: 'Portugal', code: 'pt' },
  { name: 'Italie', code: 'it' }, { name: 'Allemagne', code: 'de' },
  { name: 'Royaume-Uni', code: 'gb' }, { name: 'Pays-Bas', code: 'nl' },
  { name: 'Canada', code: 'ca' }, { name: 'États-Unis', code: 'us' },
  { name: 'Brésil', code: 'br' }, { name: 'Émirats Arabes Unis', code: 'ae' },
  { name: 'Qatar', code: 'qa' }, { name: 'Inde', code: 'in' },
  { name: 'Chine', code: 'cn' }, { name: 'Japon', code: 'jp' },
  { name: 'Australie', code: 'au' }, { name: 'Autre', code: '' },
]

/* ─── Dynamic questions ─────────────────────────────────────── */
const OPTIONAL_IDS = ['companyLinkedIn', 'companyDescription', 'companyLocation', 'companyAddress', 'candidateCity']

function getCountryCode(countryName) {
  return COUNTRIES.find(c => c.name === countryName)?.code || ''
}

function getCandidateInitialQuestions(answers) {
  const countryName = answers.candidateCountry || ''
  const countryCode = getCountryCode(countryName)
  const domain = answers.domain || ''

  return [
    {
      id: 'domain', text: 'Votre domaine professionnel', type: 'searchable_choice',
      options: INDUSTRIES, placeholder: 'Ex : Informatique, Finance, Santé...',
    },
    {
      id: 'desiredRole', text: 'Poste recherché', type: 'text',
      placeholder: domain ? `Ex : Développeur ${domain.split('&')[0].trim()}, Analyste...` : 'Ex : Développeur Full-Stack, Chef de projet...',
    },
    {
      id: 'experienceLevel', text: 'Niveau d\'expérience', type: 'single_choice',
      options: ['Junior (0-2 ans)', 'Intermédiaire (2-5 ans)', 'Senior (5-10 ans)', 'Expert (10+ ans)'],
    },
    {
      id: 'contractType', text: 'Type(s) de contrat souhaité(s)', type: 'multi_choice',
      options: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'Intérim', 'Autre'],
    },
    {
      id: 'candidateCountry', text: 'Pays de résidence / où vous souhaitez travailler', type: 'country',
    },
    ...(countryName ? [{
      id: 'candidateCity',
      text: `Ville (${countryName})`,
      type: 'city_search',
      countryCode,
      placeholder: 'Tapez pour rechercher...',
    }] : []),
  ]
}

function getEmployerInitialQuestions(answers) {
  const countryName = answers.companyCountry || ''
  const countryCode = getCountryCode(countryName)
  const industry = answers.industry || ''

  return [
    {
      id: 'companyName', text: 'Nom de votre entreprise', type: 'text',
      placeholder: 'Ex :  Nabil SAS, TechSolutions Africa...',
    },
    {
      id: 'industry', text: 'Secteur d\'activité', type: 'searchable_choice',
      options: INDUSTRIES, placeholder: 'Tapez pour rechercher un secteur...',
    },
    {
      id: 'companyCountry', text: 'Pays où est basée votre entreprise', type: 'country',
    },
    ...(countryName ? [{
      id: 'companyCity',
      text: `Ville (${countryName})`,
      type: 'city_search',
      countryCode,
      placeholder: 'Tapez pour rechercher...',
    }] : []),
    {
      id: 'companySize', text: 'Taille de votre entreprise', type: 'single_choice',
      options: ['1-10 employés (Start-up)', '11-50 employés (PME)', '51-200 employés (ETI)', '201-500 employés', '500+ (Grande entreprise)', 'Autre'],
    },
    {
      id: 'hiringRole',
      text: industry ? `Profil recherché dans votre secteur "${industry.split('&')[0].trim()}"` : 'Profil recherché en priorité',
      type: 'text',
      placeholder: 'Ex : Développeur React, Responsable RH, Commercial B2B...',
    },
    {
      id: 'contractType', text: 'Type(s) de contrat proposé(s)', type: 'multi_choice',
      options: ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance', 'Intérim', 'Autre'],
    },
    {
      id: 'companyDescription', text: 'Décrivez brièvement votre entreprise', type: 'text',
      placeholder: 'Ex : Nous développons des solutions SaaS pour les PME africaines...',
    },
    {
      id: 'companyRegistrationNumber',
      text: countryName === 'France' ? 'Numéro SIRET' : 'Numéro d\'immatriculation officiel',
      type: 'text',
      placeholder: countryName === 'France' ? 'Ex : 123 456 789 00012' : 'Numéro d\'enregistrement légal de l\'entreprise',
    },
    {
      id: 'companyWebsite', text: 'Site web de l\'entreprise', type: 'text',
      placeholder: 'https://monentreprise.com',
    },
    {
      id: 'companyLinkedIn', text: 'Page LinkedIn (optionnel)', type: 'text',
      placeholder: 'https://linkedin.com/company/monentreprise',
    },
    {
      id: 'companyAddress', text: 'Adresse complète du siège social', type: 'text',
      placeholder: 'Ex : 12 rue de la Paix, 75001 Paris',
    },
    {
      id: 'companyLocation', text: 'Situez votre entreprise sur la carte', type: 'map',
    },
  ]
}

/* ─── Sub-components ────────────────────────────────────────── */

function ProgressBar({ current, total }) {
  return (
    <div className="ob-progress">
      <div className="ob-progress-track">
        <div className="ob-progress-fill" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <span className="ob-progress-label">Étape {current} / {total}</span>
    </div>
  )
}

function SearchableChoiceCard({ question, value, onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const options = question.options || []

  const filtered = search.length > 0
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (opt) => {
    onChange(question.id, opt)
    setSearch('')
    setOpen(false)
  }

  const handleClear = () => onChange(question.id, '')

  return (
    <div className="ob-question ob-dropdown-wrapper">
      <p className="ob-question-text">{question.text}</p>
      {value ? (
        <div className="ob-selected-chip">
          <span>{value}</span>
          <button type="button" onClick={handleClear} aria-label="Supprimer"><X size={14} /></button>
        </div>
      ) : (
        <div className="ob-dropdown-container">
          <input
            className="ob-input"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder={question.placeholder || 'Tapez pour rechercher...'}
          />
          {open && (
            <div className="ob-dropdown">
              {filtered.slice(0, 12).map((opt, i) => (
                <div key={i} className="ob-dropdown-item" onMouseDown={() => handleSelect(opt)}>
                  {opt}
                </div>
              ))}
              {search.length > 1 && !options.find(o => o.toLowerCase() === search.toLowerCase()) && (
                <div className="ob-dropdown-item ob-dropdown-item--custom" onMouseDown={() => handleSelect(search)}>
                  Utiliser « {search} »
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CountryCard({ question, value, onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (country) => {
    if (country.code === '') {
      // "Autre" — allow free text
      onChange(question.id, search || 'Autre')
    } else {
      onChange(question.id, country.name)
    }
    setSearch('')
    setOpen(false)
  }

  return (
    <div className="ob-question ob-dropdown-wrapper">
      <p className="ob-question-text">{question.text}</p>
      {value ? (
        <div className="ob-selected-chip">
          <span>{value}</span>
          <button type="button" onClick={() => onChange(question.id, '')} aria-label="Supprimer"><X size={14} /></button>
        </div>
      ) : (
        <div className="ob-dropdown-container">
          <input
            className="ob-input"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Choisir un pays..."
          />
          {open && (
            <div className="ob-dropdown">
              {filtered.slice(0, 10).map((c, i) => (
                <div key={i} className="ob-dropdown-item" onMouseDown={() => handleSelect(c)}>
                  {c.name}
                </div>
              ))}
              {search.length > 1 && !COUNTRIES.find(c => c.name.toLowerCase() === search.toLowerCase()) && (
                <div className="ob-dropdown-item ob-dropdown-item--custom" onMouseDown={() => handleSelect({ name: search, code: '' })}>
                  Utiliser « {search} »
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CitySearchCard({ question, value, onChange }) {
  const [input, setInput] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  // Reset local input when parent clears the value (e.g. country changed)
  useEffect(() => {
    if (!value) { setInput(''); setSuggestions([]) }
  }, [value])

  const fetchCities = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); return }
    const cc = question.countryCode || ''
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=${cc}&format=json&limit=8&accept-language=fr`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const cities = data
        .map(d => d.display_name.split(',')[0].trim())
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 7)
      setSuggestions(cities)
      setOpen(true)
    } catch {
      setSuggestions([])
    }
  }, [question.countryCode])

  const handleInput = (e) => {
    const val = e.target.value
    setInput(val)
    onChange(question.id, val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCities(val), 400)
  }

  const handleSelect = (city) => {
    setInput(city)
    onChange(question.id, city)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="ob-question ob-dropdown-wrapper">
      <p className="ob-question-text">{question.text}</p>
      <div className="ob-dropdown-container">
        <input
          className="ob-input"
          value={input}
          onChange={handleInput}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={question.placeholder || 'Tapez le nom d\'une ville...'}
        />
        {open && suggestions.length > 0 && (
          <div className="ob-dropdown">
            {suggestions.map((city, i) => (
              <div key={i} className="ob-dropdown-item" onMouseDown={() => handleSelect(city)}>
                {city}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SingleChoiceCard({ question, value, onChange }) {
  const options = question.options || []
  const hasOtherOpt = options.includes('Autre')
  const standardOptions = hasOtherOpt ? options.filter(o => o !== 'Autre') : options
  const isCustom = value && !options.includes(value)
  const isOtherActive = value === 'Autre' || isCustom
  const otherText = isCustom ? value : ''

  return (
    <div className="ob-question">
      <p className="ob-question-text">{question.text}</p>
      <div className="ob-choices">
        {standardOptions.map(opt => (
          <button
            key={opt} type="button"
            className={`ob-choice ${value === opt ? 'ob-choice--active' : ''}`}
            onClick={() => onChange(question.id, opt)}
          >{opt}</button>
        ))}
        {hasOtherOpt && (
          <button
            type="button"
            className={`ob-choice ${isOtherActive ? 'ob-choice--active' : ''}`}
            onClick={() => onChange(question.id, isOtherActive ? '' : 'Autre')}
          >Autre</button>
        )}
      </div>
      {isOtherActive && (
        <input
          className="ob-input ob-other-input"
          placeholder="Précisez..."
          value={otherText}
          onChange={e => onChange(question.id, e.target.value || 'Autre')}
          autoFocus
        />
      )}
    </div>
  )
}

function MultiChoiceCard({ question, value, onChange }) {
  const options = question.options || []
  const hasOtherOpt = options.includes('Autre')
  const standardOptions = hasOtherOpt ? options.filter(o => o !== 'Autre') : options
  const selected = value ? value.split(',').filter(Boolean) : []
  const standardSelected = selected.filter(v => standardOptions.includes(v))
  const customValues = selected.filter(v => !options.includes(v))
  const isOtherActive = selected.includes('Autre') || customValues.length > 0
  const customText = customValues[0] || ''

  const buildValue = (std, otherActive, text) => {
    if (otherActive && text) return [...std, text].join(',')
    if (otherActive) return [...std, 'Autre'].join(',')
    return std.join(',')
  }

  const handleChip = (opt) => {
    const newStd = standardSelected.includes(opt)
      ? standardSelected.filter(v => v !== opt)
      : [...standardSelected, opt]
    onChange(question.id, buildValue(newStd, isOtherActive, customText))
  }

  const handleOtherClick = () => {
    const newActive = !isOtherActive
    onChange(question.id, buildValue(standardSelected, newActive, ''))
  }

  const handleOtherInput = (text) => {
    onChange(question.id, buildValue(standardSelected, true, text))
  }

  return (
    <div className="ob-question">
      <p className="ob-question-text">{question.text}</p>
      <p className="ob-question-hint">Plusieurs choix possibles</p>
      <div className="ob-choices ob-choices--multi">
        {standardOptions.map(opt => (
          <button
            key={opt} type="button"
            className={`ob-choice ${standardSelected.includes(opt) ? 'ob-choice--active' : ''}`}
            onClick={() => handleChip(opt)}
          >{opt}</button>
        ))}
        {hasOtherOpt && (
          <button
            type="button"
            className={`ob-choice ${isOtherActive ? 'ob-choice--active' : ''}`}
            onClick={handleOtherClick}
          >Autre</button>
        )}
      </div>
      {isOtherActive && (
        <input
          className="ob-input ob-other-input"
          placeholder="Précisez..."
          value={customText}
          onChange={e => handleOtherInput(e.target.value)}
          autoFocus
        />
      )}
    </div>
  )
}

function QuestionCard({ question, value, onChange, onSideEffect }) {
  if (question.type === 'searchable_choice') {
    return <SearchableChoiceCard question={question} value={value} onChange={onChange} />
  }
  if (question.type === 'country') {
    return <CountryCard question={question} value={value} onChange={onChange} />
  }
  if (question.type === 'city_search') {
    return <CitySearchCard question={question} value={value} onChange={onChange} />
  }
  if (question.type === 'single_choice') {
    return <SingleChoiceCard question={question} value={value} onChange={onChange} />
  }
  if (question.type === 'multi_choice') {
    return <MultiChoiceCard question={question} value={value} onChange={onChange} />
  }
  if (question.type === 'text' || question.type === 'number') {
    return (
      <div className="ob-question">
        <p className="ob-question-text">{question.text}</p>
        <input
          className="ob-input"
          type={question.type === 'number' ? 'number' : 'text'}
          placeholder={question.placeholder || ''}
          value={value || ''}
          onChange={e => onChange(question.id, e.target.value)}
        />
      </div>
    )
  }
  if (question.type === 'map') {
    return (
      <div className="ob-question">
        <p className="ob-question-text">{question.text}</p>
        <MapPicker
          value={value || ''}
          onChange={val => onChange(question.id, val)}
          onAddressFound={address => onSideEffect && onSideEffect('companyAddress', address)}
        />
      </div>
    )
  }
  return null
}

/* ─── Constants ──────────────────────────────────────────────── */
const ROLE_ROUTES = { CANDIDATE: '/dashboard/candidate', EMPLOYER: '/dashboard/employer' }

/* ─── Main component ────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setAuth } = useAuthStore()
  const role = user?.role || 'CANDIDATE'

  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate(ROLE_ROUTES[role] ?? '/dashboard/candidate', { replace: true })
    }
  }, [user, role, navigate])

  const totalSteps = role === 'CANDIDATE' ? 4 : 3
  const [step, setStep] = useState('initial')
  const [initialAnswers, setInitialAnswers] = useState({})
  const [aiQuestions, setAiQuestions] = useState([])
  const [aiAnswers, setAiAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Recompute initial questions dynamically based on current answers
  const initialQuestions = role === 'EMPLOYER'
    ? getEmployerInitialQuestions(initialAnswers)
    : getCandidateInitialQuestions(initialAnswers)

  const setAnswer = (bank, id, val) => {
    if (bank === 'initial') {
      setInitialAnswers(prev => {
        const next = { ...prev, [id]: val }
        // If country changes, clear the city (it's now invalid for the new country)
        if ((id === 'companyCountry' && prev.companyCountry !== val)) next.companyCity = ''
        if ((id === 'candidateCountry' && prev.candidateCountry !== val)) next.candidateCity = ''
        return next
      })
    } else {
      setAiAnswers(prev => ({ ...prev, [id]: val }))
    }
  }

  const isInitialComplete = () =>
    initialQuestions
      .filter(q => !OPTIONAL_IDS.includes(q.id))
      .every(q => {
        const val = initialAnswers[q.id]
        return val && String(val).trim() !== ''
      })

  const isAiComplete = () =>
    aiQuestions.every(q => {
      const val = aiAnswers[q.id]
      return val && String(val).trim() !== ''
    })

  const handleInitialNext = async () => {
    if (!isInitialComplete()) {
      setError('Merci de répondre à toutes les questions obligatoires.')
      return
    }
    setError('')
    setStep('loading')
    try {
      const data = await generateQuestions(role, initialAnswers)
      setAiQuestions(data.questions || [])
      setStep('ai')
    } catch {
      setError("Impossible de générer les questions. Veuillez réessayer.")
      setStep('initial')
    }
  }

  const handleAiNext = () => {
    if (!isAiComplete()) {
      setError('Merci de répondre à toutes les questions.')
      return
    }
    setError('')
    if (role === 'CANDIDATE') setStep('cv')
    else handleComplete(false)
  }

  const handleComplete = async (cv) => {
    setSubmitting(true)
    setError('')
    try {
      const data = await completeOnboarding(role, initialAnswers, aiAnswers, cv)
      setAuth(data)
      setStep('done')
      setTimeout(() => navigate(ROLE_ROUTES[role] ?? '/dashboard/candidate'), 1800)
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Loading ── */
  if (step === 'loading') return (
    <StellaLoader
      message="STELLA analyse vos réponses…"
      sub="Génération de questions personnalisées en cours"
    />
  )

  /* ── Done ── */
  if (step === 'done') {
    return (
      <div className="ob-shell">
        <div className="ob-done-card">
          <CheckCircle2 size={56} className="ob-done-icon" />
          <h2>Profil complété !</h2>
          <p>Redirection vers votre tableau de bord…</p>
        </div>
      </div>
    )
  }

  /* ── CV offer ── */
  if (step === 'cv') {
    return (
      <div className="ob-shell">
        <div className="ob-card">
          <div className="ob-card-header">
            <div className="ob-logo"><span className="ob-logo-icon">S</span><span className="ob-logo-text">SkillSet</span></div>
            <ProgressBar current={3} total={totalSteps} />
          </div>
          <div className="ob-cv-offer">
            <div className="ob-cv-icon"><FileText size={48} /></div>
            <h2>Votre CV SkillSet</h2>
            <p>Souhaitez-vous que nous générions automatiquement un CV professionnel à partir de vos réponses ?</p>
            {error && <div className="ob-error">{error}</div>}
            <div className="ob-cv-actions">
              <button className="ob-btn-primary" onClick={() => handleComplete(true)} disabled={submitting}>
                Oui, générer mon CV
              </button>
              <button className="ob-btn-ghost" onClick={() => handleComplete(false)} disabled={submitting}>
                Non merci
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Questions (initial or ai) ── */
  const questions = step === 'initial' ? initialQuestions : aiQuestions
  const answers = step === 'initial' ? initialAnswers : aiAnswers
  const currentStep = step === 'initial' ? 1 : 2

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-card-header">
          <div className="ob-logo">
            <span className="ob-logo-icon">S</span>
            <span className="ob-logo-text">SkillSet</span>
          </div>
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>

        <div className="ob-card-body">
          {step === 'initial' && (
            <>
              <h2 className="ob-section-title">
                {role === 'CANDIDATE' ? 'Parlez-nous de vous' : 'Votre entreprise'}
              </h2>
              <p className="ob-section-sub">Quelques questions pour personnaliser votre expérience</p>
            </>
          )}

          {error && <div className="ob-error">{error}</div>}

          <div className="ob-questions">
            {questions.map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                value={answers[q.id] || ''}
                onChange={(id, val) => setAnswer(step === 'initial' ? 'initial' : 'ai', id, val)}
                onSideEffect={(id, val) => setAnswer('initial', id, val)}
              />
            ))}
          </div>
        </div>

        <div className="ob-card-footer">
          {step === 'ai' && (
            <button className="ob-btn-ghost" onClick={() => setStep('initial')}>
              <ChevronLeft size={16} /> Retour
            </button>
          )}
          <button className="ob-btn-primary" onClick={step === 'initial' ? handleInitialNext : handleAiNext}>
            {step === 'initial' ? 'Continuer' : (role === 'CANDIDATE' ? 'Continuer' : 'Terminer')}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
