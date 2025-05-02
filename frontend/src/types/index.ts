// User types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Message types
export interface Message {
  _id: string;
  userId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  isAiResponding: boolean;
  error: string | null;
}

export interface CreateMessagePayload {
  content: string;
  skipAiResponse?: boolean;
}

export interface MessageResponse {
  success: boolean;
  data: {
    userMessage: Message;
    aiMessage: Message;
  };
}

export interface MessagesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Message[];
}

