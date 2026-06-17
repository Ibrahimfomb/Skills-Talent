import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Send, ChevronDown, Sparkles, WifiOff, Zap, Search, ChevronRight, MessageSquare, Phone } from 'lucide-react'
import { stellaChat, runStellaTask, appSearch } from '../../api/StellaApi'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useAuthStore } from '../../store/AuthStore'
import { useMessageStore } from '../../store/MessageStore'
import './ChatbotWidget.css'

const QUICK_ACTIONS_CANDIDATE = [
  { label: '🎯 Meilleures offres pour moi', msg: 'Quelles sont les meilleures offres pour mon profil ?' },
  { label: '💰 Estimer mon salaire',         msg: 'Estime mon salaire selon mon profil.' },
  { label: '📄 Analyser mon profil',         msg: 'Analyse mon profil et donne-moi des conseils.' },
  { label: '📞 Contacter un recruteur',      msg: 'Je veux contacter un recruteur.' },
]

const QUICK_ACTIONS_EMPLOYER = [
  { label: '✍️ Rédiger une offre',           msg: "Aide-moi à rédiger une offre d'emploi attractive." },
  { label: '👥 Analyser des candidatures',   msg: 'Comment analyser efficacement les candidatures reçues ?' },
  { label: '💬 Questions d\'entretien',      msg: 'Génère des questions d\'entretien pertinentes pour mon poste.' },
  { label: '📊 Tendances du marché',         msg: 'Quelles sont les tendances salariales dans mon secteur ?' },
]

const STELLA_TASKS = [
  { id: 'find-best',        icon: '🎯', label: 'Trouver mes meilleures offres',  desc: 'Analyse et classe les offres selon ton profil' },
  { id: 'salary-analysis',  icon: '💰', label: 'Estimation de salaire',          desc: 'Calcule ta fourchette de rémunération' },
  { id: 'profile-analysis', icon: '📊', label: 'Analyser mon profil',            desc: 'Score et conseils pour ton profil' },
  { id: 'apply-top',        icon: '📤', label: 'Postuler automatiquement',       desc: 'Postule à la meilleure offre correspondante' },
  { id: 'prepare-interview',icon: '🎤', label: 'Préparer un entretien',          desc: 'Questions et stratégies personnalisées' },
]

function TypingDots() {
  return <div className="cw-typing"><span /><span /><span /></div>
}

function renderText(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={`b-${part}-${i}`}>{part}</strong> : part
  )
}

