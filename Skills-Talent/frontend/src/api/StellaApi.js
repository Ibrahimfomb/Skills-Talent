import axiosInstance from './AxiosInstance'
import { STELLA_RESPONSES, searchJobs, COMPANIES } from '../data/mockData'
import { CONTACTS } from '../store/MessageStore'
import { getRecommendedJobs, estimateProfileSalary } from '../utils/matchingUtils'

// ─── Online check ─────────────────────────────────────────────────────────────
export const isOnline = () => navigator.onLine

// ─── Internet search via DuckDuckGo (backend proxy) ──────────────────────────
export async function webSearch(query) {
  if (!isOnline()) return null
  try {
    const res = await axiosInstance.get('/stella/search', { params: { q: query }, timeout: 6000 })
    return res.data
  } catch {
    return null
  }
}

// ─── Global app search (jobs + companies + contacts) ─────────────────────────
export function appSearch(query) {
  const q = query.toLowerCase()
  const jobs      = searchJobs(q, '', {}).slice(0, 4)
  const companies = COMPANIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
  ).slice(0, 3)
  const contacts  = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.company.toLowerCase().includes(q) ||
    c.role.toLowerCase().includes(q)
  ).slice(0, 3)
  return { jobs, companies, contacts }
}

// ─── Contact intent detection ─────────────────────────────────────────────────
function detectContactIntent(message) {
  const m = message.toLowerCase()

  const isContactIntent =
    m.match(/contact|message|écri|envoie|whatsapp|mettre en contact|parler à|parler avec/) !== null

  if (!isContactIntent) return null

  // Try to match a known contact by name or company
  const matched = CONTACTS.find(c =>
    m.includes(c.name.toLowerCase()) ||
    m.includes(c.company.toLowerCase())
  )

  const isWhatsApp = m.match(/whatsapp|wa\.me|sms|texto/) !== null

  if (matched && isWhatsApp) {
    return { type: 'whatsapp', contact: matched }
  }
  if (matched) {
    return { type: 'start_conversation', contact: matched }
  }

  // No specific contact found — ask which one
  if (isContactIntent) {
    return { type: 'list_contacts' }
  }

  return null
}

// ─── Main chat with STELLA ────────────────────────────────────────────────────
export async function stellaChat(message, { history = [], profile = null, online = true } = {}) {
  // Check contact/WhatsApp intent locally first
  const intent = detectContactIntent(message)
  if (intent) {
    const localResult = buildContactIntentReply(intent)
    return { ...localResult, source: 'local' }
  }

  // Try backend
  try {
    const res = await axiosInstance.post('/stella/chat', {
      message,
      history: history.slice(-6),
      profile,
      online,
    }, { timeout: 8000 })
    return { text: res.data.reply, source: 'backend' }
  } catch {
    return { text: generateLocalReply(message, { profile, online }), source: 'local' }
  }
}

// ─── Build reply for contact/WhatsApp intents ─────────────────────────────────
function buildContactIntentReply(intent) {
  if (intent.type === 'whatsapp') {
    const { contact } = intent
    const waText = encodeURIComponent(
      `Bonjour ${contact.name}, je vous contacte via SkillSet concernant une opportunité professionnelle.`
    )
    const waUrl = `https://wa.me/${contact.phone}?text=${waText}`
    return {
      text: `Je vais vous mettre en contact avec **${contact.name}** (${contact.role}) sur WhatsApp.\n\nCliquez sur le bouton ci-dessous pour ouvrir WhatsApp avec un message pré-rempli :`,
      action: { type: 'whatsapp', contact, url: waUrl },
    }
  }

  if (intent.type === 'start_conversation') {
    const { contact } = intent
    return {
      text: `Je vais ouvrir une conversation avec **${contact.name}** (${contact.role}). Cliquez ci-dessous pour accéder à la messagerie :`,
      action: { type: 'start_conversation', contact },
    }
  }

  // list_contacts
  const list = CONTACTS.map(c => `• ${c.avatar} **${c.name}** — ${c.role}`).join('\n')
  return {
    text: `Voici les contacts disponibles :\n\n${list}\n\nDites-moi avec qui vous souhaitez entrer en contact, ou si vous voulez leur envoyer un message WhatsApp.`,
    action: null,
  }
}

