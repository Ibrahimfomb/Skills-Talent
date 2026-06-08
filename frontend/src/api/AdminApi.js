import axiosInstance from './AxiosInstance'

export const getAdminStats = () =>
  axiosInstance.get('/admin/stats').then(r => r.data)

export const getAdminUsers = (search = '') =>
  axiosInstance.get('/admin/users', { params: search ? { search } : {} }).then(r => r.data)

export const toggleUserStatus = (userId) =>
  axiosInstance.put(`/admin/users/${userId}/status`).then(r => r.data)
