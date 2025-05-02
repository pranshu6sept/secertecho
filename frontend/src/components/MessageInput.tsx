'use client';

import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { Button } from './Button';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading = false 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-2">
      <div className="relative flex-1">
        <textarea
          className="w-full p-3 pr-10 bg-white text-gray-800 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent placeholder-gray-400 shadow-sm transition-all"
          placeholder="Type a message..."
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        isLoading={isLoading}
        className="rounded-full p-3 h-auto bg-blue-500 hover:bg-blue-600 border-none shadow-sm transition-all"
        aria-label="Send message"
      >
        <FaPaperPlane className="h-5 w-5" />
      </Button>
    </form>
  );
};
