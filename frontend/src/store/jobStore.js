import { create } from 'zustand';

export const useJobStore = create((set) => ({
  jobs: [],
  selectedJob: null,
  filters: {
    location: '',
    jobType: '',
    minSalary: '',
  },
  
  setJobs: (jobs) => set({ jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ 
    filters: { location: '', jobType: '', minSalary: '' } 
  }),
}));

export default useJobStore;
