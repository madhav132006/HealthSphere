import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const DoctorChat = () => {
  const { sessionId } = useParams();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [doctorTyping, setDoctorTyping] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the session
    socket.emit('join_session', { sessionId });

    // Listen for events
    socket.on('session_joined', (data) => {
      setDoctorInfo(data.doctor);
      setExpiresAt(new Date(data.expiresAt));
    });

    socket.on('message_history', (msgs) => {
      setMessages(msgs);
    });

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('doctor_typing', ({ isTyping }) => {
      setDoctorTyping(isTyping);
    });

    socket.on('error_message', ({ message }) => {
      alert(message);
      navigate('/doctors');
    });

    return () => {
      socket.off('session_joined');
      socket.off('message_history');
      socket.off('new_message');
      socket.off('doctor_typing');
      socket.off('error_message');
      socket.emit('leave_session', { sessionId });
    };
  }, [socket, isConnected, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, doctorTyping]);

  // Timer countdown
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('Session Expired');
        clearInterval(interval);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')} remaining`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', { sessionId, text: newMessage });
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-wrapper" id="chat-page" style={{paddingBottom: 0}}>
      <div className="container">
        <div className="chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              {doctorInfo && (
                <>
                  <div className="doctor-avatar" style={{width: '48px', height: '48px', fontSize: '1rem'}}>
                    {doctorInfo.avatar}
                  </div>
                  <div>
                    <h3 style={{fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem'}}>{doctorInfo.name}</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem'}}>
                      <span style={{color: 'var(--accent-primary)'}}>{doctorInfo.specialization}</span>
                      <span className="status-dot online" style={{width: '6px', height: '6px'}}></span>
                      <span style={{color: 'var(--accent-success)'}}>Online</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {timeLeft && (
                <span style={{
                  padding: '0.4rem 0.8rem',
                  background: timeLeft.includes('Expired') ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,170,0.1)',
                  border: `1px solid ${timeLeft.includes('Expired') ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,170,0.3)'}`,
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: timeLeft.includes('Expired') ? 'var(--accent-danger)' : 'var(--accent-primary)'
                }}>
                  ⏱ {timeLeft}
                </span>
              )}
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/doctors')} id="end-chat-btn">
                End Chat
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === 'user' ? 'message-user' : 'message-doctor'}`}
              >
                <div className="message-sender">
                  {msg.sender === 'user' ? '🧑 You' : `👨‍⚕️ ${msg.senderName}`}
                </div>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            ))}

            {doctorTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                Doctor is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              id="chat-input"
              disabled={timeLeft === 'Session Expired'}
            />
            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim() || timeLeft === 'Session Expired'} id="send-message-btn">
              Send →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;
