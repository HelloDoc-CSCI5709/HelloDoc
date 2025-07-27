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
    <div className="flex flex-col flex-1 h-full bg-white">
      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Start a conversation</p>
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
          <p className="text-center text-sm text-gray-500 mt-6">
            This chat is closed. The appointment time has passed.
          </p>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white flex items-center gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isChatActive}
          placeholder={
            isChatActive ? 'Type your message...' : 'Chat is closed after appointment time.'
          }
          className={`flex-1 border px-4 py-2 rounded-full ${
            isChatActive
              ? 'bg-gray-100 border-gray-300'
              : 'bg-gray-200 border-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        />
        <button
          onClick={handleSend}
          disabled={!isChatActive || loading}
          className={`px-5 py-2 rounded-full font-semibold shadow-md ${
            isChatActive
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isChatActive ? (loading ? '...' : 'Send') : 'Chat Closed'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm px-4 pb-2">{error}</p>}
    </div>
  );
};

export default ChatBox;
