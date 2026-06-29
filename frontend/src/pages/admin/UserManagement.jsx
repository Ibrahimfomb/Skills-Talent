import { useEffect, useState, useCallback } from 'react'
import { Search, Users, UserCheck, UserX, Briefcase, ChevronDown } from 'lucide-react'
import { getAdminUsers, toggleUserStatus } from '../../api/AdminApi'
import './UserManagement.css'

const ROLE_LABELS = { CANDIDATE: 'Candidat', EMPLOYER: 'Employeur', ADMIN: 'Admin' }
const ROLE_OPTIONS = ['', 'CANDIDATE', 'EMPLOYER', 'ADMIN']

export default function UserManagement() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [search, setSearch]         = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [toggling, setToggling]     = useState({})

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getAdminUsers(search)
      .then(setUsers)
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleToggle = async (userId) => {
    setToggling(t => ({ ...t, [userId]: true }))
    try {
      await toggleUserStatus(userId)
      setUsers(us => us.map(u =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      ))
    } catch {
      setError('Erreur lors du changement de statut.')
    } finally {
      setToggling(t => ({ ...t, [userId]: false }))
    }
  }

  const visible = filterRole
    ? users.filter(u => u.role === filterRole)
    : users

  const counts = { total: users.length, active: 0, inactive: 0, CANDIDATE: 0, EMPLOYER: 0, ADMIN: 0 }
  users.forEach(u => {
    if (u.status === 'ACTIVE') counts.active++; else counts.inactive++
    if (counts[u.role] !== undefined) counts[u.role]++
  })

  return (
    <div className="um-shell">
      <div className="um-header">
        <h1 className="um-title">Gestion des utilisateurs</h1>
        <p className="um-sub">Consultez, filtrez et modifiez le statut des comptes inscrits.</p>
      </div>

      <div className="um-kpis">
        <div className="um-kpi um-kpi--total">
          <Users size={20} />
          <div>
            <p className="um-kpi-val">{counts.total}</p>
            <p className="um-kpi-label">Total</p>
          </div>
        </div>
        <div className="um-kpi um-kpi--active">
          <UserCheck size={20} />
          <div>
            <p className="um-kpi-val">{counts.active}</p>
            <p className="um-kpi-label">Actifs</p>
          </div>
        </div>
        <div className="um-kpi um-kpi--inactive">
          <UserX size={20} />
          <div>
            <p className="um-kpi-val">{counts.inactive}</p>
            <p className="um-kpi-label">Inactifs</p>
          </div>
        </div>
        <div className="um-kpi um-kpi--employer">
          <Briefcase size={20} />
          <div>
            <p className="um-kpi-val">{counts.EMPLOYER}</p>
            <p className="um-kpi-label">Employeurs</p>
          </div>
        </div>
      </div>

      <div className="um-toolbar">
        <div className="um-search-wrap">
          <Search size={15} className="um-search-icon" />
          <input
            className="um-search"
            placeholder="Nom, prénom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="um-filter-wrap">
          <select
            className="um-filter"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{r ? ROLE_LABELS[r] ?? r : 'Tous les rôles'}</option>
            ))}
          </select>
          <ChevronDown size={14} className="um-filter-arrow" />
        </div>
      </div>

      {error && <p className="um-error">{error}</p>}

      {loading ? (
        <div className="um-loading">Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="um-empty">
          <Users size={40} color="#d4d2d0" />
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(user => (
                <tr key={user.id}>
                  <td className="um-td-name">{user.name}</td>
                  <td className="um-td-email">{user.email}</td>
                  <td>
                    <span className={`um-role um-role--${user.role?.toLowerCase()}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`um-badge ${user.status === 'ACTIVE' ? 'um-badge--active' : 'um-badge--inactive'}`}>
                      {user.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="um-td-date">{user.joinedAt}</td>
                  <td>
                    <button
                      className={`um-toggle-btn ${user.status === 'ACTIVE' ? 'um-toggle-btn--deactivate' : 'um-toggle-btn--activate'}`}
                      disabled={toggling[user.id] || user.role === 'ADMIN'}
                      onClick={() => handleToggle(user.id)}
                      title={user.role === 'ADMIN' ? 'Les admins ne peuvent pas être désactivés ici' : ''}
                    >
                      {toggling[user.id]
                        ? '…'
                        : user.status === 'ACTIVE' ? 'Désactiver' : 'Activer'
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="um-count">{visible.length} utilisateur{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''}</div>
        </div>
      )}
    </div>
  )
}
