import React, { useEffect, useRef, useState } from 'react';
import type { MessageType, AppointmentType } from './types';
import MessageBubble from './MessageBubble';

interface Props {
  appointment: AppointmentType | null;
  messages: MessageType[];
  user: {
    userId: string;
    role: 'patient' | 'doctor';
    token: string;
  };
  fetchMessages: (appointmentId: string) => void;
}

const ChatBox: React.FC<Props> = ({ appointment, messages, user, fetchMessages }) => {
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const isChatActive = appointment && new Date(appointment.scheduledFor).getTime() > Date.now();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }
    if (!appointment) {
      setError('No appointment selected');
      return;
    }

    const payload = {
      appointmentId: appointment._id,
      senderId: user.userId,
      senderRole: user.role,
      message: newMessage.trim(),
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.body) {
        setNewMessage('');
        fetchMessages(appointment._id);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send error', err);
      setError('Something went wrong while sending the message.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isChatActive) handleSend();
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-gradient-to-b from-slate-50 to-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                {appointment ? 'Live Consultation' : 'Chat'}
              </h3>
              <p className="text-blue-100 text-sm">
                {isChatActive ? 'Active session' : 'Session ended'}
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isChatActive 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {isChatActive ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">Start the conversation</p>
            <p className="text-gray-400 text-sm max-w-sm">
              Send your first message to begin the consultation with your healthcare provider.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg._id || i}
              message={msg.message}
              isMine={msg.senderId === user.userId}
              time={new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          ))
        )}
        <div ref={messageEndRef} />

        {!isChatActive && appointment && (
          <div className="flex items-center justify-center py-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 max-w-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium text-sm">Session Ended</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    This chat is closed. The appointment time has passed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isChatActive}
              placeholder={
                isChatActive ? 'Type your message...' : 'Chat is closed after appointment time.'
              }
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                isChatActive
                  ? 'bg-gray-50 border-gray-200 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 hover:border-gray-300'
                  : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            />
            
            {/* Character count or typing indicator */}
            {isChatActive && newMessage.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">
                  {newMessage.length}
                </span>
              </div>
            )}
          </div>

          {/* Additional Actions */}
          {isChatActive && (
            <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!isChatActive || loading || !newMessage.trim()}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg ${
              isChatActive && newMessage.trim()
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending</span>
              </>
            ) : isChatActive ? (
              <>
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            ) : (
              <span>Chat Closed</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;