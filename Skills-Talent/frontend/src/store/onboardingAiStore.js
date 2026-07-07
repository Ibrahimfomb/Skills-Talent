import { create } from 'zustand'
import axiosInstance from '../api/AxiosInstance'
import { getContextFromAnswers } from '../data/contextualData'

/**
 * Store Zustand pour gérer l'état complet de l'onboarding IA.
 * Contexte cumulatif mis à jour à chaque réponse.
 */
export const useOnboardingAiStore = create((set, get) => ({
  // ─── STATE ───
  currentQuestion: null,
  previousAnswers: [], // Array<{fieldKey, question, answer, phase}>
  currentPhase: 'INTRO',
  questionIndex: 0,
  jobTitle: '',
  userRole: '', // 'CANDIDATE' ou 'EMPLOYER'
  isLoading: false,
  isComplete: false,
  cvUrl: null,
  error: null,

  // Contexte cumulatif — mis à jour après chaque réponse
  context: {
    country: null,
    currency: 'EUR',
    currencySymbol: '€',
    salaryPeriod: 'annuel',
    phonePrefix: '',
    availableCities: [],
    salaryRanges: [],
    contractTypes: [],
    workModes: [],
    languages: [],
    cvFormat: { withPhoto: false, withPersonalDetails: false, rgpdStrict: false },
    answeredFields: [],
  },

  // ─── ACTIONS ───

  setJobTitle: (title) => set({ jobTitle: title }),
  setUserRole: (role) => set({ userRole: role }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  /**
   * Soumet une réponse et demande la question suivante.
   * Logique cascadante:
   * 1. Crée le DTO de réponse antérieure
   * 2. Ajoute à previousAnswers
   * 3. Reconstruit le contexte local (villes filtrées, salaires, etc.)
   * 4. Si dernière question → marquer complet
   * 5. Sinon → appeler API pour question suivante
   */
  submitAnswer: async (answer) => {
    const state = get()

    if (!state.currentQuestion) {
      console.warn('Aucune question en cours')
      return
    }

    // 1. Créer DTO réponse antérieure
    const newAnswer = {
      fieldKey: state.currentQuestion.fieldKey,
      question: state.currentQuestion.question,
      answer,
      phase: state.currentPhase,
    }

    // 2. Ajouter à previousAnswers
    const newAnswers = [...state.previousAnswers, newAnswer]

    // 3. Reconstruire contexte local (villes, salaires filtrés, etc.)
    const newContext = getContextFromAnswers(newAnswers)

    set({
      previousAnswers: newAnswers,
      context: newContext,
    })

    // 4. Vérifier si dernière question
    if (state.currentQuestion.isLastQuestion) {
      set({ isComplete: true })
      return
    }

    // 5. Appeler API pour question suivante
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.post('/onboarding/next-question', {
        userRole: state.userRole,
        jobTitle: state.jobTitle,
        currentPhase: state.currentQuestion.nextPhase || state.currentPhase,
        previousAnswers: newAnswers,
        questionIndex: state.questionIndex + 1,
      })

      const nextQuestion = response.data
      set({
        currentQuestion: nextQuestion,
        currentPhase: nextQuestion.nextPhase || state.currentPhase,
        questionIndex: state.questionIndex + 1,
        isLoading: false,
      })
    } catch (err) {
      console.error('Erreur API question suivante:', err)
      set({ error: err.message || 'Erreur génération question', isLoading: false })
    }
  },

  /**
   * Génère le CV depuis les réponses.
   * Appelé quand isComplete = true et rôle = CANDIDATE.
   */
  generateCv: async () => {
    const state = get()
    set({ isLoading: true, error: null })

    try {
      const response = await axiosInstance.post('/onboarding/generate-cv', {
        jobTitle: state.jobTitle,
        answers: state.previousAnswers,
      })

      const cvData = response.data
      set({
        cvUrl: cvData.cvUrl,
        isLoading: false,
      })

      return cvData.cvUrl
    } catch (err) {
      console.error('Erreur API CV:', err)
      set({ error: err.message || 'Erreur génération CV', isLoading: false })
      return null
    }
  },

  /**
   * Charge le contexte initial depuis le serveur.
   * Utile pour reconstruire l'état après rechargement.
   */
  loadContext: async (answers) => {
    try {
      const response = await axiosInstance.post('/onboarding/context', { answers })
      const context = response.data
      set({ context })
      return context
    } catch (err) {
      console.error('Erreur API contexte:', err)
      return null
    }
  },

  /**
   * Initialise l'onboarding avec la première question.
   */
  initializeOnboarding: async (userRole, jobTitle) => {
    set({
      userRole,
      jobTitle,
      currentQuestion: null,
      previousAnswers: [],
      currentPhase: 'INTRO',
      questionIndex: 0,
      isComplete: false,
      isLoading: true,
      error: null,
    })

    try {
      const response = await axiosInstance.post('/onboarding/next-question', {
        userRole,
        jobTitle,
        currentPhase: 'INTRO',
        previousAnswers: [],
        questionIndex: 0,
      })

      const firstQuestion = response.data
      set({
        currentQuestion: firstQuestion,
        currentPhase: firstQuestion.nextPhase || 'INTRO',
        isLoading: false,
      })
    } catch (err) {
      console.error('Erreur initialisation:', err)
      set({ error: err.message || 'Erreur initialisation onboarding', isLoading: false })
    }
  },

  /**
   * Réinitialise le store à l'état initial.
   */
  resetOnboarding: () => set({
    currentQuestion: null,
    previousAnswers: [],
    currentPhase: 'INTRO',
    questionIndex: 0,
    jobTitle: '',
    userRole: '',
    isLoading: false,
    isComplete: false,
    cvUrl: null,
    error: null,
    context: {
      country: null,
      currency: 'EUR',
      currencySymbol: '€',
      salaryPeriod: 'annuel',
      phonePrefix: '',
      availableCities: [],
      salaryRanges: [],
      contractTypes: [],
      workModes: [],
      languages: [],
      cvFormat: { withPhoto: false, withPersonalDetails: false, rgpdStrict: false },
      answeredFields: [],
    },
  }),
}))
