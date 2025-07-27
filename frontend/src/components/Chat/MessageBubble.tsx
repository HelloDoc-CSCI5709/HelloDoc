import React from 'react';

type Props = {
  message: string;
  isMine: boolean;
  time: string;
};

const MessageBubble: React.FC<Props> = ({ message, isMine, time }) => {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end`}>
      {!isMine && (
        <div className="w-8 h-8 rounded-full bg-indigo-300 shadow-md flex-shrink-0 mr-2"></div>
      )}

      <div
        className={`relative max-w-sm px-4 py-2 rounded-2xl shadow-md ${
          isMine
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message}</p>
        <span className="text-xs mt-1 block text-right opacity-70">{time}</span>
      </div>

      {isMine && (
        <div className="w-8 h-8 rounded-full bg-blue-400 shadow-md flex-shrink-0 ml-2"></div>
      )}
    </div>
  );
};

export default MessageBubble;
