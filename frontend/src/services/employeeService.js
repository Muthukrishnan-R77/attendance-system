import api from './api';

export const employeeService = {
  async getAll(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async create(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  async update(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};
