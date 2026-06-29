import { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Calendar, Search, Filter, ChevronDown, Loader2, ListChecks } from 'lucide-react'
import { useAuthStore }            from '../../store/AuthStore'
import AppNavbar                   from '../../components/common/AppNavbar'
import MatchScoreBadge             from '../../features/matching/MatchScoreBadge'
import ReviewPanel                 from '../../features/reviews/ReviewPanel'
import BulkStatusModal             from '../../features/automation/BulkStatusModal'
import AddToPoolButton             from '../../features/talentpool/AddToPoolButton'
import { getEmployerApplications, updateApplicationStatus } from '../../api/ApplicationApi'
import './CandidateReview.css'

const COLUMNS = [
  { id: 'SUBMITTED', label: 'Soumis',    color: '#2b4fbf', bg: '#e8f0ff' },
  { id: 'SCREENING', label: 'Screening', color: '#a05a00', bg: '#fff3e0' },
  { id: 'INTERVIEW', label: 'Entretien', color: '#7c3aed', bg: '#f3e8ff' },
  { id: 'OFFER',     label: 'Offre',     color: '#0d7a5f', bg: '#e0f7f4' },
  { id: 'APPROVED',  label: 'Accepté',   color: '#1a6e44', bg: '#e8f8ee' },
  { id: 'REJECTED',  label: 'Rejeté',    color: '#c42033', bg: '#fff0f0' },
]

function initials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function KanbanCard({ c, idx, onSelect, isSelected, onToggle }) {
  return (
    <Draggable draggableId={c.id} index={idx}>
      {(prov, snap) => (
        <div
          ref={prov.innerRef}
          {...prov.draggableProps}
          {...prov.dragHandleProps}
          className={`kb-card${snap.isDragging ? ' kb-card--dragging' : ''}${isSelected ? ' kb-card--selected' : ''}`}
          onClick={() => onSelect(c)}
        >
          <div className="kb-card-top">
            <div className="kb-avatar">{c.initials}</div>
            <div className="kb-name">{c.name || 'Candidat anonyme'}</div>
            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
              {c.candidateId && (
                <AddToPoolButton candidateId={c.candidateId} onSuccess={() => {}} />
              )}
              <input
                type="checkbox"
                className="kb-card-check"
                checked={isSelected}
                onClick={e => e.stopPropagation()}
                onChange={e => { e.stopPropagation(); onToggle(c.id) }}
              />
            </div>
          </div>
          <div className="kb-job" title={c.jobTitle}>{c.jobTitle}</div>
          <div className="kb-card-footer">
            <MatchScoreBadge score={c.match} explanation={c.explanation} size="sm" />
            <span className="kb-date"><Calendar size={10} />{c.appliedDate}</span>
          </div>
        </div>
      )}
    </Draggable>
  )
}

KanbanCard.propTypes = {
  c: PropTypes.shape({
    id:          PropTypes.string.isRequired,
    initials:    PropTypes.string.isRequired,
    name:        PropTypes.string,
    jobTitle:    PropTypes.string,
    match:       PropTypes.number,
    explanation: PropTypes.string,
    appliedDate: PropTypes.string,
  }).isRequired,
  idx:        PropTypes.number.isRequired,
  onSelect:   PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle:   PropTypes.func.isRequired,
}

