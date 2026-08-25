const STORAGE_KEY = 'attendance_leave_requests';

const defaultRequests = [
  {
    id: 1,
    employeeName: 'Jane Doe',
    employeeEmail: 'jane@company.com',
    startDate: '2026-08-27',
    endDate: '2026-08-29',
    reason: 'Family emergency and travel plans',
    status: 'PENDING',
    requestedAt: '2026-08-25T09:00:00.000Z'
  },
  {
    id: 2,
    employeeName: 'Michael Smith',
    employeeEmail: 'michael@company.com',
    startDate: '2026-08-20',
    endDate: '2026-08-21',
    reason: 'Medical consultation',
    status: 'APPROVED',
    requestedAt: '2026-08-18T10:15:00.000Z'
  }
];

const readStorage = () => {
  if (typeof window === 'undefined') return defaultRequests;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRequests));
      return defaultRequests;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultRequests;
  } catch (error) {
    console.error('Error reading leave requests:', error);
    return defaultRequests;
  }
};

const writeStorage = (requests) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

export const leaveService = {
  getAll() {
    return readStorage();
  },

  getMyRequests(employeeEmail) {
    if (!employeeEmail) return [];
    return readStorage().filter((request) => request.employeeEmail?.toLowerCase() === employeeEmail.toLowerCase());
  },

  submitRequest(request) {
    const existing = readStorage();
    const newRequest = {
      ...request,
      id: Date.now(),
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    const next = [newRequest, ...existing];
    writeStorage(next);
    return { success: true, request: newRequest };
  },

  updateStatus(id, status) {
    const existing = readStorage();
    const updated = existing.map((request) =>
      request.id === Number(id) ? { ...request, status } : request
    );

    writeStorage(updated);
    return {
      success: true,
      request: updated.find((request) => request.id === Number(id)) || null
    };
  },

  getSummary() {
    const requests = readStorage();
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === 'PENDING').length,
      approved: requests.filter((request) => request.status === 'APPROVED').length,
      rejected: requests.filter((request) => request.status === 'REJECTED').length
    };
  }
};
