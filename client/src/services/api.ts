import axios from 'axios';

// 1. Dynamic URL for Deployment
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 2. Create Axios Instance AND EXPORT IT (Fixes your error)
export const API = axios.create({ baseURL: BASE_URL });

// 3. Add Token Interceptor (Keeps you logged in)
API.interceptors.request.use((req) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

// --- API Helper Functions ---

// Auth
export const loginUser = (data: any) => API.post('/auth/login', data);
export const registerUser = (data: any) => API.post('/auth/register', data);

// Meetings
export const scheduleMeeting = (data: any) => API.post('/meetings', data);
export const getMeetings = () => API.get('/meetings');
export const updateMeetingStatus = (id: string, status: string) => API.put(`/meetings/${id}/status`, { status });

// Documents
export const getDocuments = () => API.get('/documents');
export const signDocument = (id: string) => API.put(`/documents/${id}/sign`);
export const uploadDocument = (formData: FormData) => {
  return API.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Payments
export const depositFunds = (amount: number) => API.post('/payments/deposit', { amount });
export const withdrawFunds = (amount: number) => API.post('/payments/withdraw', { amount });
export const getTransactions = () => API.get('/payments/history');
export const getBalance = () => API.get('/payments/balance');