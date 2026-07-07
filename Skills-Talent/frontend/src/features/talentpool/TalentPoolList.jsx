import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { getTalentPools } from '../../api/TalentPoolApi'
import TalentPoolCreateModal from './TalentPoolCreateModal'
import AppNavbar from '../../components/common/AppNavbar'

export default function TalentPoolList() {
  const navigate = useNavigate()
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadPools()
  }, [])

  const loadPools = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTalentPools()
      setPools(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading talent pools:', err)
      setError('Erreur lors du chargement des viviers')
      setPools([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    loadPools()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <AppNavbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={28} />
              Viviers de talents
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Créez et gérez vos viviers pour constituer des réserves de candidats
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
              backgroundColor: '#c42033', color: '#fff', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(196,32,51,0.2)'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(196,32,51,0.3)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(196,32,51,0.2)'}
          >
            <Plus size={16} /> Créer un vivier
          </button>
        </div>

        {/* Modal */}
        {showCreateForm && (
          <TalentPoolCreateModal
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateSuccess}
          />
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              display: 'inline-block', width: '32px', height: '32px',
              border: '3px solid #ebebeb', borderTop: '3px solid #c42033', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Chargement...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: '16px 20px', borderRadius: '8px', backgroundColor: '#fee',
            border: '1px solid #fcc', color: '#c42033', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pools.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            borderRadius: '12px', background: '#fff'
          }}>
            <Users size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
              Aucun vivier créé
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Commencez par créer votre premier vivier de talents
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                backgroundColor: '#c42033', color: '#fff', border: 'none', cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Créer un vivier
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && pools.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {pools.map(pool => (
              <div
                key={pool.id}
                onClick={() => navigate(`/employer/talent-pools/${pool.id}`)}
                style={{
                  padding: '20px', borderRadius: '12px', background: '#fff',
                  border: '1px solid #ebebeb', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pool.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {pool.description || 'Pas de description'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '13px', color: '#999' }}>
                  <Users size={14} />
                  <span>{pool.totalMembers || 0} membre{pool.totalMembers !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#bbb', borderTop: '1px solid #ebebeb', paddingTop: '12px' }}>
                  Créé le {formatDate(pool.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
