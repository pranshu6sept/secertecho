'use client';

import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-3 shadow-sm bg-gray-100 text-gray-800 rounded-bl-none border-l-2 border-gray-300 transition-all">
        <div className="flex items-center space-x-2 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-bounce opacity-80" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-bounce opacity-80" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-bounce opacity-80" style={{ animationDelay: '300ms' }}></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500 font-medium">Just now</span>
          <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">AI is typing...</span>
        </div>
      </div>
    </div>
  );
};
