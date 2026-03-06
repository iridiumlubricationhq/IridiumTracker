
export interface Job {
  id: string;
  plate_number: string;
  car_model: string;
  service_type: string;
  estimated_completion: string;
  status: number;
  created_at: string;
  updated_at: string;
}

const JOBS_KEY = 'iridium_jobs';
const AUTH_KEY = 'iridium_auth';

export const storage = {
  // Auth
  login: (username: string, password: string): string | null => {
    // Simple mock auth
    if (username === 'admin' && password === 'admin123') {
      const token = btoa(JSON.stringify({ username, exp: Date.now() + 86400000 }));
      localStorage.setItem(AUTH_KEY, token);
      return token;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getToken: () => {
    return localStorage.getItem(AUTH_KEY);
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  },

  // Jobs
  getJobs: (): Job[] => {
    const jobs = localStorage.getItem(JOBS_KEY);
    return jobs ? JSON.parse(jobs) : [];
  },

  getJobById: (id: string): Job | null => {
    const jobs = storage.getJobs();
    return jobs.find(j => j.id === id) || null;
  },

  createJob: (data: Omit<Job, 'id' | 'status' | 'created_at' | 'updated_at'>): Job => {
    const jobs = storage.getJobs();
    const newJob: Job = {
      ...data,
      id: Math.random().toString(36).substring(2, 15),
      status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    return newJob;
  },

  updateJobStatus: (id: string, status: number): Job | null => {
    const jobs = storage.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index].status = status;
      jobs[index].updated_at = new Date().toISOString();
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
      return jobs[index];
    }
    return null;
  },

  deleteJob: (id: string): boolean => {
    const jobs = storage.getJobs();
    const filtered = jobs.filter(j => j.id !== id);
    if (filtered.length !== jobs.length) {
      localStorage.setItem(JOBS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }
};
