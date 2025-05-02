'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, MessageState, CreateMessagePayload } from '@/types';
import { messagesApi } from '@/services/api';
import { useAuth } from '../hooks/useAuth';

// Initial state
const initialState: MessageState = {
  messages: [],
  isLoading: false,
  isAiResponding: false,
  error: null,
};

// Action types
type MessageAction =
  | { type: 'FETCH_MESSAGES_START' }
  | { type: 'FETCH_MESSAGES_SUCCESS'; payload: Message[] }
  | { type: 'FETCH_MESSAGES_ERROR'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string[] }
  | { type: 'SET_AI_RESPONDING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Constants for local storage
export const MESSAGES_CACHE_KEY = 'secretecho_messages';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_EXPIRY_MS;
};

// Helper function to save messages to local storage
const saveToLocalStorage = (messages: Message[]) => {
  const data = {
    messages,
    timestamp: Date.now()
  };
  localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(data));
};

// Helper function to get messages from local storage
const getFromLocalStorage = (): { messages: Message[]; timestamp: number } | null => {
  const data = localStorage.getItem(MESSAGES_CACHE_KEY);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    if (isCacheValid(parsed.timestamp)) {
      return parsed;
    }
  } catch (error) {
    console.error('Error parsing cached messages:', error);
    localStorage.removeItem(MESSAGES_CACHE_KEY);
  }
  return null;
};

