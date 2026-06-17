import { create } from 'zustand'

// ── Contacts directory (searchable by STELLA & new-conversation modal) ─────────
export const CONTACTS = [
  { id: 'hr-orange',   name: 'Marie Kamga',     role: 'RH · Orange Cameroun',            avatar: '🟠', online: true,  phone: '237699003344', company: 'Orange Cameroun' },
  { id: 'hr-startup',  name: 'Béatrice Enow',   role: 'RH · StartupCMR',                 avatar: '🚀', online: false, phone: '237655004455', company: 'StartupCMR' },
  { id: 'hr-sgc',      name: 'Pierre Mvondo',   role: 'DG · Société Générale Cameroun',  avatar: '🔴', online: true,  phone: '237677001122', company: 'Société Générale Cameroun' },
  { id: 'hr-deloitte', name: 'Sophie Atangana', role: 'DRH · Deloitte Afrique Centrale', avatar: '🔵', online: false, phone: '237699001122', company: 'Deloitte Afrique Centrale' },
  { id: 'hr-mtn',      name: 'Boris Fouda',     role: 'Talent Acquisition · MTN',        avatar: '🟡', online: true,  phone: '237677002233', company: 'MTN Cameroun' },
  { id: 'hr-total',    name: 'Claire Nguema',   role: 'RH · TotalEnergies Cameroun',     avatar: '⚫', online: false, phone: '237655001122', company: 'TotalEnergies Cameroun' },
  { id: 'hr-jumia',    name: 'Roland Tamba',    role: 'RH · Jumia Cameroun',             avatar: '🟢', online: false, phone: '237699005566', company: 'Jumia Cameroun' },
  { id: 'hr-afriland', name: 'Estelle Mballa',  role: 'Recrutement · Afriland First Bank',avatar: '🏦', online: true,  phone: '237677006677', company: 'Afriland First Bank' },
]

const MOCK_CONVERSATIONS = [
  {
    id: 'conv1',
    participants: ['user', 'hr-orange'],
    contact: CONTACTS.find(c => c.id === 'hr-orange'),
    messages: [
      { id: 'm1', from: 'hr-orange', text: 'Bonjour, nous avons bien reçu votre candidature pour le poste de Data Analyst.', time: '2026-06-07T10:15:00', read: true },
      { id: 'm2', from: 'user',      text: 'Bonjour Mme Kamga, merci pour votre retour ! Je suis très intéressé par cette opportunité.', time: '2026-06-07T10:32:00', read: true },
      { id: 'm3', from: 'hr-orange', text: 'Parfait. Seriez-vous disponible pour un entretien téléphonique jeudi à 10h ?', time: '2026-06-07T10:45:00', read: true },
      { id: 'm4', from: 'user',      text: 'Oui tout à fait, jeudi 10h me convient parfaitement.', time: '2026-06-07T11:00:00', read: true },
      { id: 'm5', from: 'hr-orange', text: "Super ! Je vous envoie le lien de connexion par email. À jeudi !", time: '2026-06-07T11:05:00', read: false },
    ],
    unread: 1,
    lastMessage: "Super ! Je vous envoie le lien de connexion par email. À jeudi !",
    lastTime: '2026-06-07T11:05:00',
  },
  {
    id: 'conv2',
    participants: ['user', 'hr-startup'],
    contact: CONTACTS.find(c => c.id === 'hr-startup'),
    messages: [
      { id: 'm6', from: 'hr-startup', text: "Bonjour ! Suite à votre candidature au poste de Développeur React Senior, nous aimerions vous faire passer un test technique.", time: '2026-06-06T14:30:00', read: true },
      { id: 'm7', from: 'user',       text: 'Bonjour Mme Enow, avec plaisir ! Quel est le format du test ?', time: '2026-06-06T15:10:00', read: true },
      { id: 'm8', from: 'hr-startup', text: "C'est un test de 2h en ligne sur une mini-application React. Je vous envoie les détails.", time: '2026-06-06T15:30:00', read: true },
    ],
    unread: 0,
    lastMessage: "C'est un test de 2h en ligne. Je vous envoie les détails.",
    lastTime: '2026-06-06T15:30:00',
  },
]

export const useMessageStore = create((set, get) => ({
  conversations: MOCK_CONVERSATIONS,
  activeConvId:  null,
  totalUnread:   MOCK_CONVERSATIONS.reduce((acc, c) => acc + c.unread, 0),

  setActiveConv: (id) => {
    set({ activeConvId: id })
    if (id) get().markConvRead(id)
  },

  // Create a new conversation (or activate existing one). Returns the conv id.
  startConversation: (contact) => {
    const existing = get().conversations.find(c => c.contact.id === contact.id)
    if (existing) {
      get().setActiveConv(existing.id)
      return existing.id
    }
    const newConv = {
      id: `conv-${Date.now()}`,
      participants: ['user', contact.id],
      contact: { ...contact },
      messages: [],
      unread: 0,
      lastMessage: '',
      lastTime: new Date().toISOString(),
    }
    set(s => ({ conversations: [newConv, ...s.conversations] }))
    get().setActiveConv(newConv.id)
    return newConv.id
  },

  markConvRead: (convId) => set(s => {
    const conv = s.conversations.find(c => c.id === convId)
    if (!conv || conv.unread === 0) return s
    return {
      conversations: s.conversations.map(c =>
        c.id === convId
          ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) }
          : c
      ),
      totalUnread: Math.max(0, s.totalUnread - conv.unread),
    }
  }),

  sendMessage: (convId, text) => {
    const msg = { id: `m-${Date.now()}`, from: 'user', text, time: new Date().toISOString(), read: true }
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: msg.time }
          : c
      ),
    }))
  },

  receiveMessage: (convId, text, fromId) => {
    const msg  = { id: `m-${Date.now()}`, from: fromId, text, time: new Date().toISOString(), read: false }
    const isActive = get().activeConvId === convId
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: msg.time, unread: isActive ? 0 : c.unread + 1 }
          : c
      ),
      totalUnread: isActive ? s.totalUnread : s.totalUnread + 1,
    }))
  },
}))
