import { useState, useEffect } from 'react'
import { Plus, Zap, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { getRules, createRule, toggleRule } from '../../api/AutomationApi'

const TRIGGER_TYPES = [
  { value: 'STATUS_CHANGED',        label: 'Changement de statut' },
  { value: 'DAYS_WITHOUT_ACTION',   label: 'Jours sans action' },
  { value: 'APPLICATION_RECEIVED',  label: 'Candidature reçue' },
]

const ACTION_TYPES = [
  { value: 'SEND_EMAIL',        label: 'Envoyer un email' },
  { value: 'NOTIFY_CANDIDATE',  label: 'Notifier le candidat' },
  { value: 'CHANGE_STATUS',     label: 'Changer le statut' },
]

const STATUS_OPTIONS = [
  { value: 'SUBMITTED',  label: 'Soumise' },
  { value: 'SCREENING',  label: 'Présélection' },
  { value: 'INTERVIEW',  label: 'Entretien' },
  { value: 'OFFER',      label: 'Offre' },
  { value: 'APPROVED',   label: 'Acceptée' },
  { value: 'REJECTED',   label: 'Rejetée' },
  { value: 'WITHDRAWN',  label: 'Retirée' },
]

const EMPTY_FORM = {
  name: '', triggerType: '', triggerValue: '',
  actionType: '', actionValue: '', targetStatus: '',
}

export default function AutomationRulesPanel() {
  const [rules, setRules] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await getRules()
      setRules(res.data)
    } catch {
      setError('Impossible de charger les règles.')
    }
  }

  const handleToggle = async (id) => {
    setTogglingId(id)
    try {
      const res = await toggleRule(id)
      setRules(prev => prev.map(r => r.id === id ? res.data : r))
    } catch {
      setError('Impossible de modifier la règle.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.triggerType || !form.actionType) return
    setSaving(true)
    setError('')
    try {
      const dto = {
        name: form.name,
        triggerType: form.triggerType,
        triggerValue: form.triggerValue || null,
        actionType: form.actionType,
        actionValue: form.actionValue || null,
        targetStatus: form.targetStatus || null,
      }
      const res = await createRule(dto)
      setRules(prev => [...prev, res.data])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      setError('Impossible de créer la règle.')
    } finally {
      setSaving(false)
    }
  }

  const triggerValueLabel = form.triggerType === 'DAYS_WITHOUT_ACTION'
    ? 'Nombre de jours'
    : form.triggerType === 'STATUS_CHANGED'
      ? 'Statut déclencheur'
      : null

  return (
    <div className="arp-container">
      <div className="arp-header">
        <div className="arp-title-row">
          <Zap size={18} className="arp-icon" />
          <h3 className="arp-title">Règles d'automatisation</h3>
        </div>
        <button className="arp-add-btn" onClick={() => setShowForm(v => !v)}>
          <Plus size={15} /> Nouvelle règle
        </button>
      </div>

      {error && (
        <div className="arp-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {showForm && (
        <form className="arp-form" onSubmit={handleCreate}>
          <div className="arp-form-row">
            <div className="arp-field">
              <label className="arp-field-label">Nom de la règle</label>
              <input
                className="arp-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex : Rejeter après 30 jours"
                required
              />
            </div>
          </div>

          <div className="arp-form-row arp-two-col">
            <div className="arp-field">
              <label className="arp-field-label">Déclencheur</label>
              <select
                className="arp-select"
                value={form.triggerType}
                onChange={e => setForm(f => ({ ...f, triggerType: e.target.value, triggerValue: '' }))}
                required
              >
                <option value="">— Choisir —</option>
                {TRIGGER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {triggerValueLabel && (
              <div className="arp-field">
                <label className="arp-field-label">{triggerValueLabel}</label>
                {form.triggerType === 'STATUS_CHANGED' ? (
                  <select
                    className="arp-select"
                    value={form.triggerValue}
                    onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
                  >
                    <option value="">— Statut —</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="arp-input"
                    type="number"
                    min={1}
                    value={form.triggerValue}
                    onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
                    placeholder="30"
                  />
                )}
              </div>
            )}
          </div>

          <div className="arp-form-row arp-two-col">
            <div className="arp-field">
              <label className="arp-field-label">Action</label>
              <select
                className="arp-select"
                value={form.actionType}
                onChange={e => setForm(f => ({ ...f, actionType: e.target.value, targetStatus: '' }))}
                required
              >
                <option value="">— Choisir —</option>
                {ACTION_TYPES.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {form.actionType === 'CHANGE_STATUS' && (
              <div className="arp-field">
                <label className="arp-field-label">Nouveau statut</label>
                <select
                  className="arp-select"
                  value={form.targetStatus}
                  onChange={e => setForm(f => ({ ...f, targetStatus: e.target.value }))}
                >
                  <option value="">— Statut cible —</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="arp-form-actions">
            <button type="button" className="arp-cancel-btn" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
              Annuler
            </button>
            <button type="submit" className="arp-save-btn" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Créer la règle'}
            </button>
          </div>
        </form>
      )}

      {rules.length === 0 && !showForm ? (
        <p className="arp-empty">Aucune règle configurée. Créez-en une pour automatiser vos actions.</p>
      ) : (
        <ul className="arp-list">
          {rules.map(rule => (
            <li key={rule.id} className={`arp-item ${rule.isActive ? '' : 'arp-item--off'}`}>
              <div className="arp-item-info">
                <span className="arp-item-name">{rule.name}</span>
                <span className="arp-item-meta">
                  {TRIGGER_TYPES.find(t => t.value === rule.triggerType)?.label}
                  {rule.triggerValue ? ` (${rule.triggerValue})` : ''}
                  {' → '}
                  {ACTION_TYPES.find(a => a.value === rule.actionType)?.label}
                </span>
              </div>
              <button
                className="arp-toggle-btn"
                onClick={() => handleToggle(rule.id)}
                disabled={togglingId === rule.id}
                title={rule.isActive ? 'Désactiver' : 'Activer'}
              >
                {rule.isActive
                  ? <ToggleRight size={26} className="arp-toggle-on" />
                  : <ToggleLeft size={26} className="arp-toggle-off" />
                }
              </button>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .arp-container {
          background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px; padding: 20px;
        }
        .arp-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .arp-title-row { display: flex; align-items: center; gap: 8px; }
        .arp-icon { color: var(--color-primary, #6366f1); }
        .arp-title { font-size: 1rem; font-weight: 600; margin: 0; }
        .arp-add-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border: none; border-radius: 8px;
          background: var(--color-primary, #6366f1); color: #fff;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
        }
        .arp-error {
          display: flex; align-items: center; gap: 6px;
          color: #c0392b; font-size: 0.85rem; margin-bottom: 12px;
        }
        .arp-form {
          background: var(--color-surface-alt, #f8f9fa);
          border-radius: 10px; padding: 16px; margin-bottom: 16px;
          border: 1px solid var(--color-border, #e5e7eb);
        }
        .arp-form-row { margin-bottom: 12px; }
        .arp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .arp-field { display: flex; flex-direction: column; gap: 4px; }
        .arp-field-label { font-size: 0.8rem; font-weight: 500; color: var(--color-text-muted, #666); }
        .arp-input, .arp-select {
          padding: 9px 12px; border: 1.5px solid #ddd; border-radius: 8px;
          font-size: 0.9rem; background: var(--color-surface, #fff);
          color: var(--color-text, #222); box-sizing: border-box; width: 100%;
        }
        .arp-input:focus, .arp-select:focus {
          border-color: var(--color-primary, #6366f1); outline: none;
        }
        .arp-form-actions {
          display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;
        }
        .arp-cancel-btn {
          padding: 8px 16px; border: 1.5px solid #ddd; border-radius: 8px;
          background: none; cursor: pointer; font-size: 0.875rem;
        }
        .arp-save-btn {
          padding: 8px 16px; border: none; border-radius: 8px;
          background: var(--color-primary, #6366f1); color: #fff;
          cursor: pointer; font-size: 0.875rem; font-weight: 500;
        }
        .arp-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .arp-empty {
          font-size: 0.875rem; color: var(--color-text-muted, #888);
          text-align: center; padding: 24px 0;
        }
        .arp-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .arp-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 10px; transition: opacity 0.2s;
        }
        .arp-item--off { opacity: 0.5; }
        .arp-item-info { display: flex; flex-direction: column; gap: 2px; }
        .arp-item-name { font-size: 0.9rem; font-weight: 500; color: var(--color-text, #222); }
        .arp-item-meta { font-size: 0.8rem; color: var(--color-text-muted, #888); }
        .arp-toggle-btn {
          background: none; border: none; cursor: pointer; padding: 0; line-height: 0;
        }
        .arp-toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .arp-toggle-on { color: var(--color-primary, #6366f1); }
        .arp-toggle-off { color: var(--color-text-muted, #aaa); }
      `}</style>
    </div>
  )
}