// ─── Autonomous tasks ─────────────────────────────────────────────────────────
export async function runStellaTask(taskId, profile) {
  switch (taskId) {

    case 'find-best': {
      const jobs = getRecommendedJobs(profile, 3)
      if (jobs.length === 0) return "Je n'ai pas trouvé d'offres correspondant à votre profil. Complétez votre profil pour de meilleures recommandations."
      const list = jobs.map((j, i) => `${i + 1}. **${j.title}** — ${j.company} (${j.matchPct}% de correspondance) · ${fmtSalary(j.salary)}`).join('\n')
      return `🎯 Top ${jobs.length} offres pour votre profil :\n\n${list}\n\nSouhaitez-vous que je postule à l'une d'elles ?`
    }

    case 'salary-analysis': {
      const est = estimateProfileSalary(profile)
      return `💰 Estimation de salaire pour **${profile?.jobTitle || 'votre poste'}** :\n\n• Minimum : ${fmt(est.min)} ${est.currency}\n• Médiane : ${fmt(est.median)} ${est.currency}\n• Maximum : ${fmt(est.max)} ${est.currency}\n\n_Confiance : ${est.confidence} · Basé sur les offres du marché camerounais._`
    }

    case 'apply-top': {
      const jobs = getRecommendedJobs(profile, 1)
      if (jobs.length === 0) return "Aucune offre trouvée pour postuler automatiquement."
      await new Promise(r => setTimeout(r, 1500))
      return `✅ J'ai soumis votre candidature pour **${jobs[0].title}** chez ${jobs[0].company} !\n\nVotre CV et lettre de motivation générés par IA ont été envoyés. Vous pouvez suivre cette candidature dans **Mes emplois > Candidatures**.`
    }

    case 'profile-analysis': {
      const skills  = profile?.skills || []
      const missing = ['LinkedIn', 'Portfolio', 'Lettre de motivation', 'Photo professionnelle']
        .filter(() => Math.random() > 0.5)
      const score   = 65 + Math.floor(Math.random() * 25)
      return `📊 Analyse de votre profil (score : **${score}/100**) :\n\n✅ Points forts : ${skills.slice(0, 3).join(', ') || 'À compléter'}\n⚠️ À améliorer : ${missing.join(', ') || 'Profil complet !'}\n\n💡 Conseil STELLA : Ajoutez vos certifications pour augmenter votre visibilité de 30%.`
    }

    case 'prepare-interview': {
      const jobs    = getRecommendedJobs(profile, 1)
      const company = jobs[0]?.company || "l'entreprise"
      return `🎯 Préparation d'entretien pour ${company} :\n\n**Questions fréquentes :**\n1. Parlez-moi de vous\n2. Pourquoi ${company} ?\n3. Votre plus grande réussite ?\n4. Où vous voyez-vous dans 5 ans ?\n\n**Méthode STAR** (Situation, Tâche, Action, Résultat) pour structurer vos réponses.\n\n💡 Je peux faire une simulation d'entretien avec vous. Dites "Simule un entretien" !`
    }

    default:
      return "Tâche non reconnue. Essayez : trouver des offres, analyser mon profil, estimer mon salaire."
  }
}

