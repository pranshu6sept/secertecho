import axios from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  MessageResponse, 
  MessagesResponse, 
  CreateMessagePayload 
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },
  
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },
};

// Messages API
export const messagesApi = {
  getMessages: async (page = 1, limit = 50): Promise<MessagesResponse> => {
    const response = await api.get<MessagesResponse>(`/messages?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  createMessage: async (payload: CreateMessagePayload): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/messages', payload);
    return response.data;
  },
  
  markAsRead: async (messageIds: string[]): Promise<{ success: boolean; count: number; message: string }> => {
    const response = await api.put('/messages/read', { messageIds });
    return response.data;
  },
  
  deleteMessage: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

export default api;
