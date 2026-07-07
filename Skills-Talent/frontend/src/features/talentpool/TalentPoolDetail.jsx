import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import {
  getPoolMembers, removeCandidateFromPool, updateMemberStatus, getRecommendedCandidates
} from '../../api/TalentPoolApi'
import AppNavbar from '../../components/common/AppNavbar'

const STATUS_COLORS = {
  ACTIVE: '#4caf50',
  CONTACTED: '#ff9800',
  HIRED: '#2196f3',
  REJECTED: '#f44336'
}

export default function TalentPoolDetail() {
  const { poolId } = useParams()
  const navigate = useNavigate()

  const [pool, setPool] = useState(null)
  const [members, setMembers] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [recommendedCandidates, setRecommendedCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPoolData()
  }, [poolId])

  useEffect(() => {
    loadMembers()
  }, [poolId, page])

  const loadPoolData = async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: fetch pool data from API
      setPool({ id: poolId, name: 'Vivier Example', description: 'Description' })
    } catch (err) {
      console.error('Error loading pool:', err)
      setError('Erreur lors du chargement du vivier')
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const data = await getPoolMembers(poolId, page, 20)
      setMembers(Array.isArray(data?.content) ? data.content : [])
      setTotalPages(data?.totalPages || 1)
    } catch (err) {
      console.error('Error loading members:', err)
    }
  }

  const handleRemoveMember = async (candidateId) => {
    try {
      await removeCandidateFromPool(poolId, candidateId)
      loadMembers()
    } catch (err) {
      console.error('Error removing member:', err)
    }
  }

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await updateMemberStatus(poolId, candidateId, newStatus)
      loadMembers()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const loadRecommendations = async () => {
    try {
      const data = await getRecommendedCandidates(poolId)
      setRecommendedCandidates(Array.isArray(data) ? data : [])
      setShowRecommendations(true)
    } catch (err) {
      console.error('Error loading recommendations:', err)
    }
  }

  const countByStatus = (status) => {
    return members.filter(m => m.status === status).length
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <AppNavbar />
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            display: 'inline-block', width: '32px', height: '32px',
            border: '3px solid #ebebeb', borderTop: '3px solid #c42033', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (error || !pool) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <AppNavbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <button
            onClick={() => navigate('/employer/talent-pools')}
            style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' }}
          >
            <ChevronLeft size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Retour
          </button>
          <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#fee', border: '1px solid #fcc', color: '#c42033' }}>
            {error || 'Vivier non trouvé'}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <AppNavbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/employer/talent-pools')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px',
            cursor: 'pointer', color: '#666', fontSize: '14px', marginBottom: '24px'
          }}
        >
          <ChevronLeft size={16} /> Retour aux viviers
        </button>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0' }}>
            {pool.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            {pool.description}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total', value: members.length, color: '#666' },
            { label: 'Actifs', value: countByStatus('ACTIVE'), color: '#4caf50' },
            { label: 'Contactés', value: countByStatus('CONTACTED'), color: '#ff9800' },
            { label: 'Embauchés', value: countByStatus('HIRED'), color: '#2196f3' }
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '20px', borderRadius: '8px', background: '#fff', border: '1px solid #ebebeb'
            }}>
              <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>{stat.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: stat.color, margin: 0 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Members Table */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #ebebeb', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ebebeb', background: '#fafafa' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Nom</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Titre</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Score</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Notes</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#666' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 16px', textAlign: 'center', color: '#999' }}>
                      Aucun candidat dans ce vivier
                    </td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {member.avatar && (
                            <img src={member.avatar} alt={member.name} style={{
                              width: '32px', height: '32px', borderRadius: '50%', background: '#ebebeb'
                            }} />
                          )}
                          <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{member.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{member.title || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{member.score ? `${member.score}%` : '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#666', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.notes || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={member.status || 'ACTIVE'}
                          onChange={(e) => handleStatusChange(member.id, e.target.value)}
                          style={{
                            padding: '6px 8px', borderRadius: '4px', border: `1.5px solid ${STATUS_COLORS[member.status] || '#ccc'}`,
                            background: '#fff', color: STATUS_COLORS[member.status] || '#666',
                            fontSize: '12px', fontWeight: 500, cursor: 'pointer'
                          }}
                        >
                          <option value="ACTIVE">Actif</option>
                          <option value="CONTACTED">Contacté</option>
                          <option value="HIRED">Embauché</option>
                          <option value="REJECTED">Rejeté</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          style={{
                            padding: '6px 8px', borderRadius: '4px', border: '1px solid #fee',
                            background: '#fff', color: '#c42033', cursor: 'pointer', fontSize: '12px'
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff',
                cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <span style={{ fontSize: '13px', color: '#666' }}>
              Page {page + 1} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Recommendations Button */}
        <button
          onClick={loadRecommendations}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
            backgroundColor: '#fff', color: '#c42033', border: '1.5px solid #c42033',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fff5f7'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#fff'
          }}
        >
          <Sparkles size={16} /> Voir les recommandations
        </button>

        {/* Recommendations Section */}
        {showRecommendations && (
          <div style={{ marginTop: '40px', padding: '20px', borderRadius: '8px', background: '#fff', border: '1px solid #ebebeb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px 0' }}>
              Candidats recommandés
            </h3>
            {recommendedCandidates.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Aucun candidat recommandé pour le moment</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {recommendedCandidates.map(candidate => (
                  <div key={candidate.id} style={{
                    padding: '16px', borderRadius: '8px', background: '#f5f5f5', textAlign: 'center'
                  }}>
                    {candidate.avatar && (
                      <img src={candidate.avatar} alt={candidate.name} style={{
                        width: '48px', height: '48px', borderRadius: '50%', marginBottom: '8px', background: '#ddd'
                      }} />
                    )}
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px 0' }}>
                      {candidate.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>
                      {candidate.score ? `Score: ${candidate.score}%` : 'N/A'}
                    </p>
                    <button
                      style={{
                        padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: '#c42033', color: '#fff', border: 'none', cursor: 'pointer'
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
