import axiosInstance from './AxiosInstance'

// Google Calendar Integration
export const getGoogleAuthUrl = () =>
  axiosInstance.get('/integrations/google/auth').then(r => r.data)

export const getGoogleStatus = () =>
  axiosInstance.get('/integrations/google/status').then(r => r.data)

export const disconnectGoogle = () =>
  axiosInstance.delete('/integrations/google').then(r => r.data)

export const confirmGoogleAuth = (code) =>
  axiosInstance.post('/integrations/google/callback', { code }).then(r => r.data)

// France Travail Integration
export const publishToFranceTravail = (jobId) =>
  axiosInstance.post(`/jobboards/france-travail/publish/${jobId}`).then(r => r.data)

export const unpublishFromFranceTravail = (jobId) =>
  axiosInstance.delete(`/jobboards/france-travail/unpublish/${jobId}`).then(r => r.data)

export const getFranceTravailStatus = (jobId) =>
  axiosInstance.get(`/jobboards/france-travail/status/${jobId}`).then(r => r.data)

export const testFranceTravailConnection = (clientId, clientSecret) =>
  axiosInstance.post('/jobboards/france-travail/test', { clientId, clientSecret }).then(r => r.data)
