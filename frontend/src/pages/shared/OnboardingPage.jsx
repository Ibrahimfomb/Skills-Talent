import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/AuthStore'
import { useOnboardingAiStore } from '../../store/onboardingAiStore'
import { generateQuestions, completeOnboarding } from '../../api/OnboardingApi'
import { ChevronRight, ChevronLeft, FileText, CheckCircle2, X } from 'lucide-react'
import MapPicker from '../../components/MapPicker'
import StellaLoader from '../../components/StellaLoader'
import AiQuestionCard from '../../features/onboarding/AiQuestionCard'
import PhaseIndicator from '../../features/onboarding/PhaseIndicator'
import CvGenerationScreen from '../../features/onboarding/CvGenerationScreen'
import { getJobsForDomain } from '../../data/domainJobs'
import './OnboardingPage.css'

/* ─── Static data ───────────────────────────────────────────────── */
const INDUSTRIES = [
  'Informatique & Développement logiciel', 'Intelligence Artificielle & Machine Learning',
  'Cybersécurité', 'Cloud Computing', 'E-commerce & Marketplaces',
  'Fintech & Paiements digitaux', 'Télécommunications', 'Banque & Services financiers',
  'Assurance', 'Comptabilité & Audit', "Gestion d'actifs & Investissements",
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
  { name: 'Cameroun', code: 'cm' }, { name: 'Sénégal', code: 'sn' },
  { name: "Côte d'Ivoire", code: 'ci' }, { name: 'Mali', code: 'ml' },
  { name: 'Guinée', code: 'gn' }, { name: 'Burkina Faso', code: 'bf' },
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

function getCountryCode(name) {
  return COUNTRIES.find(c => c.name === name)?.code || ''
}

const OPTIONAL_IDS = [
  'companyLinkedIn', 'companyDescription', 'companyLocation', 'companyAddress',
  'candidateLinkedIn', 'workAuthorization', 'hasReferences',
]

/* ─── Question builders ─────────────────────────────────────────── */
function getCandidateInitialQuestions(answers) {
  const domain = answers.domain || ''
  const domainJobs = getJobsForDomain(domain)

  return [
    {
      id: 'domain',
      text: "Votre domaine professionnel",
      type: 'searchable_choice',
      options: INDUSTRIES,
      placeholder: 'Ex : Informatique, Finance, Santé…',
    },
    {
      id: 'desiredRole',
      text: domain
        ? `Poste recherché dans « ${domain.split('&')[0].trim()} »`
        : 'Poste recherché',
      type: domainJobs.length > 0 ? 'searchable_choice' : 'text',
      options: domainJobs,
      placeholder: 'Ex : Développeur Full Stack, Comptable…',
    },
    {
      id: 'experienceLevel',
      text: "Niveau d'expérience",
      type: 'single_choice',
      options: ['Junior (0-2 ans)', 'Intermédiaire (2-5 ans)', 'Senior (5-10 ans)', 'Expert (10+ ans)'],
    },
    {
      id: 'contractType',
      text: 'Type(s) de contrat souhaité(s)',
      type: 'multi_choice',
      options: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'Intérim', 'Autre'],
    },
    // Country + City combined in one card
    {
      id: 'candidateLocation',
      type: 'country_city',
      text: 'Pays et ville de résidence / travail',
      countryId: 'candidateCountry',
      cityId: 'candidateCity',
    },
    // ── Sécurité & Traçabilité ──
    {
      id: 'candidateLinkedIn',
      text: 'Profil LinkedIn (optionnel)',
      type: 'text',
      placeholder: 'https://linkedin.com/in/votre-profil',
    },
    {
      id: 'workAuthorization',
      text: `Êtes-vous autorisé(e) à travailler légalement${answers.candidateCountry ? ' en ' + answers.candidateCountry : ' dans ce pays'} ?`,
      type: 'single_choice',
      options: [
        'Oui, citoyen(ne) ou résident(e) permanent(e)',
        'Oui, visa de travail valide',
        'En cours de régularisation',
        "Besoin d'un visa ou permis de travail",
        'Préfère ne pas répondre',
      ],
    },
    {
      id: 'hasReferences',
      text: 'Avez-vous des références professionnelles disponibles ?',
      type: 'single_choice',
      options: [
        'Oui, 2 références ou plus (joignables)',
        'Oui, 1 référence professionnelle',
        'Références en cours de constitution',
        'Non disponibles pour le moment',
      ],
    },
  ]
}

