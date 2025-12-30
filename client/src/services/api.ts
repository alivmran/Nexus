import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

//Login APIs
export const loginUser = (data: any) => API.post('/auth/login', data);
export const registerUser = (data: any) => API.post('/auth/register', data);

//Meeting APIs
export const scheduleMeeting = (data: any) => API.post('/meetings', data);
export const getMeetings = () => API.get('/meetings');
export const updateMeetingStatus = (id: string, status: string) => API.put(`/meetings/${id}/status`, { status });

// Document APIs
export const getDocuments = () => API.get('/documents');
export const signDocument = (id: string) => API.put(`/documents/${id}/sign`);

export const uploadDocument = (formData: FormData) => {
  return API.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const depositFunds = (amount: number) => API.post('/payments/deposit', { amount });
export const withdrawFunds = (amount: number) => API.post('/payments/withdraw', { amount });
export const getTransactions = () => API.get('/payments/history');
export const getBalance = () => API.get('/payments/balance');