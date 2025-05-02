'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types';
import { cn } from '@/utils/cn';
import { FaTrash, FaCheck, FaRegCopy } from 'react-icons/fa';

interface MessageBubbleProps {
  message: Message;
  onDelete?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDelete, onMarkAsRead }) => {
  const isAI = message.sender === 'ai';
  const formattedTime = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect when message appears
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Automatically mark AI messages as read when they are displayed
  useEffect(() => {
    if (isAI && !message.read && onMarkAsRead) {
      onMarkAsRead(message._id);
    }
  }, [isAI, message._id, message.read, onMarkAsRead]);

  // Handle copy message content
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4 transition-opacity duration-300 ease-in-out',
        isAI ? 'justify-start' : 'justify-end',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3 shadow-sm group transition-all',
          isAI 
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 rounded-bl-none border-l-2 border-gray-300 hover:shadow-md' 
            : 'bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 rounded-br-none border-r-2 border-blue-300 hover:shadow-md',
          !message.read && 'relative'
        )}
        onClick={() => !message.read && onMarkAsRead && onMarkAsRead(message._id)}
      >
        {/* Message content */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          <div className="flex flex-col gap-1">
            {/* Copy button - visible for both AI and user messages */}
            <button
              onClick={handleCopy}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500 p-1.5 rounded-full hover:bg-gray-200/70"
              aria-label="Copy message"
              title="Copy to clipboard"
            >
              {copied ? <FaCheck className="text-green-500" /> : <FaRegCopy />}
            </button>
            
            {/* Delete button - only for user messages */}
            {!isAI && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message._id);
                }}
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1.5 rounded-full hover:bg-gray-200/70"
                aria-label="Delete message"
                title="Delete message"
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>
        
        {/* Message footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 font-medium">{formattedTime}</span>
          <div className="flex items-center gap-2">
            {!message.read && (
              <span 
                className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" 
                title="Unread message"
              ></span>
            )}
            <span 
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                isAI 
                  ? "text-gray-600 bg-gray-200/80" 
                  : "text-blue-600 bg-blue-100/80"
              )}
            >
              {isAI ? 'AI' : 'You'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
