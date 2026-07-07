import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Send, Search, MessageSquare, CheckCheck, Plus, X, Phone,
} from 'lucide-react'
import { useAuthStore }              from '../../store/AuthStore'
import { useMessageStore, CONTACTS } from '../../store/MessageStore'
import { messageService }            from '../../services/messageService'
import { useWebSocket }              from '../../hooks/useWebSocket'
import { markAsRead }               from '../../api/MessageApi'
import AppNavbar                     from '../../components/common/AppNavbar'
import './MessageCenter.css'

function fmtTime(iso) {
  const d   = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function fmtMsgTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function MessageCenter() {
  const { user }                                                                                   = useAuthStore()
  const { conversations, activeConvId, setActiveConv, sendMessage, startConversation, receiveMessage } = useMessageStore()

  // Real-time: receive messages via WebSocket, dispatch to store, mark as read if conv is active
  const onWsMessage = useCallback((dto) => {
    const otherId = dto.senderId === user?.id ? dto.recipientId : dto.senderId
    const conv    = conversations.find(c => c.contact?.id === otherId)
    if (conv) {
      receiveMessage(conv.id, dto.content, dto.senderId)
      if (conv.id === activeConvId && dto.id) {
        markAsRead(dto.id).catch(() => {})
      }
    }
  }, [conversations, user?.id, receiveMessage, activeConvId])
  useWebSocket(user?.id ?? null, onWsMessage)

  const [text, setText]           = useState('')
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalQ, setModalQ]       = useState('')

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const dialogRef = useRef(null)

  const activeConv = conversations.find(c => c.id === activeConvId) || null
  const filtered   = conversations.filter(c =>
    c.contact.name.toLowerCase().includes(search.toLowerCase())
  )
  const modalResults = modalQ.trim()
    ? CONTACTS.filter(c =>
        c.name.toLowerCase().includes(modalQ.toLowerCase()) ||
        c.company.toLowerCase().includes(modalQ.toLowerCase()) ||
        c.role.toLowerCase().includes(modalQ.toLowerCase())
      )
    : CONTACTS

  // Sync <dialog> open state
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (showModal) {
      d.showModal()
    } else {
      d.close()
    }
  }, [showModal])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages?.length])

  useEffect(() => {
    if (activeConvId) inputRef.current?.focus()
  }, [activeConvId])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || !activeConvId) return
    sendMessage(activeConvId, trimmed)
    setText('')
    messageService.sendMessage({ receiverId: activeConv?.contact?.id, content: trimmed })
      .catch(() => {})
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSelectContact = (contact) => {
    startConversation(contact)
    setShowModal(false)
  }

  return (
    <div className="mc-shell">

      {/* New conversation modal — native <dialog> */}
      <dialog ref={dialogRef} className="mc-modal-dialog" onClose={() => setShowModal(false)}>
        <div className="mc-modal">
          <div className="mc-modal-header">
            <h3 className="mc-modal-title">Nouvelle conversation</h3>
            <button className="mc-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
          </div>
          <div className="mc-modal-search-wrap">
            <Search size={14} className="mc-search-icon" />
            <input
              className="mc-search-input"
              placeholder="Chercher un recruteur ou une entreprise…"
              value={modalQ}
              onChange={e => setModalQ(e.target.value)}
            />
          </div>
          <div className="mc-modal-list">
            {modalResults.map(c => (
              <button key={c.id} className="mc-modal-contact" onClick={() => handleSelectContact(c)}>
                <span className="mc-conv-avatar">{c.avatar}</span>
                <div className="mc-modal-contact-info">
                  <p className="mc-modal-contact-name">{c.name}</p>
                  <p className="mc-modal-contact-role">{c.role}</p>
                </div>
                {c.online && <span className="mc-online-dot mc-online-dot--inline" />}
                <Phone size={14} className="mc-modal-wa-hint" title="WhatsApp disponible" />
              </button>
            ))}
            {modalResults.length === 0 && (
              <p className="mc-no-conv">Aucun contact trouvé</p>
            )}
          </div>
        </div>
      </dialog>

      <AppNavbar />

      {/* Layout */}
      <div className="mc-layout">

        {/* Sidebar */}
        <aside className="mc-sidebar">
          <div className="mc-sidebar-header">
            <h2 className="mc-sidebar-title"><MessageSquare size={18} /> Messages</h2>
            <button
              className="mc-new-conv-btn"
              onClick={() => { setModalQ(''); setShowModal(true) }}
              aria-label="Nouvelle conversation"
              title="Nouvelle conversation"
            >
              <Plus size={17} />
            </button>
          </div>
          <div className="mc-search-wrap">
            <Search size={14} className="mc-search-icon" />
            <input
              className="mc-search-input"
              placeholder="Chercher une conversation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="mc-conv-list">
            {filtered.length === 0 && <p className="mc-no-conv">Aucune conversation trouvée</p>}
            {filtered.map(c => (
              <button
                key={c.id}
                className={`mc-conv-item ${c.id === activeConvId ? 'mc-conv-item--active' : ''}`}
                onClick={() => setActiveConv(c.id)}
              >
                <div className="mc-conv-avatar-wrap">
                  <span className="mc-conv-avatar">{c.contact.avatar}</span>
                  {c.contact.online && <span className="mc-online-dot" />}
                </div>
                <div className="mc-conv-info">
                  <div className="mc-conv-top">
                    <span className="mc-conv-name">{c.contact.name}</span>
                    <span className="mc-conv-time">{fmtTime(c.lastTime)}</span>
                  </div>
                  <div className="mc-conv-bottom">
                    <span className={`mc-conv-preview ${c.unread > 0 ? 'mc-conv-preview--bold' : ''}`}>
                      {c.lastMessage || 'Démarrer la conversation…'}
                    </span>
                    {c.unread > 0 && <span className="mc-unread-badge">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <main className="mc-chat">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="mc-chat-header">
                <div className="mc-chat-avatar-wrap">
                  <span className="mc-chat-avatar">{activeConv.contact.avatar}</span>
                  {activeConv.contact.online && <span className="mc-online-dot" />}
                </div>
                <div className="mc-chat-info">
                  <p className="mc-chat-name">{activeConv.contact.name}</p>
                  <p className="mc-chat-role">
                    {activeConv.contact.online ? '🟢 En ligne' : '⚫ Hors ligne'} · {activeConv.contact.role}
                  </p>
                </div>
                {activeConv.contact.phone && (
                  <a
                    className="mc-wa-btn"
                    href={`https://wa.me/${activeConv.contact.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Contacter sur WhatsApp"
                  >
                    <Phone size={15} /> WhatsApp
                  </a>
                )}
              </div>

              {/* Messages */}
              <div className="mc-messages">
                {activeConv.messages.length === 0 && (
                  <div className="mc-messages-empty">
                    <p>Aucun message — démarrez la conversation !</p>
                  </div>
                )}
                {activeConv.messages.map(m => {
                  const isUser = m.from === 'user'
                  return (
                    <div key={m.id} className={`mc-msg ${isUser ? 'mc-msg--user' : 'mc-msg--other'}`}>
                      {!isUser && (
                        <span className="mc-msg-avatar">{activeConv.contact.avatar}</span>
                      )}
                      <div className="mc-bubble">
                        <p className="mc-bubble-text">{m.text}</p>
                        <span className="mc-bubble-meta">
                          {fmtMsgTime(m.time)}
                          {isUser && <CheckCheck size={11} className={`mc-check ${m.read ? 'mc-check--read' : ''}`} />}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="mc-input-row">
                <textarea
                  ref={inputRef}
                  className="mc-input"
                  placeholder={`Écrire à ${activeConv.contact.name}…`}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button
                  className="mc-send-btn"
                  onClick={handleSend}
                  disabled={!text.trim()}
                  aria-label="Envoyer"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="mc-empty-state">
              <MessageSquare size={52} strokeWidth={1.1} className="mc-empty-icon" />
              <h3>Sélectionnez une conversation</h3>
              <p>Vos échanges avec recruteurs et candidats s&apos;affichent ici</p>
              <button className="mc-start-btn" onClick={() => { setModalQ(''); setShowModal(true) }}>
                <Plus size={15} /> Nouvelle conversation
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
