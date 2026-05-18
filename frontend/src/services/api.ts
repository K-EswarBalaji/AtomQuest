import axios, { AxiosInstance } from 'axios';

const RAW_API_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_URL = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/$/, '')}/api`;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('401 ERROR:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  register(data: any) {
    return this.api.post('/auth/register', data);
  }

  login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }

  getCurrentUser() {
    return this.api.get('/auth/me');
  }

  updateProfile(data: any) {
    return this.api.put('/auth/profile', data);
  }

  // Users
  getUsers() {
    return this.api.get('/users');
  }

  createUser(data: any) {
    return this.api.post('/users', data);
  }

  updateUser(userId: string, data: any) {
    return this.api.put(`/users/${userId}`, data);
  }

  deleteUser(userId: string) {
    return this.api.delete(`/users/${userId}`);
  }

  // Audit logs
  getAuditLogs() {
    return this.api.get('/audit-logs');
  }

  // Goals
  createGoal(data: any) {
    return this.api.post('/goals', data);
  }

  getEmployeeGoals(employeeId?: string, cycleId?: string) {
    const params = new URLSearchParams();
    if (cycleId) params.append('cycleId', cycleId);
    const endpoint = employeeId ? `/goals/employee/${employeeId}` : '/goals/employee/me';
    return this.api.get(endpoint + (params.toString() ? '?' + params : ''));
  }

  submitGoals(goalIds: string[], cycleId: string) {
    return this.api.post('/goals/submit', { goalIds, cycleId });
  }

  approveGoal(goalId: string, approved: boolean, rejectionReason?: string, targetAdjustment?: number) {
    return this.api.post(`/goals/${goalId}/approve`, {
      approved,
      rejectionReason,
      targetAdjustment
    });
  }

  getTeamGoals(cycleId?: string, status?: string) {
    const params = new URLSearchParams();
    if (cycleId) params.append('cycleId', cycleId);
    if (status) params.append('status', status);
    return this.api.get('/goals/team' + (params.toString() ? '?' + params : ''));
  }

  // Check-ins
  createCheckIn(data: any) {
    return this.api.post('/check-ins', data);
  }

  getCheckIns(goalId?: string, cycleId?: string) {
    const params = new URLSearchParams();
    if (goalId) params.append('goalId', goalId);
    if (cycleId) params.append('cycleId', cycleId);
    return this.api.get('/check-ins' + (params.toString() ? '?' + params : ''));
  }

  addManagerComment(checkInId: string, managerComment: string) {
    return this.api.put(`/check-ins/${checkInId}/comment`, { managerComment });
  }

  getTeamCheckInStatus(cycleId?: string) {
    const params = new URLSearchParams();
    if (cycleId) params.append('cycleId', cycleId);
    return this.api.get('/check-ins/team/status' + (params.toString() ? '?' + params : ''));
  }

  // Cycles
  createCycle(data: any) {
    return this.api.post('/cycles', data);
  }

  getCycles() {
    return this.api.get('/cycles');
  }

  getActiveCycle() {
    return this.api.get('/cycles/active');
  }

  updateCycle(cycleId: string, data: any) {
    return this.api.put(`/cycles/${cycleId}`, data);
  }
}

export default new ApiService();
