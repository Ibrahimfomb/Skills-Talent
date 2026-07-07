import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Search,
  CheckCheck, Trash2, Briefcase, CalendarCheck, Zap, Star,
} from 'lucide-react'
import { useAuthStore }         from '../../store/AuthStore'
import { useNotificationStore } from '../../store/NotificationStore'
import AppNavbar                from '../../components/common/AppNavbar'
import './NotificationsPage.css'

const TYPE_CONFIG = {
  application: { icon: <Briefcase size={16} />,     color: '#2164f3', bg: '#eef1ff' },
  interview:   { icon: <CalendarCheck size={16} />, color: '#2d7600', bg: '#eafaf0' },
  message:     { icon: <MessageSquare size={16} />, color: '#c42033', bg: '#fde8ea' },
  match:       { icon: <Star size={16} />,          color: '#7a5a00', bg: '#fff8e0' },
  stella:      { icon: <Zap size={16} />,           color: '#6629a6', bg: '#f3eeff' },
}

function groupByDate(notifications) {
  const today     = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const groups = { "Aujourd'hui": [], 'Hier': [], 'Plus tôt': [] }
  for (const n of notifications) {
    const d = new Date(n.date); d.setHours(0,0,0,0)
    if (d.getTime() === today.getTime())          groups["Aujourd'hui"].push(n)
    else if (d.getTime() === yesterday.getTime()) groups['Hier'].push(n)
    else groups['Plus tôt'].push(n)
  }
  return Object.entries(groups).filter(([, arr]) => arr.length > 0)
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsPage() {
  const navigate                               = useNavigate()
  const { user }                               = useAuthStore()
  const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useNotificationStore()
  const [alertOn, setAlertOn]                  = useState(true)

  const dashPath = user?.role === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard/candidate'
  const groups   = groupByDate(notifications)

  const handleClick = (n) => {
    if (!n.read) markRead(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="np-shell">

      <AppNavbar />

      {/* ── Main ── */}
      <main className="np-main">
        <div className="np-content">

          {/* Has notifications */}
          {notifications.length > 0 && (
            <>
              <div className="np-page-header">
                <div className="np-title-row">
                  <h1 className="np-title">Notifications</h1>
                  {unreadCount > 0 && <span className="np-unread-chip">{unreadCount} non lues</span>}
                </div>
                {unreadCount > 0 && (
                  <button className="np-mark-all" onClick={markAllRead}>
                    <CheckCheck size={15} /> Tout marquer comme lu
                  </button>
                )}
              </div>

              {groups.map(([label, items]) => (
                <section key={label} className="np-group">
                  <h2 className="np-group-label">{label}</h2>
                  <div className="np-notif-list">
                    {items.map(n => {
                      const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.stella
                      return (
                        <div
                          key={n.id}
                          className={`np-notif-card ${!n.read ? 'np-notif-card--unread' : ''}`}
                          onClick={() => handleClick(n)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && handleClick(n)}
                        >
                          <div className="np-notif-icon" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.icon}
                          </div>
                          <div className="np-notif-body">
                            <p className="np-notif-title">{n.title}</p>
                            <p className="np-notif-text">{n.body}</p>
                            <p className="np-notif-time">{fmtTime(n.date)}</p>
                          </div>
                          <div className="np-notif-actions">
                            {!n.read && <span className="np-unread-dot" />}
                            <button
                              className="np-delete-btn"
                              onClick={e => { e.stopPropagation(); removeNotification(n.id) }}
                              aria-label="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </>
          )}

          {/* Empty state — Indeed style */}
          {notifications.length === 0 && (
            <div className="np-empty-state">
              <div className="np-empty-illo">🔔</div>
              <h2 className="np-empty-title">Aucune notification pour le moment.<br />Revenez ultérieurement.</h2>
              <p className="np-empty-sub">Recevez des mises à jour à partir de vos recherches récentes</p>

              {/* Job alert toggle */}
              <div className="np-alert-card">
                <div className="np-alert-row">
                  <span className="np-alert-icon">🕐</span>
                  <span className="np-alert-text"><strong>5 364 nouveaux emplois</strong> Offre Emploi</span>
                  <button
                    className={`np-toggle ${alertOn ? 'np-toggle--on' : ''}`}
                    onClick={() => setAlertOn(v => !v)}
                    aria-label="Activer l'alerte emploi"
                  >
                    <span className="np-toggle-knob" />
                  </button>
                </div>
              </div>

              <p className="np-alert-hint">
                Vous recevrez votre mise à jour par email dès qu&apos;un poste sera disponible.
              </p>
              <button className="np-modify-link" onClick={() => navigate('/settings')}>
                Modifier mes préférences pour les emails
              </button>

              <button className="np-search-btn" onClick={() => navigate(dashPath)}>
                <Search size={15} /> Rechercher
              </button>

              <p className="np-legal">
                En créant une alerte Emploi, vous acceptez nos conditions d&apos;utilisation.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
