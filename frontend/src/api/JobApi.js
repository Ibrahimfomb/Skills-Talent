import axiosInstance from './AxiosInstance'
import { searchJobs, JOBS, SAVED_JOBS } from '../data/mockData'

export const getJobs = (params = {}) =>
  axiosInstance.get('/jobs', { params }).then(r => r.data).catch(() => searchJobs(params.q, params.location, params))

export const getJobById = (id) =>
  axiosInstance.get(`/jobs/${id}`).then(r => r.data).catch(() => JOBS.find(j => j.id === id) ?? null)

export const searchJobsMock = (query, location, filters) =>
  Promise.resolve(searchJobs(query, location, filters))

export const getSavedJobs = (userId) =>
  axiosInstance.get(`/jobs/saved/${userId}`).then(r => r.data).catch(() => SAVED_JOBS)

export const saveJob = (userId, jobId) =>
  axiosInstance.post('/jobs/save', { userId, jobId }).then(r => r.data).catch(() => ({ saved: true }))

export const unsaveJob = (userId, jobId) =>
  axiosInstance.delete(`/jobs/save/${userId}/${jobId}`).then(r => r.data).catch(() => ({ saved: false }))

export const applyToJob = (jobId, applicationData) =>
  axiosInstance.post(`/jobs/${jobId}/apply`, applicationData).then(r => r.data)

export const getApplications = (userId) =>
  axiosInstance.get(`/applications?userId=${userId}`).then(r => r.data)

export const getInterviews = (userId) =>
  axiosInstance.get(`/interviews?userId=${userId}`).then(r => r.data)