export default function ChatbotWidget() {
  const navigate = useNavigate()
  const { user }  = useAuthStore()
  const { startConversation } = useMessageStore()
  const { isOnline, wasOffline } = useOnlineStatus()

  const isEmployer = user?.role === 'EMPLOYER'
  const QUICK_ACTIONS = isEmployer ? QUICK_ACTIONS_EMPLOYER : QUICK_ACTIONS_CANDIDATE

  // Always include role + firstName in the profile context sent to the backend
  const profile = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ss_profile') || 'null')
      const base = stored ?? user
      return { ...base, role: user?.role, firstName: user?.firstName, lastName: user?.lastName }
    } catch { return user }
  })()

  const [open, setOpen]           = useState(false)
  const [tab, setTab]             = useState('chat')
  const [messages, setMessages]   = useState([
    { id: 0, role: 'stella', text: buildGreeting(user, isOnline), action: null },
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [taskRunning, setTaskRunning] = useState(null)
  const [searchQ, setSearchQ]     = useState('')
  const [searchRes, setSearchRes] = useState(null)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const pushStella = useCallback((text, action = null) => {
    setMessages(prev => [...prev, { id: Date.now(), role: 'stella', text, action }])
  }, [])

  useEffect(() => {
    if (!open) return
    let msg = null
    if (!isOnline) {
      msg = "⚠️ **Connexion perdue.** Je continue à fonctionner avec les données SkillSet disponibles hors ligne. Les recherches internet sont suspendues."
    } else if (wasOffline) {
      msg = "✅ **Connexion rétablie !** Les recherches internet sont à nouveau disponibles."
    }
    if (msg) {
      const t = setTimeout(() => pushStella(msg, null), 0)
      return () => clearTimeout(t)
    }
    return undefined
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 80)
    }
  }, [open, messages])

  const send = async (text = input) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, action: null }])
    setLoading(true)

    const history = messages.map(m => ({ role: m.role === 'stella' ? 'assistant' : 'user', content: m.text }))
    const { text: reply, action } = await stellaChat(msg, { history, profile, online: isOnline })

    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'stella', text: reply, action: action ?? null }])
    setLoading(false)
  }

  const runTask = async (taskId) => {
    setTaskRunning(taskId)
    setTab('chat')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: `[Mode autonome] ${STELLA_TASKS.find(t => t.id === taskId)?.label}`, action: null }])
    setLoading(true)

    const result = await runStellaTask(taskId, profile)

    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'stella', text: result, action: null }])
    setLoading(false)
    setTaskRunning(null)
  }

  const handleOpenConversation = (contact) => {
    startConversation(contact)
    navigate('/messages')
    setOpen(false)
  }

  const handleWhatsApp = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const doSearch = (q = searchQ) => {
    if (!q.trim()) return
    const res = appSearch(q)
    setSearchRes({ query: q, ...res })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* FAB */}
      <button
        className={`cw-fab ${open ? 'cw-fab--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Ouvrir STELLA"
      >
        {open ? <ChevronDown size={22} /> : <Sparkles size={22} />}
        {!open && <span className="cw-fab-label">STELLA</span>}
        {!open && !isOnline && <span className="cw-fab-offline-dot" title="Hors ligne" />}
      </button>

      {open && (
        <div className="cw-window">

          {/* Header */}
          <div className="cw-header">
            <div className="cw-header-info">
              <div className="cw-avatar">S</div>
              <div>
                <p className="cw-header-name">STELLA</p>
                <p className="cw-header-status">
                  {isOnline
                    ? <><span className="cw-dot cw-dot--green" />En ligne · IA SkillSet</>
                    : <><span className="cw-dot cw-dot--red" /><WifiOff size={11} style={{ marginRight: 3 }} />Hors ligne</>
                  }
                </p>
              </div>
            </div>
            <div className="cw-header-actions">
              <button
                className={`cw-mode-btn ${tab === 'tasks' ? 'active' : ''}`}
                onClick={() => setTab(t => t === 'tasks' ? 'chat' : 'tasks')}
                title="Mode autonome"
              >
                <Zap size={15} />
              </button>
              <button
                className={`cw-mode-btn ${tab === 'search' ? 'active' : ''}`}
                onClick={() => setTab(t => t === 'search' ? 'chat' : 'search')}
                title="Recherche globale"
              >
                <Search size={15} />
              </button>
              <button className="cw-close" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
          </div>

          {/* Offline banner */}
          {!isOnline && (
            <div className="cw-offline-banner">
              <WifiOff size={13} />
              Hors ligne — Recherches internet indisponibles
            </div>
          )}

          {/* ── TAB: AUTONOMOUS TASKS ── */}
          {tab === 'tasks' && (
            <div className="cw-tasks-panel">
              <p className="cw-tasks-title"><Zap size={14} /> Mode autonome STELLA</p>
              <p className="cw-tasks-sub">Laissez STELLA agir pour vous automatiquement</p>
              {STELLA_TASKS.map(task => (
                <button
                  key={task.id}
                  className={`cw-task-btn ${taskRunning === task.id ? 'running' : ''}`}
                  onClick={() => runTask(task.id)}
                  disabled={!!taskRunning}
                >
                  <span className="cw-task-icon">{task.icon}</span>
                  <span className="cw-task-info">
                    <span className="cw-task-label">{task.label}</span>
                    <span className="cw-task-desc">{task.desc}</span>
                  </span>
                  <ChevronRight size={14} className="cw-task-arrow" />
                </button>
              ))}
            </div>
          )}

          {/* ── TAB: GLOBAL SEARCH ── */}
          {tab === 'search' && (
            <div className="cw-search-panel">
              <p className="cw-tasks-title"><Search size={14} /> Recherche globale</p>
              <div className="cw-search-input-row">
                <input
                  className="cw-search-input"
                  placeholder="Poste, compétence, entreprise, contact…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                />
                <button className="cw-search-go" onClick={() => doSearch()}>
                  <Search size={15} />
                </button>
              </div>
              {!isOnline && (
                <p className="cw-search-offline">⚠️ Hors ligne — Résultats limités aux données locales SkillSet</p>
              )}
              {searchRes && (
                <div className="cw-search-results">
                  {searchRes.jobs.length > 0 && (
                    <>
                      <p className="cw-search-section">💼 Offres d&apos;emploi ({searchRes.jobs.length})</p>
                      {searchRes.jobs.map(j => (
                        <div key={j.id} className="cw-search-item">
                          <span>{j.logo}</span>
                          <div>
                            <p className="cw-search-item-title">{j.title}</p>
                            <p className="cw-search-item-sub">{j.company} · {j.location}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {searchRes.companies.length > 0 && (
                    <>
                      <p className="cw-search-section">🏢 Entreprises ({searchRes.companies.length})</p>
                      {searchRes.companies.map(c => (
                        <div key={c.id} className="cw-search-item">
                          <span>{c.logo}</span>
                          <div>
                            <p className="cw-search-item-title">{c.name}</p>
                            <p className="cw-search-item-sub">⭐ {c.rating} · {c.sector}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {searchRes.contacts && searchRes.contacts.length > 0 && (
                    <>
                      <p className="cw-search-section">👤 Contacts ({searchRes.contacts.length})</p>
                      {searchRes.contacts.map(c => (
                        <button
                          key={c.id}
                          className="cw-search-item cw-search-item--btn"
                          onClick={() => handleOpenConversation(c)}
                        >
                          <span>{c.avatar}</span>
                          <div>
                            <p className="cw-search-item-title">{c.name}</p>
                            <p className="cw-search-item-sub">{c.role}</p>
                          </div>
                          <MessageSquare size={14} className="cw-search-contact-icon" />
                        </button>
                      ))}
                    </>
                  )}
                  {searchRes.jobs.length === 0 && searchRes.companies.length === 0 && (!searchRes.contacts || searchRes.contacts.length === 0) && (
                    <p className="cw-search-empty">Aucun résultat pour &laquo; {searchRes.query} &raquo;</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: CHAT ── */}
          {tab === 'chat' && (
            <>
              <div className="cw-messages">
                {messages.map(m => (
                  <div key={m.id} className={`cw-msg cw-msg--${m.role}`}>
                    {m.role === 'stella' && <div className="cw-msg-avatar">S</div>}
                    <div className="cw-bubble">
                      {m.text.split('\n').map((line, i) => (
                        <span key={`${m.id}-${i}`}>
                          {renderText(line)}{i < m.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}

                      {/* Action buttons */}
                      {m.action?.type === 'start_conversation' && (
                        <button
                          className="cw-action-btn cw-action-btn--msg"
                          onClick={() => handleOpenConversation(m.action.contact)}
                        >
                          <MessageSquare size={14} />
                          Ouvrir la conversation
                        </button>
                      )}
                      {m.action?.type === 'whatsapp' && (
                        <div className="cw-action-group">
                          <button
                            className="cw-action-btn cw-action-btn--wa"
                            onClick={() => handleWhatsApp(m.action.url)}
                          >
                            <Phone size={14} />
                            Envoyer sur WhatsApp
                          </button>
                          <button
                            className="cw-action-btn cw-action-btn--msg"
                            onClick={() => handleOpenConversation(m.action.contact)}
                          >
                            <MessageSquare size={14} />
                            Messagerie SkillSet
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="cw-msg cw-msg--stella">
                    <div className="cw-msg-avatar">S</div>
                    <div className="cw-bubble"><TypingDots /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {messages.length <= 1 && (
                <div className="cw-quick-actions">
                  {QUICK_ACTIONS.map(qa => (
                    <button key={qa.label} className="cw-quick-chip" onClick={() => send(qa.msg)}>
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="cw-input-row">
                <textarea
                  ref={inputRef}
                  className="cw-input"
                  placeholder={isOnline ? 'Posez votre question à STELLA…' : 'Hors ligne — données locales uniquement'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button className="cw-send" onClick={() => send()} disabled={!input.trim() || loading}>
                  <Send size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

function buildGreeting(user, online) {
  const name   = user?.firstName ? `, ${user.firstName}` : ''
  const status = online ? '' : '\n\n⚠️ Mode hors ligne — Recherches internet indisponibles.'

  if (user?.role === 'EMPLOYER') {
    return `Bonjour${name} ! Je suis **STELLA**, votre assistante IA SkillSet 🌟\n\nJe peux vous aider à :\n• Rédiger des offres d'emploi attractives\n• Analyser vos candidatures\n• Préparer vos entretiens\n• Analyser les tendances du marché\n• Définir vos grilles salariales${status}`
  }

  return `Bonjour${name} ! Je suis **STELLA**, votre assistante IA SkillSet 🌟\n\nJe peux :\n• Trouver les meilleures offres pour votre profil\n• Estimer votre salaire\n• Postuler automatiquement (Mode ⚡)\n• Vous mettre en contact avec un recruteur\n• Envoyer un message WhatsApp${status}`
}
