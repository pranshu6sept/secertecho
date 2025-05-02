'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/context/MessageContext';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import { Button } from '@/components/Button';
import { FaSignOutAlt } from 'react-icons/fa';

export default function ChatPage() {
  const { state: authState, logout } = useAuth();
  const { state: messageState, fetchMessages, sendMessage, deleteMessage, markAsRead } = useMessages();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isAuthenticated && !authState.isLoading) {
      router.push('/auth/login');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);
  
  // Fetch messages on component mount
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchMessages();
    }
  }, [authState.isAuthenticated, fetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageState.messages]);
  
  // Handle send message
  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };
  
  // Handle delete message
  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
  };
  
  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    markAsRead([id]);
  };
  
  // Mark all unread messages as read
  const handleMarkAllAsRead = () => {
    const unreadMessageIds = messageState.messages
      .filter(message => !message.read)
      .map(message => message._id);
    
    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  if (!authState.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-pulse text-white font-medium">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 shadow-sm">
              <span className="font-bold text-lg">SE</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">SecretEcho</h1>
          </div>
          <div className="flex items-center gap-3">
            {messageState.messages.filter(m => !m.read).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-all"
              >
                Mark all as read
              </Button>
            )}
            <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              Welcome, {authState.user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-all"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main chat area */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="container mx-auto max-w-3xl">
          {messageState.isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-pulse text-gray-600 font-medium bg-white px-6 py-4 rounded-lg shadow-sm">
                Loading messages...
              </div>
            </div>
          ) : messageState.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-white p-8 rounded-xl shadow-sm max-w-md border border-gray-200 transition-all hover:shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Welcome to SecretEcho!
                </h2>
                <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                  This is the beginning of your conversation with your AI companion.
                  Send a message to start chatting!
                </p>
                <div className="animate-bounce mt-4">
                  <svg className="w-6 h-6 text-blue-500 mx-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {messageState.messages.map((message, index) => (
                <MessageBubble
                  key={message._id || `message-${index}`}
                  message={message}
                  onDelete={message.sender === 'user' ? handleDeleteMessage : undefined}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
              {messageState.isAiResponding && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>
      
      {/* Message input */}
      <div className="bg-white border-t border-gray-200 py-3 px-4 shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <MessageInput onSendMessage={handleSendMessage} isLoading={messageState.isLoading || messageState.isAiResponding} />
        </div>
      </div>
    </div>
  );
}
