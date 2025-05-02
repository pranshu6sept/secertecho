# SecretEcho

A modern chat application with real-time messaging capabilities featuring an AI companion.

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/secretecho
   JWT_SECRET=jwt_secret_key
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build application:
   ```bash
   npm run build
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Architecture Overview

### Tech Stack

- **Backend**:
  - Node.js with Express.js
  - MongoDB with Mongoose
  - Socket.io for real-time communication
  - JWT for authentication

- **Frontend**:
  - Next.js 15.3.1
  - React 18
  - Tailwind CSS for styling
  - Redux Toolkit for state management
  - Axios for API calls
  - Socket.io-client for real-time communication

### Directory Structure

```bash
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── config/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── slices/
    │   ├── services/
    │   └── styles/
    ├── public/
    └── package.json
```

## Features

### Backend Features
- JWT Authentication (register, login, get current user)
- Message management (create, read, update, delete)
- Real-time messaging with Socket.io
- MongoDB database integration
- Error handling middleware
- Simulated AI responses
- User profile management

### Frontend Features
- Real-time chat interface
- User authentication flow
- Message read/unread status
- Message typing indicators
- AI companion integration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (protected)

### Messages
- `GET /api/messages` - Get all messages for a user (protected)
- `POST /api/messages` - Create a new message (protected)
- `PUT /api/messages/read` - Mark messages as read (protected)
- `DELETE /api/messages/:id` - Delete a message (protected)

## Socket.io Events

- `connection` - Client connects to the server
- `join` - Client joins a user-specific room
- `sendMessage` - Client sends a message
- `message` - Server sends a message to the client
- `typing` - User is typing
- `disconnect` - Client disconnects from the server

## Frontend Architecture

### Component Structure
- **Layout Components**:
  - Header with navigation
  - Chat container
  - Message input
  - User profile drawer

- **Feature Components**:
  - MessageList
  - MessageInput
  - TypingIndicator
  - MessageStatus

### State Management
- Context API for global state
- Local state management with React hooks
- Real-time state synchronization with Socket.io

## Architecture Decisions

### Backend
- **Modular Structure**: Code organized by feature for easy maintenance
- **Middleware Pattern**: Centralized authentication and error handling
- **Real-time Communication**: Socket.io for low-latency messaging
- **MongoDB with Mongoose**: Flexible schema for chat data
- **JWT Authentication**: Stateless authentication for scalability

### Frontend
- **Next.js**: Server-side rendering for better SEO and performance
- **Tailwind CSS**: Utility-first styling for rapid development
- **Redux Toolkit**: Efficient state management
- **Socket.io-client**: Real-time communication with backend
- **Responsive Design**: Mobile-first approach

## Error Handling

### Backend
- Centralized error handling middleware
- Custom error classes for different error types
- Error logging and monitoring
- Graceful error responses to frontend

### Frontend
- User-friendly error messages
- Retry mechanisms for failed operations
- Loading states and spinners

## Future Improvements

### Backend
- Rate limiting for API endpoints
- Refresh tokens for authentication
- Unit and integration tests
- Logging service integration
- Message pagination optimization

### Frontend
- Offline-first capabilities
- Message caching
- Enhanced error handling
- Performance optimizations
- Additional AI features

## Design Decisions & Trade-offs

### Real-time Communication
- **Choice**: Socket.IO for real-time messaging
- **Trade-offs**:
  - Higher memory usage compared to traditional HTTP
  - More complex connection management
  - Benefits: Low latency, bidirectional communication

### Authentication
- **Choice**: JWT for authentication
- **Trade-offs**:
  - Token size increases with more claims
  - Stateless nature makes logout more complex
  - Benefits: Scalable, no server-side session storage

### Database
- **Choice**: MongoDB
- **Trade-offs**:
  - Less suitable for complex transactions
  - Schema flexibility can lead to data inconsistency
  - Benefits: Scalable, flexible schema, perfect for chat data

### Security
- **Implementations**:
  - bcrypt for password hashing
  - CORS configuration for secure API access
  - Environment variables for sensitive data
- **Trade-offs**:
  - bcrypt adds latency to user authentication
  - Environment variable management complexity
  - Benefits: Strong security practices

## Known Limitations

### Scalability
- Current architecture may need adjustments for very large user bases
- Socket.IO connection management becomes complex at scale
- MongoDB may need sharding for large datasets

### Offline Support
- Limited offline capabilities
- Message synchronization issues during network loss

### Performance
- Initial load time for large message histories
- Memory usage with multiple open chat sessions
- Need for message pagination optimization
