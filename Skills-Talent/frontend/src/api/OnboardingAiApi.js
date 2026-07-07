import axiosInstance from './AxiosInstance'

/**
 * API wrapper pour les endpoints d'onboarding IA
 */

/**
 * Demande la question suivante dans le flux onboarding.
 * POST /api/onboarding/next-question
 */
export const getNextQuestion = (payload) => {
  return axiosInstance.post('/onboarding/next-question', payload)
}

/**
 * Génère le CV depuis les réponses d'onboarding.
 * POST /api/onboarding/generate-cv
 */
export const generateCv = (payload) => {
  return axiosInstance.post('/onboarding/generate-cv', payload)
}

/**
 * Récupère le statut d'onboarding (complété ?, URL CV ?).
 * GET /api/onboarding/status
 */
export const getOnboardingStatus = () => {
  return axiosInstance.get('/onboarding/status')
}

/**
 * Récupère le contexte cumulatif (villes, salaires, etc. filtrés par pays).
 * POST /api/onboarding/context
 */
export const getContext = (answers) => {
  return axiosInstance.post('/onboarding/context', { answers })
}

/**
 * Extrait et sauvegarde les filtres de profil depuis les réponses.
 * POST /api/onboarding/extract-filters
 */
export const extractProfileFilters = (userRole, answers) => {
  return axiosInstance.post('/onboarding/extract-filters', {
    userRole,
    answers,
  })
}