// ─── Local reply generator ────────────────────────────────────────────────────
function generateLocalReply(message, { profile, online }) {
  const m = message.toLowerCase()

  if (!online && m.match(/internet|web|cherche/)) {
    return "⚠️ Vous n'êtes pas connecté(e) à internet. Je ne peux pas effectuer de recherches en ligne pour le moment.\n\nJe peux néanmoins vous aider avec les données SkillSet disponibles hors ligne. Que souhaitez-vous ?"
  }

  if (m.match(/salut|bonjour|hello|bjr|bonsoir/)) return replyGreeting(profile)
  if (m.match(/salaire|rémunér|paye|combien gagn/)) return replySalaire(message, profile)
  if (m.match(/offre|emploi|job|travail|poste/))   return replyOffres(profile)
  if (m.match(/entreprise|company|avis|culture/))  return replyEntreprise(m)
  if (m.match(/entretien|interview|prépare/))       return STELLA_RESPONSES.entretien
  if (m.match(/cv|curriculum|candidature/))         return STELLA_RESPONSES.cv
  if (m.match(/aide|help|que peux|que sais/))       return STELLA_RESPONSES.aide
  if (m.match(/merci|super|top|parfait/))           return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions."

  return online
    ? `Je vais chercher des informations sur "${message}"...\n\n_Résultats issus de SkillSet & internet_`
    : STELLA_RESPONSES.fallback
}

function replyGreeting(profile) {
  const name = profile?.firstName ? `, ${profile.firstName}` : ''
  return `Bonjour${name} ! Je suis **STELLA**, votre assistante IA SkillSet 🌟\nComment puis-je vous aider aujourd'hui ?\n\n💡 Je peux chercher des offres, estimer votre salaire, préparer votre entretien, analyser votre profil ou vous mettre en contact avec un recruteur.`
}

function replySalaire(message, profile) {
  if (profile?.jobTitle) {
    const est = estimateProfileSalary(profile)
    return `💰 Pour un **${profile.jobTitle}**, voici les fourchettes actuelles :\n\n• Min : ${fmt(est.min)} FCFA\n• Médiane : ${fmt(est.median)} FCFA\n• Max : ${fmt(est.max)} FCFA\n\n_Basé sur les offres SkillSet · Confiance : ${est.confidence}_`
  }
  const m = message.toLowerCase()
  const titleMatch = m.match(/(?:quel.*salaire|combien.*gagne).*(?:pour |un |une )(.+?)(?:\s+à|\s+en|\s*$)/i)
  if (titleMatch) {
    const est = estimateProfileSalary({ jobTitle: titleMatch[1], yearsOfExperience: 3 })
    return `💰 Estimation pour **${titleMatch[1]}** :\n\n• Min : ${fmt(est.min)} FCFA\n• Médiane : ${fmt(est.median)} FCFA\n• Max : ${fmt(est.max)} FCFA`
  }
  return STELLA_RESPONSES.salaire
}

function replyOffres(profile) {
  if (profile) {
    const jobs = getRecommendedJobs(profile, 3)
    if (jobs.length > 0) {
      const list = jobs.map(j => `• **${j.title}** — ${j.company} (${j.matchPct}%)`).join('\n')
      return `🎯 Offres correspondant à votre profil :\n\n${list}\n\nConsultez la page **Offres** pour postuler !`
    }
  }
  return STELLA_RESPONSES.emploi
}

function replyEntreprise(m) {
  const company = COMPANIES.find(c => m.includes(c.name.toLowerCase()))
  if (company) {
    return `🏢 **${company.name}** — ${company.sector}\n⭐ Note : ${company.rating}/5 (${company.reviewCount} avis)\n📍 ${company.city}, ${company.country}\n\n_"${company.reviews[0]?.body}"_`
  }
  const top = [...COMPANIES].sort((a, b) => b.rating - a.rating).slice(0, 3)
  const lines = top.map(c => '• **' + c.name + '** ⭐ ' + c.rating + '/5').join('\n')
  return `🏆 Top entreprises SkillSet :\n${lines}`
}

function fmt(n) { return n.toLocaleString('fr-FR') }
function fmtSalary(s) { return `${(s.min / 1000).toFixed(0)}k–${(s.max / 1000).toFixed(0)}k ${s.currency}` }
