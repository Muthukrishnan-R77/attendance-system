import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('attendance_token', response.data.token);
      localStorage.setItem('attendance_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('attendance_token');
    localStorage.removeItem('attendance_user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('attendance_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken() {
    return localStorage.getItem('attendance_token');
  }
};