function getEmployerInitialQuestions(answers) {
  const industry = answers.industry || ''
  const countryName = answers.companyCountry || ''

  return [
    {
      id: 'companyName',
      text: "Nom de votre entreprise",
      type: 'text',
      placeholder: 'Ex : Nabil SAS, TechSolutions Africa…',
    },
    {
      id: 'industry',
      text: "Secteur d'activité",
      type: 'searchable_choice',
      options: INDUSTRIES,
      placeholder: 'Tapez pour rechercher un secteur…',
    },
    {
      id: 'companyLocation',
      type: 'country_city',
      text: "Pays et ville du siège social",
      countryId: 'companyCountry',
      cityId: 'companyCity',
    },
    {
      id: 'companySize',
      text: "Taille de votre entreprise",
      type: 'single_choice',
      options: ['1-10 employés (Start-up)', '11-50 employés (PME)', '51-200 employés (ETI)', '201-500 employés', '500+ (Grande entreprise)', 'Autre'],
    },
    {
      id: 'hiringRole',
      text: industry
        ? `Profil recherché dans « ${industry.split('&')[0].trim()} »`
        : 'Profil recherché en priorité',
      type: 'text',
      placeholder: 'Ex : Développeur React, Responsable RH, Commercial B2B…',
    },
    {
      id: 'contractType',
      text: 'Type(s) de contrat proposé(s)',
      type: 'multi_choice',
      options: ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance', 'Intérim', 'Autre'],
    },
    {
      id: 'companyDescription',
      text: "Décrivez brièvement votre entreprise",
      type: 'text',
      placeholder: 'Ex : Nous développons des solutions SaaS pour les PME africaines…',
    },
    {
      id: 'companyRegistrationNumber',
      text: countryName === 'France' ? 'Numéro SIRET' : "Numéro d'immatriculation officiel",
      type: 'text',
      placeholder: countryName === 'France' ? 'Ex : 123 456 789 00012' : "Numéro d'enregistrement légal",
    },
    {
      id: 'companyWebsite',
      text: "Site web de l'entreprise",
      type: 'text',
      placeholder: 'https://monentreprise.com',
    },
    {
      id: 'companyLinkedIn',
      text: 'Page LinkedIn (optionnel)',
      type: 'text',
      placeholder: 'https://linkedin.com/company/monentreprise',
    },
    {
      id: 'companyAddress',
      text: 'Adresse complète du siège social',
      type: 'text',
      placeholder: 'Ex : 12 rue de la Paix, 75001 Paris',
    },
    {
      id: 'companyMap',
      text: 'Situez votre entreprise sur la carte',
      type: 'map',
    },
  ]
}

/* ─── Progress bar ──────────────────────────────────────────────── */
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

