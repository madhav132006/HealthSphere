const jwt = require('jsonwebtoken');
const db = require('../config/db');

const setupSocket = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

    // Join a chat session room
    socket.on('join_session', ({ sessionId }) => {
      const session = db.chatSessions.find(s => s.id === sessionId);
      
      if (!session) {
        socket.emit('error_message', { message: 'Chat session not found.' });
        return;
      }

      if (session.userId !== socket.user.id) {
        socket.emit('error_message', { message: 'Unauthorized access to this session.' });
        return;
      }

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        socket.emit('error_message', { message: 'Chat session has expired.' });
        return;
      }

      socket.join(sessionId);
      
      // Send existing messages
      const messages = db.getSessionMessages(sessionId);
      socket.emit('message_history', messages);

      // Get doctor info
      const doctor = db.findDoctorById(session.doctorId);

      // Send welcome message from doctor
      if (messages.length === 0) {
        const welcomeMsg = {
          id: 'msg-' + Date.now(),
          sessionId,
          sender: 'doctor',
          senderName: doctor.name,
          text: `Hello ${socket.user.name}! I'm ${doctor.name}, ${doctor.specialization}. How can I help you today? Please describe your concerns in detail.`,
          timestamp: new Date().toISOString()
        };
        db.addMessage(welcomeMsg);
        io.to(sessionId).emit('new_message', welcomeMsg);
      }

      socket.emit('session_joined', {
        sessionId,
        doctor: { id: doctor.id, name: doctor.name, specialization: doctor.specialization, avatar: doctor.avatar },
        expiresAt: session.expiresAt
      });

      console.log(`📋 ${socket.user.name} joined session: ${sessionId}`);
    });

    // Handle sending messages
    socket.on('send_message', ({ sessionId, text }) => {
      if (!text || !text.trim()) return;

      const message = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        sessionId,
        sender: 'user',
        senderName: socket.user.name,
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      db.addMessage(message);
      io.to(sessionId).emit('new_message', message);

      // Simulate doctor response after a delay
      setTimeout(() => {
        const session = db.chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        const doctor = db.findDoctorById(session.doctorId);

        const doctorResponses = [
          `I understand your concern. Based on what you've described, I'd recommend we look into this further. Can you tell me more about when these symptoms started?`,
          `Thank you for sharing that. This is quite common and treatable. Have you experienced any other symptoms alongside this?`,
          `I see. That's helpful information. Let me suggest a few things you can try. First, make sure you're staying well hydrated and getting adequate rest.`,
          `Based on your symptoms, I'd like to recommend some initial tests to rule out common causes. Nothing to worry about — this is standard procedure.`,
          `That's a good question. Many patients have similar concerns. Let me explain what's likely happening and what we can do about it.`,
          `I appreciate you providing those details. Given your description, I think we should focus on managing the symptoms first. Here's what I suggest...`,
          `Alright, I've noted everything. I'd recommend starting with a mild treatment and monitoring the progress. If things don't improve in 3-5 days, we should consider further evaluation.`,
          `Your symptoms could be related to several factors. Let's not jump to conclusions. I'll guide you through some self-assessment steps first.`
        ];

        const randomResponse = doctorResponses[Math.floor(Math.random() * doctorResponses.length)];

        const doctorMsg = {
          id: 'msg-' + Date.now() + '-doc',
          sessionId,
          sender: 'doctor',
          senderName: doctor.name,
          text: randomResponse,
          timestamp: new Date().toISOString()
        };

        // Send typing indicator
        io.to(sessionId).emit('doctor_typing', { isTyping: true });

        setTimeout(() => {
          io.to(sessionId).emit('doctor_typing', { isTyping: false });
          db.addMessage(doctorMsg);
          io.to(sessionId).emit('new_message', doctorMsg);
        }, 2000 + Math.random() * 2000);

      }, 1500 + Math.random() * 3000);
    });

    // Typing indicator
    socket.on('typing', ({ sessionId, isTyping }) => {
      socket.to(sessionId).emit('user_typing', { 
        userId: socket.user.id, 
        name: socket.user.name, 
        isTyping 
      });
    });

    // Leave session
    socket.on('leave_session', ({ sessionId }) => {
      socket.leave(sessionId);
      console.log(`👋 ${socket.user.name} left session: ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};

module.exports = setupSocket;