export default function CandidateReview() {
  const { user } = useAuthStore()

  const [cards,         setCards]         = useState([])
  const [statuses,      setStatuses]      = useState({})
  const [filterJob,     setFilterJob]     = useState('all')
  const [search,        setSearch]        = useState('')
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [selectedCard,  setSelectedCard]  = useState(null)
  const [selectedIds,   setSelectedIds]   = useState(new Set())
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

  // ── Chargement des données réelles ─────────────────────────────────────────
  useEffect(() => { loadCards() }, [user?.id, loadCards])

  // ── Jobs distincts pour le filtre ──────────────────────────────────────────
  const jobs = [...new Map(cards.map(c => [c.jobId, { id: c.jobId, title: c.jobTitle }])).values()]

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const visible = cards.filter(c => {
    const q = search.toLowerCase()
    return (filterJob === 'all' || c.jobId === filterJob) &&
      (q === '' || (c.name?.toLowerCase().includes(q)) || (c.jobTitle?.toLowerCase().includes(q)))
  })

  // ── Organisation par colonne ───────────────────────────────────────────────
  const byColumn = Object.fromEntries(COLUMNS.map(col => [col.id, []]))
  visible.forEach(c => {
    const st = statuses[c.id] ?? c.defaultStatus
    if (byColumn[st]) byColumn[st].push(c)
  })

  // ── Sélection en masse ────────────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const loadCards = useCallback(() => {
    setLoading(true)
    getEmployerApplications()
      .then(dtos => {
        setCards(dtos.map(dto => ({
          id:            dto.id,
          candidateId:   dto.candidateId || dto.jobSeekerId,
          name:          dto.candidateName,
          initials:      initials(dto.candidateName),
          jobTitle:      dto.jobTitle,
          jobId:         dto.jobListingId,
          match:         dto.matchScore,
          explanation:   dto.matchExplanation,
          defaultStatus: dto.status,
          appliedDate:   '',
        })))
      })
      .catch(err => setError(err?.response?.data?.message || 'Impossible de charger les candidatures.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Drag & Drop → PATCH /applications/{id}/status ─────────────────────────
  const onDragEnd = useCallback(({ source, destination, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return
    const newStatus = destination.droppableId
    setStatuses(prev => ({ ...prev, [draggableId]: newStatus }))
    updateApplicationStatus(draggableId, newStatus).catch(() => {
      // Rollback visuel si l'appel échoue
      setStatuses(prev => ({ ...prev, [draggableId]: source.droppableId }))
    })
  }, [])

  return (
    <div className="cr-shell">
      <div className="cr-blob cr-blob--main" />
      <div className="cr-blob cr-blob--accent" />

      <AppNavbar />

      <main className="cr-main cr-main--board">
        <div className="cr-header">
          <h1 className="cr-title">Pipeline des candidatures</h1>
          <p className="cr-subtitle">
            {loading ? 'Chargement…' : `${cards.length} candidat${cards.length !== 1 ? 's' : ''} · glisser-déposer pour changer de statut`}
          </p>
        </div>

        <div className="cr-filters cr-filters--board">
          <div className="cr-filter-wrap">
            <Search size={14} className="cr-filter-icon" />
            <input
              className="cr-select"
              style={{ paddingLeft: 32 }}
              placeholder="Rechercher un candidat…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="cr-filter-wrap">
            <Filter size={13} className="cr-filter-icon" />
            <select className="cr-select" value={filterJob} onChange={e => setFilterJob(e.target.value)}>
              <option value="all">Tous les postes</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <ChevronDown size={13} className="cr-filter-arrow" />
          </div>
          {selectedIds.size > 0 && (
            <button className="cr-bulk-btn" onClick={() => setBulkModalOpen(true)}>
              <ListChecks size={15} />
              Actions en masse ({selectedIds.size})
            </button>
          )}
        </div>

        {loading && (
          <div className="cr-loading">
            <Loader2 size={28} className="cr-loading-icon" />
            <p>Chargement des candidatures…</p>
          </div>
        )}

        {error && !loading && (
          <div className="cr-error">{error}</div>
        )}

        {!loading && !error && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kb-board">
              {COLUMNS.map(col => {
                const colCards = byColumn[col.id] ?? []
                return (
                  <div key={col.id} className="kb-col">
                    <div className="kb-col-header" style={{ borderBottomColor: col.color }}>
                      <span className="kb-col-label" style={{ color: col.color }}>{col.label}</span>
                      <span className="kb-col-count" style={{ background: col.bg, color: col.color }}>{colCards.length}</span>
                    </div>
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`kb-col-body${snapshot.isDraggingOver ? ' kb-col-body--over' : ''}`}
                        >
                          {colCards.map((c, idx) => (
                            <KanbanCard
                              key={c.id}
                              c={c}
                              idx={idx}
                              onSelect={setSelectedCard}
                              isSelected={selectedIds.has(c.id)}
                              onToggle={toggleSelect}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}
      </main>

      {selectedCard && (
        <ReviewPanel card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {bulkModalOpen && (
        <BulkStatusModal
          selectedIds={[...selectedIds]}
          onSuccess={() => {
            setSelectedIds(new Set())
            setBulkModalOpen(false)
            loadCards()
          }}
          onClose={() => setBulkModalOpen(false)}
        />
      )}
    </div>
  )
}