// Message reducer
const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'SET_AI_RESPONDING':
      return {
        ...state,
        isAiResponding: action.payload,
      };
    case 'FETCH_MESSAGES_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_MESSAGES_SUCCESS':
      return {
        ...state,
        // Sort messages by timestamp, oldest first
        messages: action.payload.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
        isLoading: false,
        error: null,
      };
    case 'FETCH_MESSAGES_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'ADD_MESSAGE':
      // Update local storage when new message is added
      const updatedMessages = [...state.messages, action.payload];
      saveToLocalStorage(updatedMessages);
      
      // Check if message with this ID already exists
      if (state.messages.some(msg => msg._id === action.payload._id)) {
        // Replace the message if it exists (to handle any updates)
        return {
          ...state,
          messages: state.messages.map(msg => 
            msg._id === action.payload._id ? action.payload : msg
          ),
        };
      }
      return {
        ...state,
        messages: updatedMessages,
      };
    case 'DELETE_MESSAGE':
      // Update local storage when message is deleted
      const remainingMessages = state.messages.filter((message) => message._id !== action.payload);
      saveToLocalStorage(remainingMessages);
      return {
        ...state,
        messages: remainingMessages,
      };
    case 'MARK_AS_READ':
      // Update local storage when messages are marked as read
      const updatedReadMessages = state.messages.map((message) => 
        action.payload.includes(message._id) 
          ? { ...message, read: true } 
          : message
      );
      saveToLocalStorage(updatedReadMessages);
      return {
        ...state,
        messages: updatedReadMessages,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
interface MessageContextProps {
  state: MessageState;
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  clearError: () => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

// Socket instance
let socket: Socket | null = null;
let socketInitialized = false;

// Message provider component
export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { state: authState } = useAuth();
  
  // Helper function to check if a message ID is a temporary client-side ID
  const isTemporaryId = useCallback((id: string): boolean => {
    return id.startsWith('user_') || id.startsWith('ai_');
  }, []);
  
  // Initialize socket connection for real-time updates only
  useEffect(() => {
    if (typeof window !== 'undefined' && authState.isAuthenticated && authState.user && !socketInitialized) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      
      console.log('Initializing socket connection...');
      
      // Connect to socket
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      socket.on('connect', () => {
        console.log('Socket connected successfully:', socket && socket.id);
        socketInitialized = true;
        
        // Join user-specific room
        if (socket && authState.user) {
          socket.emit('join', authState.user.id);
        }
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listen for new messages - only for real-time updates
      socket.on('message', (message: Message) => {
        console.log('Socket message received:', message);
        
        // If it's an AI message, update the AI responding state immediately
        if (message.sender === 'ai') {
          dispatch({ type: 'SET_AI_RESPONDING', payload: false });
        }
        
        // Add the message to the state regardless of existing check
        // This ensures we always display the message when it comes through the socket
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      });
      
      // Cleanup on unmount
      return () => {
        if (socket) {
          console.log('Disconnecting socket...');
          socket.disconnect();
          socket = null;
          socketInitialized = false;
        }
      };
    }
    // No cleanup needed if socket wasn't initialized
    return () => {};
  }, [authState.isAuthenticated, authState.user]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    dispatch({ type: 'FETCH_MESSAGES_START' });
    
    try {
      // Try to get from local storage first
      const cachedData = getFromLocalStorage();
      if (cachedData) {
        dispatch({ type: 'FETCH_MESSAGES_SUCCESS', payload: cachedData.messages });
        return;
      }

      // If not in cache, fetch from API
      const response = await messagesApi.getMessages();
      const messages = response.data;
      
      // Save to local storage
      saveToLocalStorage(messages);
      
      dispatch({ type: 'FETCH_MESSAGES_SUCCESS', payload: messages });
    } catch (error) {
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
        ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch messages') : 
        'Failed to fetch messages';
      
      dispatch({
        type: 'FETCH_MESSAGES_ERROR',
        payload: errorMessage,
      });
    }
  }, [dispatch]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!authState.isAuthenticated || !authState.user) return;
    
    try {
      // Add optimistic update for user message
      const timestamp = new Date();
      const optimisticUserMessage: Message = {
        _id: `user_${timestamp.getTime()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: authState.user.id,
        sender: 'user',
        content,
        timestamp: timestamp.toISOString(),
        read: false,
        createdAt: timestamp.toISOString(),
        updatedAt: timestamp.toISOString(),
      };
      
      // Add optimistic user message to UI
      dispatch({ type: 'ADD_MESSAGE', payload: optimisticUserMessage });
      
      // Set AI responding state to true
      dispatch({ type: 'SET_AI_RESPONDING', payload: true });
      
      // Set timeout to ensure the AI responding state is reset if no response comes
      const aiResponseTimeout = setTimeout(() => {
        dispatch({ type: 'SET_AI_RESPONDING', payload: false });
      }, 10000); // 10 seconds timeout
      
      // Send message to API
      const payload: CreateMessagePayload = { content };
      const response = await messagesApi.createMessage(payload);
      
      // If we get a response with real IDs, replace the optimistic IDs with real ones
      if (response.success && response.data) {
        // Remove the optimistic message
        dispatch({ type: 'DELETE_MESSAGE', payload: optimisticUserMessage._id });
        
        // Add the real user message from the server
        if (response.data.userMessage) {
          dispatch({ type: 'ADD_MESSAGE', payload: response.data.userMessage });
        }
        
        // Add the AI message directly from the API response
        // This ensures we don't rely solely on socket for AI messages
        if (response.data.aiMessage) {
          // Clear the timeout since we got a response
          clearTimeout(aiResponseTimeout);
          
          // Turn off the AI responding state
          dispatch({ type: 'SET_AI_RESPONDING', payload: false });
          
          // Add the real AI message
          console.log('Adding AI message from API response:', response.data.aiMessage);
          dispatch({ type: 'ADD_MESSAGE', payload: response.data.aiMessage });
        } else {
          // If no AI message in response, turn off the typing indicator
          clearTimeout(aiResponseTimeout);
          dispatch({ type: 'SET_AI_RESPONDING', payload: false });
        }
      }
    } catch (error) {
      // Set AI responding state to false in case of error
      dispatch({ type: 'SET_AI_RESPONDING', payload: false });
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
        ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to send message') : 
        'Failed to send message';
      
      dispatch({
        type: 'FETCH_MESSAGES_ERROR',
        payload: errorMessage,
      });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Delete message
  const deleteMessage = useCallback(async (id: string) => {
    if (!authState.isAuthenticated) return;
    
    // Update UI immediately
    dispatch({ type: 'DELETE_MESSAGE', payload: id });
    
    // Skip API call for temporary client-side IDs
    if (isTemporaryId(id)) {
      return; // No need to call the API for temporary IDs
    }
    
    try {
      await messagesApi.deleteMessage(id);
    } catch (error) {
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
        ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete message') : 
        'Failed to delete message';
      
      dispatch({
        type: 'FETCH_MESSAGES_ERROR',
        payload: errorMessage,
      });
    }
  }, [authState.isAuthenticated, isTemporaryId]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!authState.isAuthenticated || messageIds.length === 0) return;
    
    // Update UI immediately for all messages
    dispatch({ type: 'MARK_AS_READ', payload: messageIds });
    
    // Filter out temporary IDs that don't exist in the database
    const serverMessageIds = messageIds.filter(id => !isTemporaryId(id));
    
    // Only make API call if there are server-side IDs to update
    if (serverMessageIds.length > 0) {
      try {
        await messagesApi.markAsRead(serverMessageIds);
      } catch (error) {
        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : 
          typeof error === 'object' && error !== null && 'response' in error ? 
          ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark messages as read') : 
          'Failed to mark messages as read';
        
        dispatch({
          type: 'FETCH_MESSAGES_ERROR',
          payload: errorMessage,
        });
      }
    }
  }, [authState.isAuthenticated, isTemporaryId]);

  return (
    <MessageContext.Provider
      value={{
        state,
        fetchMessages,
        sendMessage,
        deleteMessage,
        markAsRead,
        clearError,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use message context
export const useMessages = () => {
  const context = useContext(MessageContext);
  
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  
  return context;
};
