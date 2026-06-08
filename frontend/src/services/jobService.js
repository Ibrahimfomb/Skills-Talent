import axiosInstance from '../api/AxiosInstance';

export const jobService = {
  getAllJobs: () => axiosInstance.get('/jobs'),
  searchJobs: (location) => axiosInstance.get('/jobs/search', { params: { location } }),
  getJobById: (jobId) => axiosInstance.get(`/jobs/${jobId}`),
  getCompanyJobs: (companyId) => axiosInstance.get(`/jobs/company/${companyId}`),
  createJob: (jobData) => axiosInstance.post('/jobs', jobData),
  updateJob: (jobId, jobData) => axiosInstance.put(`/jobs/${jobId}`, jobData),
};

export default jobService;
