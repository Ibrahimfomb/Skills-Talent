import axiosInstance from './AxiosInstance'

export const loginUser = (credentials) =>
  axiosInstance.post('/auth/login', credentials).then((r) => r.data)

export const registerUser = (userData) =>
  axiosInstance.post('/auth/register', userData).then((r) => r.data)

export const getProfile = (userId) =>
  axiosInstance.get(`/auth/profile/${userId}`).then((r) => r.data)

export const updateProfile = (userId, data) =>
  axiosInstance.put(`/auth/profile/${userId}`, data).then((r) => r.data)
