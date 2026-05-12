const jwt = require('jsonwebtoken');
const ChatSession = require('../models/ChatSession');
const Doctor = require('../models/Doctor');
const Message = require('../models/Message');

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
    socket.on('join_session', async ({ sessionId }) => {
      try {
        const session = await ChatSession.findById(sessionId);
        
        if (!session) {
          socket.emit('error_message', { message: 'Chat session not found.' });
          return;
        }

        if (session.userId.toString() !== socket.user.id) {
          socket.emit('error_message', { message: 'Unauthorized access to this session.' });
          return;
        }

        if (new Date(session.expiresAt) < new Date()) {
          socket.emit('error_message', { message: 'Chat session has expired.' });
          return;
        }

        socket.join(sessionId);
        
        // Send existing messages from MongoDB
        const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
        socket.emit('message_history', messages.map(m => ({
          id: m._id,
          sessionId: m.sessionId,
          sender: m.sender,
          senderName: m.senderName,
          text: m.text,
          timestamp: m.createdAt
        })));

        const doctor = await Doctor.findById(session.doctorId);

        // Send welcome message from doctor if no messages yet
        if (messages.length === 0) {
          const welcomeMsg = await Message.create({
            sessionId,
            sender: 'doctor',
            senderName: doctor.name,
            text: `Hello ${socket.user.name}! I'm ${doctor.name}, ${doctor.specialization}. How can I help you today? Please describe your concerns in detail.`
          });

          io.to(sessionId).emit('new_message', {
            id: welcomeMsg._id,
            sessionId,
            sender: 'doctor',
            senderName: doctor.name,
            text: welcomeMsg.text,
            timestamp: welcomeMsg.createdAt
          });
        }

        socket.emit('session_joined', {
          sessionId,
          doctor: { id: doctor._id, name: doctor.name, specialization: doctor.specialization, avatar: doctor.avatar },
          expiresAt: session.expiresAt
        });

        console.log(`📋 ${socket.user.name} joined session: ${sessionId}`);
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error_message', { message: 'Failed to join session.' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async ({ sessionId, text }) => {
      if (!text || !text.trim()) return;

      try {
        const message = await Message.create({
          sessionId,
          sender: 'user',
          senderName: socket.user.name,
          text: text.trim()
        });

        io.to(sessionId).emit('new_message', {
          id: message._id,
          sessionId,
          sender: 'user',
          senderName: socket.user.name,
          text: message.text,
          timestamp: message.createdAt
        });

        // Simulate doctor response after a delay
        setTimeout(async () => {
          try {
            const session = await ChatSession.findById(sessionId);
            if (!session) return;
            const doctor = await Doctor.findById(session.doctorId);

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

            // Send typing indicator
            io.to(sessionId).emit('doctor_typing', { isTyping: true });

            setTimeout(async () => {
              io.to(sessionId).emit('doctor_typing', { isTyping: false });

              const doctorMsg = await Message.create({
                sessionId,
                sender: 'doctor',
                senderName: doctor.name,
                text: randomResponse
              });

              io.to(sessionId).emit('new_message', {
                id: doctorMsg._id,
                sessionId,
                sender: 'doctor',
                senderName: doctor.name,
                text: doctorMsg.text,
                timestamp: doctorMsg.createdAt
              });
            }, 2000 + Math.random() * 2000);
          } catch (err) {
            console.error('Doctor response error:', err);
          }
        }, 1500 + Math.random() * 3000);
      } catch (error) {
        console.error('Send message error:', error);
      }
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
