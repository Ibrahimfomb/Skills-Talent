import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { X, Star, Send, Loader2, CalendarPlus, ExternalLink } from 'lucide-react'
import MatchScoreBadge from '../matching/MatchScoreBadge'
import { getReviews, addReview } from '../../api/ReviewApi'
import { scheduleInterview }     from '../../api/InterviewApi'
import './ReviewPanel.css'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="rp-stars" role="group" aria-label="Note">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`rp-star${n <= (hover || value) ? ' rp-star--on' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          <Star size={20} />
        </button>
      ))}
    </div>
  )
}
StarRating.propTypes = { value: PropTypes.number.isRequired, onChange: PropTypes.func.isRequired }

const STATUS_OPTIONS = [
  { value: 'PENDING',    label: 'En attente' },
  { value: 'SHORTLIST',  label: 'Présélectionné' },
  { value: 'RECOMMEND',  label: 'Recommandé' },
  { value: 'DECLINE',    label: 'Refusé' },
]

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPTY_ITW = { scheduledAt: '', interviewType: 'Visioconférence', interviewLink: '', calendlyLink: '', notes: '' }

export default function ReviewPanel({ card, onClose }) {
  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating,     setRating]     = useState(0)
  const [comments,   setComments]   = useState('')
  const [status,     setStatus]     = useState('PENDING')
  const [error,      setError]      = useState('')

  // Interview scheduling
  const [itw,         setItw]         = useState(EMPTY_ITW)
  const [itwSending,  setItwSending]  = useState(false)
  const [itwSuccess,  setItwSuccess]  = useState(false)
  const [itwError,    setItwError]    = useState('')

  useEffect(() => {
    if (!card) return
    setLoading(true)
    setError('')
    setItwSuccess(false)
    setItw(EMPTY_ITW)
    getReviews(card.id)
      .then(setReviews)
      .catch(() => setError('Impossible de charger les avis.'))
      .finally(() => setLoading(false))
  }, [card?.id])

  const handleSchedule = async (e) => {
    e.preventDefault()
    if (!itw.scheduledAt) { setItwError('Veuillez choisir une date.'); return }
    setItwSending(true)
    setItwError('')
    try {
      await scheduleInterview({
        applicationId: card.id,
        candidateId:   card.jobSeekerId ?? '',
        scheduledAt:   itw.scheduledAt,
        interviewType: itw.interviewType,
        interviewLink: itw.interviewLink || null,
        calendlyLink:  itw.calendlyLink  || null,
        notes:         itw.notes         || null,
        status:        'SCHEDULED',
      })
      setItwSuccess(true)
    } catch {
      setItwError('Erreur lors de la planification.')
    } finally {
      setItwSending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setError('Veuillez attribuer une note.'); return }
    setSubmitting(true)
    setError('')
    try {
      const newReview = await addReview(card.id, rating, comments, status)
      setReviews(prev => [newReview, ...prev])
      setRating(0)
      setComments('')
      setStatus('PENDING')
    } catch {
      setError('Erreur lors de l\'envoi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!card) return null

  return (
    <div className="rp-overlay" onClick={onClose}>
      <aside className="rp-panel" onClick={e => e.stopPropagation()} role="dialog" aria-label="Avis recruteur">
        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-info">
            <div className="rp-avatar">{card.initials}</div>
            <div>
              <p className="rp-name">{card.name || 'Candidat anonyme'}</p>
              <p className="rp-job">{card.jobTitle}</p>
            </div>
          </div>
          <div className="rp-header-right">
            <MatchScoreBadge score={card.match} explanation={card.explanation} size="md" />
            <button className="rp-close" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
          </div>
        </div>

        <div className="rp-body">
          {/* ── Interview scheduling ── */}
          <div className="rp-section">
            <p className="rp-section-label"><CalendarPlus size={14} style={{ marginRight: 4 }} />Planifier un entretien</p>
            {itwSuccess ? (
              <p className="rp-itw-success">Entretien planifié avec succès !</p>
            ) : (
              <form className="rp-itw-form" onSubmit={handleSchedule}>
                <div className="rp-itw-row">
                  <input
                    type="datetime-local"
                    className="rp-input"
                    value={itw.scheduledAt}
                    onChange={e => setItw(p => ({ ...p, scheduledAt: e.target.value }))}
                  />
                  <select
                    className="rp-select"
                    value={itw.interviewType}
                    onChange={e => setItw(p => ({ ...p, interviewType: e.target.value }))}
                  >
                    <option>Visioconférence</option>
                    <option>Téléphone</option>
                    <option>Présentiel</option>
                  </select>
                </div>
                <input
                  className="rp-input"
                  placeholder="Lien de réunion (Meet, Zoom…)"
                  value={itw.interviewLink}
                  onChange={e => setItw(p => ({ ...p, interviewLink: e.target.value }))}
                />
                <div className="rp-itw-calendly">
                  <ExternalLink size={13} />
                  <input
                    className="rp-input"
                    placeholder="Lien Calendly (https://calendly.com/…)"
                    value={itw.calendlyLink}
                    onChange={e => setItw(p => ({ ...p, calendlyLink: e.target.value }))}
                  />
                </div>
                <textarea
                  className="rp-textarea"
                  placeholder="Notes pour le candidat…"
                  rows={2}
                  value={itw.notes}
                  onChange={e => setItw(p => ({ ...p, notes: e.target.value }))}
                />
                {itwError && <p className="rp-error">{itwError}</p>}
                <button className="rp-submit" type="submit" disabled={itwSending}>
                  {itwSending ? <Loader2 size={15} className="rp-spin" /> : <CalendarPlus size={15} />}
                  Planifier
                </button>
              </form>
            )}
          </div>

          {/* Add review form */}
          <form className="rp-form" onSubmit={handleSubmit}>
            <p className="rp-section-label">Ajouter un avis</p>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              className="rp-textarea"
              placeholder="Notes, observations, points forts…"
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
            />
            <div className="rp-form-row">
              <select className="rp-select" value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className="rp-submit" type="submit" disabled={submitting}>
                {submitting ? <Loader2 size={15} className="rp-spin" /> : <Send size={15} />}
                Envoyer
              </button>
            </div>
            {error && <p className="rp-error">{error}</p>}
          </form>

          {/* Existing reviews */}
          <div className="rp-reviews">
            <p className="rp-section-label">Historique ({reviews.length})</p>
            {loading && <div className="rp-loading"><Loader2 size={20} className="rp-spin" /></div>}
            {!loading && reviews.length === 0 && (
              <p className="rp-empty">Aucun avis pour l'instant.</p>
            )}
            {reviews.map(r => (
              <div key={r.id} className="rp-review-item">
                <div className="rp-review-top">
                  <span className="rp-review-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} className={i < (r.rating ?? 0) ? 'rp-star--on' : ''} />
                    ))}
                  </span>
                  <span className={`rp-badge rp-badge--${r.status?.toLowerCase()}`}>{
                    STATUS_OPTIONS.find(o => o.value === r.status)?.label ?? r.status
                  }</span>
                  <span className="rp-review-date">{fmtDate(r.createdAt)}</span>
                </div>
                {r.comments && <p className="rp-review-text">{r.comments}</p>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

ReviewPanel.propTypes = {
  card:    PropTypes.object,
  onClose: PropTypes.func.isRequired,
}
