const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/message.routes');
const { errorHandler } = require('./middleware/error.middleware');
const messageController = require('./controllers/message.controller');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Pass io to message controller
messageController.setIo(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('SecretEcho API is running');
});

// Error handling middleware
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a room (user-specific)
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  // Socket message handling is disabled to prevent duplicate messages
  // Messages are now handled exclusively through the REST API
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// AI response generator function
function generateAIResponse() {
  const responses = [
    "I'm here to help you. What's on your mind?",
    "That's interesting! Tell me more about it.",
    "I understand how you feel. Let's talk more about it.",
    "I'm processing what you said. It's an interesting perspective.",
    "Thanks for sharing that with me. How does that make you feel?",
    "I'm learning from our conversation. Please continue.",
    "That's a great point! I hadn't thought about it that way.",
    "I'm here to listen whenever you need someone to talk to.",
    "Let me think about that for a moment...",
    "Your insights are valuable to me. Please share more."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secretecho';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
