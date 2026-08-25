import api from './api';

export const attendanceService = {
  async checkIn() {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  async checkOut() {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  async getAllAttendance(params = {}) {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  async getMyAttendance(params = {}) {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  }
};
