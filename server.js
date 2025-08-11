const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { db, auth, isInitialized } = require('./config/firebase-admin');

// Load environment variables
require('dotenv').config();

// Check Firebase connection
const firebaseConnected = isInitialized;
if (!firebaseConnected) {
  console.log('Warning: Running without Firebase - using mock authentication');
} else {
  console.log('Firebase Admin SDK initialized successfully');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files only in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Import auth controller and middleware
const authController = require('./controllers/authController');
const { protect } = require('./middleware/auth');

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Tingay API is running',
    firebase: firebaseConnected ? 'connected' : 'disconnected'
  });
});

// Auth routes with Firebase check
app.post('/api/auth/register', (req, res, next) => {
  if (!firebaseConnected) {
    return res.status(503).json({
      success: false,
      message: 'Firebase not available - registration disabled in demo mode'
    });
  }
  next();
}, authController.register);

app.post('/api/auth/login', (req, res, next) => {
  if (!firebaseConnected) {
    return res.status(503).json({
      success: false,
      message: 'Firebase not available - login disabled in demo mode'
    });
  }
  next();
}, authController.login);

app.get('/api/auth/me', (req, res, next) => {
  if (!firebaseConnected) {
    return res.status(503).json({
      success: false,
      message: 'Firebase not available - profile access disabled in demo mode'
    });
  }
  next();
}, authController.getMe);

app.put('/api/auth/profile', (req, res, next) => {
  if (!firebaseConnected) {
    return res.status(503).json({
      success: false,
      message: 'Firebase not available - profile updates disabled in demo mode'
    });
  }
  next();
}, authController.updateProfile);

// Mock user data for demonstration
const mockUsers = [
  { id: 1, name: 'Alex', age: 28, location: 'Mexico City', orientation: 'Gay', bio: 'Love hiking and photography' },
  { id: 2, name: 'Sam', age: 24, location: 'Toronto', orientation: 'Non-binary', bio: 'Artist and coffee enthusiast' },
  { id: 3, name: 'Maria', age: 31, location: 'Buenos Aires', orientation: 'Lesbian', bio: 'Tech professional who enjoys traveling' },
];

// Routes
app.use('/api/auth', require('./routes/auth'));

// Conditional routes based on Firebase connection
if (firebaseConnected) {
  app.use('/api/users', require('./routes/users'));
  app.use('/api/chat', require('./routes/chat'));
} else {
  // Mock routes for development without Firebase
  app.get('/api/users/discover', (req, res) => {
    res.json({
      success: true,
      data: mockUsers
    });
  });
  
  app.post('/api/users/like', (req, res) => {
    res.json({
      success: true,
      message: 'Like sent (mock mode - Firebase not available)'
    });
  });
  
  app.post('/api/users/pass', (req, res) => {
    res.json({ success: true, message: 'Pass recorded (mock mode - Firebase not available)' });
  });
  
  app.get('/api/users/matches', (req, res) => {
    res.json({ success: true, data: [] });
  });
}

// Socket.io connection handling for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room for notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined personal room user_${userId}`);
  });
  
  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });
  
  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });
  
  // Handle new message
  socket.on('send_message', (data) => {
    // Broadcast to all users in the conversation
    socket.to(`conversation_${data.conversationId}`).emit('new_message', data.message);
    
    // Send notification to recipient's personal room
    if (data.recipientId) {
      socket.to(`user_${data.recipientId}`).emit('message_notification', {
        conversationId: data.conversationId,
        message: data.message,
        sender: data.sender
      });
    }
  });
  
  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });
  
  socket.on('typing_stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stopped_typing', {
      userId: data.userId
    });
  });
  
  // Handle message read status
  socket.on('message_read', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('messages_read', {
      userId: data.userId,
      messageIds: data.messageIds
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// 404 handler for undefined API routes
app.use('/api/*', notFound);

// Global error handler
app.use(errorHandler);

// Serve the React app for any request that doesn't match an API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Tingay server running on port ${PORT}`);
});