/* ─── Searchable choice ─────────────────────────────────────────── */
function SearchableChoiceCard({ question, value, onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const options = question.options || []

  const filtered = search.length > 0
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (opt) => { onChange(question.id, opt); setSearch(''); setOpen(false) }
  const handleClear  = () => onChange(question.id, '')

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
            placeholder={question.placeholder || 'Tapez pour rechercher…'}
          />
          {open && (
            <div className="ob-dropdown">
              {filtered.slice(0, 14).map((opt, i) => (
                <div key={i} className="ob-dropdown-item" onMouseDown={() => handleSelect(opt)}>{opt}</div>
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

/* ─── Country + City combined (IMPROVED for dynamic adaptation) ───────────────────────────────────── */
function CountryCityCard({ question, answers, onChange }) {
  const countryVal = answers[question.countryId] || ''
  const cityVal    = answers[question.cityId]    || ''
  const countryCode = getCountryCode(countryVal)

  // Country search state
  const [cSearch, setCSearch] = useState('')
  const [cOpen, setCOpen]     = useState(false)
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(cSearch.toLowerCase())
  )

  // City search state
  const [cityInput, setCityInput]   = useState(cityVal || '')
  const [citySugs, setCitySugs]     = useState([])
  const [cityOpen, setCityOpen]     = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!cityVal) { setCityInput(''); setCitySugs([]) }
      else setCityInput(cityVal)
    }, 0)
    return () => clearTimeout(t)
  }, [cityVal, countryCode])

  const fetchCities = async (q) => {
    if (q.length < 2) { setCitySugs([]); return }
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=${countryCode}&format=json&limit=8&accept-language=fr`
    try {
      const data = await (await fetch(url)).json()
      const cities = data.map(d => d.display_name.split(',')[0].trim())
        .filter((v, i, a) => a.indexOf(v) === i).slice(0, 7)
      setCitySugs(cities)
      setCityOpen(true)
    } catch { setCitySugs([]) }
  }

  const handleCountrySelect = (c) => {
    const countryName = c.code === '' ? (cSearch || 'Autre') : c.name
    onChange(question.countryId, countryName)
    onChange(question.cityId, '') // reset city when country changes
    setCSearch('');
    setCOpen(false)
    setCityInput('') // Clear city input
    setCitySugs([])
  }

  const handleCityInput = (e) => {
    const val = e.target.value
    setCityInput(val)
    onChange(question.cityId, val)
    clearTimeout(debounceRef.current)
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => fetchCities(val), 380)
    } else {
      setCitySugs([])
    }
  }

  const handleCitySelect = (city) => {
    setCityInput(city)
    onChange(question.cityId, city)
    setCitySugs([]);
    setCityOpen(false)
  }

  return (
    <div className="ob-question">
      <p className="ob-question-text">{question.text}</p>

      {/* Country row */}
      <div className="ob-location-row">
        <span className="ob-location-label">Pays</span>
        {countryVal ? (
          <div className="ob-selected-chip ob-selected-chip--inline">
            <span>{countryVal}</span>
            <button type="button" onClick={() => { onChange(question.countryId, ''); onChange(question.cityId, ''); setCityInput(''); setCitySugs([]); }} aria-label="Changer de pays"><X size={13} /></button>
          </div>
        ) : (
          <div className="ob-dropdown-container ob-dropdown-container--flex">
            <input
              className="ob-input"
              value={cSearch}
              onChange={e => { setCSearch(e.target.value); setCOpen(true) }}
              onFocus={() => setCOpen(true)}
              onBlur={() => setTimeout(() => setCOpen(false), 200)}
              placeholder="Choisir un pays…"
            />
            {cOpen && (
              <div className="ob-dropdown">
                {filteredCountries.slice(0, 10).map((c, i) => (
                  <div key={i} className="ob-dropdown-item" onMouseDown={() => handleCountrySelect(c)}>{c.name}</div>
                ))}
                {cSearch.length > 1 && !COUNTRIES.find(c => c.name.toLowerCase() === cSearch.toLowerCase()) && (
                  <div className="ob-dropdown-item ob-dropdown-item--custom" onMouseDown={() => handleCountrySelect({ name: cSearch, code: '' })}>
                    Utiliser « {cSearch} »
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* City row — only shown when country is selected */}
      {countryVal && (
        <div className="ob-location-row ob-location-row--city">
          <span className="ob-location-label">Ville</span>
          <div className="ob-dropdown-container ob-dropdown-container--flex">
            <input
              className="ob-input"
              value={cityInput}
              onChange={handleCityInput}
              onBlur={() => setTimeout(() => setCityOpen(false), 200)}
              onFocus={() => citySugs.length > 0 && setCityOpen(true)}
              placeholder={`Saisir une ville…`}
            />
            {cityOpen && citySugs.length > 0 && (
              <div className="ob-dropdown">
                {citySugs.map((city, i) => (
                  <div key={i} className="ob-dropdown-item" onMouseDown={() => handleCitySelect(city)}>{city}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Single choice ─────────────────────────────────────────────── */
function SingleChoiceCard({ question, value, onChange }) {
  const options = question.options || []
  const hasOther = options.includes('Autre')
  const stdOpts  = hasOther ? options.filter(o => o !== 'Autre') : options
  const isCustom = value && !options.includes(value)
  const isOtherActive = value === 'Autre' || isCustom
  const otherText = isCustom ? value : ''

  return (
    <div className="ob-question">
      <p className="ob-question-text">{question.text}</p>
      <div className="ob-choices">
        {stdOpts.map(opt => (
          <button key={opt} type="button"
            className={`ob-choice ${value === opt ? 'ob-choice--active' : ''}`}
            onClick={() => onChange(question.id, opt)}>{opt}</button>
        ))}
        {hasOther && (
          <button type="button"
            className={`ob-choice ${isOtherActive ? 'ob-choice--active' : ''}`}
            onClick={() => onChange(question.id, isOtherActive ? '' : 'Autre')}>Autre</button>
        )}
      </div>
      {isOtherActive && (
        <input className="ob-input ob-other-input" placeholder="Précisez…"
          value={otherText} autoFocus
          onChange={e => onChange(question.id, e.target.value || 'Autre')} />
      )}
    </div>
  )
}

/* ─── Multi choice ──────────────────────────────────────────────── */
function MultiChoiceCard({ question, value, onChange }) {
  const options  = question.options || []
  const hasOther = options.includes('Autre')
  const stdOpts  = hasOther ? options.filter(o => o !== 'Autre') : options
  const selected = value ? value.split(',').filter(Boolean) : []
  const stdSel   = selected.filter(v => stdOpts.includes(v))
  const customVals = selected.filter(v => !options.includes(v))
  const isOtherActive = selected.includes('Autre') || customVals.length > 0
  const customText = customVals[0] || ''

  const build = (std, otherOn, text) => {
    if (otherOn && text) return [...std, text].join(',')
    if (otherOn) return [...std, 'Autre'].join(',')
    return std.join(',')
  }

  const toggleChip = (opt) => {
    const newStd = stdSel.includes(opt) ? stdSel.filter(v => v !== opt) : [...stdSel, opt]
    onChange(question.id, build(newStd, isOtherActive, customText))
  }

  return (
    <div className="ob-question">
      <p className="ob-question-text">{question.text}</p>
      <p className="ob-question-hint">Plusieurs choix possibles</p>
      <div className="ob-choices ob-choices--multi">
        {stdOpts.map(opt => (
          <button key={opt} type="button"
            className={`ob-choice ${stdSel.includes(opt) ? 'ob-choice--active' : ''}`}
            onClick={() => toggleChip(opt)}>{opt}</button>
        ))}
        {hasOther && (
          <button type="button"
            className={`ob-choice ${isOtherActive ? 'ob-choice--active' : ''}`}
            onClick={() => onChange(question.id, build(stdSel, !isOtherActive, ''))}>Autre</button>
        )}
      </div>
      {isOtherActive && (
        <input className="ob-input ob-other-input" placeholder="Précisez…"
          value={customText} autoFocus
          onChange={e => onChange(question.id, build(stdSel, true, e.target.value))} />
      )}
    </div>
  )
}

/* ─── Question dispatcher ───────────────────────────────────────── */
function QuestionCard({ question, value, answers, onChange, onSideEffect }) {
  if (question.type === 'country_city') {
    return (
      <CountryCityCard
        question={question}
        answers={answers}
        onChange={(id, val) => onChange(id, val)}
      />
    )
  }
  if (question.type === 'searchable_choice') {
    return <SearchableChoiceCard question={question} value={value} onChange={onChange} />
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

/* ─── Constants ─────────────────────────────────────────────────── */
const ROLE_ROUTES = { CANDIDATE: '/dashboard/candidate', EMPLOYER: '/dashboard/employer' }

/* ─── Main component ────────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setAuth } = useAuthStore()
  const role = user?.role || 'CANDIDATE'

  // AI Store
  const {
    currentQuestion,
    previousAnswers,
    context,
    isComplete: aiComplete,
    isLoading: aiLoading,
    cvUrl,
    error: aiError,
    submitAnswer: aiSubmitAnswer,
    generateCv,
    initializeOnboarding,
    resetOnboarding,
  } = useOnboardingAiStore()

  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate(ROLE_ROUTES[role] ?? '/dashboard/candidate', { replace: true })
    }
  }, [user, role, navigate])

  const totalSteps = role === 'CANDIDATE' ? 4 : 3
  const [step, setStep] = useState('initial')
  const [initialAnswers, setInitialAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aiAnswerState, setAiAnswerState] = useState('') // temp state for current AI question

  const initialQuestions = role === 'EMPLOYER'
    ? getEmployerInitialQuestions(initialAnswers)
    : getCandidateInitialQuestions(initialAnswers)

  const setAnswer = (bank, id, val) => {
    if (bank === 'initial') {
      setInitialAnswers(prev => {
        const next = { ...prev, [id]: val }
        if (id === 'companyCountry' && prev.companyCountry !== val) next.companyCity = ''
        if (id === 'candidateCountry' && prev.candidateCountry !== val) next.candidateCity = ''
        if (id === 'domain' && prev.domain !== val) next.desiredRole = ''
        return next
      })
    }
  }

  const isInitialComplete = () =>
    initialQuestions
      .filter(q => !OPTIONAL_IDS.includes(q.id))
      .every(q => {
        if (q.type === 'country_city') {
          return initialAnswers[q.countryId] && String(initialAnswers[q.countryId]).trim()
        }
        const val = initialAnswers[q.id]
        return val && String(val).trim() !== ''
      })

  const handleInitialNext = async () => {
    if (!isInitialComplete()) {
      setError('Merci de répondre à toutes les questions obligatoires.')
      return
    }
    setError('')
    setStep('ai-init')

    // Initialize AI onboarding with initial answers
    const jobTitle = initialAnswers.desiredRole || initialAnswers.hiringRole || 'Non spécifié'
    resetOnboarding()
    initializeOnboarding(role, jobTitle)
    setStep('ai')
  }

  const handleAiAnswer = async () => {
    if (!aiAnswerState.trim()) {
      setError('Veuillez répondre à cette question')
      return
    }
    setError('')
    setAiAnswerState('')

    // Submit answer to Zustand store
    await aiSubmitAnswer(aiAnswerState)
  }

  const handleAiComplete = async () => {
    if (role === 'CANDIDATE') {
      setStep('cv-gen')
      // Trigger CV generation
      const result = await generateCv()
      if (result) {
        setStep('cv')
      } else {
        setError('Erreur lors de la génération du CV')
        setStep('ai')
      }
    } else {
      // Employer flow - complete directly
      handleComplete(false)
    }
  }

  const handleComplete = async (cv = false) => {
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        role,
        initialAnswers,
        aiAnswers: Object.fromEntries(previousAnswers.map(a => [a.fieldKey, a.answer])),
        wantsCv: cv,
      }
      const data = await completeOnboarding(payload.role, payload.initialAnswers, payload.aiAnswers, payload.wantsCv)
      setAuth(data)
      setStep('done')
      setTimeout(() => navigate(ROLE_ROUTES[role] ?? '/dashboard/candidate'), 1800)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCvComplete = async () => {
    await handleComplete(true)
  }

  /* ── Loading ── */
  if (step === 'ai-init') return (
    <StellaLoader
      message="STELLA analyse vos réponses…"
      sub="Préparation des questions personnalisées"
    />
  )

  if (step === 'cv-gen') return (
    <StellaLoader
      message="Génération de votre CV…"
      sub="Mise en page professionnelle en cours"
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

  /* ── CV Generation with new screen ── */
  if (step === 'cv') {
    return (
      <CvGenerationScreen
        cvUrl={cvUrl}
        country={context.country}
        onDownload={() => { /* track if needed */ }}
        onClose={() => handleCvComplete()}
      />
    )
  }

  /* ── AI Questions with new components ── */
  if (step === 'ai' && currentQuestion) {
    return (
      <div className="ob-shell">
        <div className="ob-card">
          <div className="ob-card-header">
            <div className="ob-logo">
              <span className="ob-logo-icon">S</span>
              <span className="ob-logo-text">SkillSet</span>
            </div>
            <ProgressBar current={2} total={totalSteps} />
          </div>

          <div className="ob-card-body">
            <PhaseIndicator
              currentPhase={currentQuestion.nextPhase || 'INTRO'}
              userRole={role}
              completedQuestions={previousAnswers.length}
              totalQuestions={15}
            />

            {(error || aiError) && <div className="ob-error">{error || aiError}</div>}

            <AiQuestionCard
              question={currentQuestion}
              value={aiAnswerState}
              onChange={(val) => setAiAnswerState(val)}
              onSubmit={handleAiAnswer}
              context={context}
              isLoading={aiLoading}
            />
          </div>

          <div className="ob-card-footer">
            <button className="ob-btn-ghost" onClick={() => setStep('initial')}>
              <ChevronLeft size={16} /> Retour
            </button>
            {aiComplete && (
              <button
                className="ob-btn-primary"
                onClick={handleAiComplete}
                disabled={aiLoading}
              >
                {role === 'CANDIDATE' ? 'Générer mon CV' : 'Terminer'}
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Initial questions (unchanged) ── */
  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-card-header">
          <div className="ob-logo">
            <span className="ob-logo-icon">S</span>
            <span className="ob-logo-text">SkillSet</span>
          </div>
          <ProgressBar current={1} total={totalSteps} />
        </div>

        <div className="ob-card-body">
          <h2 className="ob-section-title">
            {role === 'CANDIDATE' ? 'Parlez-nous de vous' : 'Votre entreprise'}
          </h2>
          <p className="ob-section-sub">Quelques questions pour personnaliser votre expérience</p>
          {error && <div className="ob-error">{error}</div>}

          <div className="ob-questions">
            {initialQuestions.map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                value={initialAnswers[q.id] || ''}
                answers={initialAnswers}
                onChange={(id, val) => setAnswer('initial', id, val)}
                onSideEffect={(id, val) => setAnswer('initial', id, val)}
              />
            ))}
          </div>
        </div>

        <div className="ob-card-footer">
          <button className="ob-btn-primary" onClick={handleInitialNext}>
            Continuer
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
