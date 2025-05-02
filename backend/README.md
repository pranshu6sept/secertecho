# SecretEcho Backend

This is the backend API for SecretEcho, a real-time AI companion messaging web app.

## Features

- JWT Authentication (register, login, get current user)
- Message management (create, read, update, delete)
- Real-time messaging with Socket.io
- MongoDB database integration
- Error handling middleware
- Simulated AI responses

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.js       # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/secretecho
   JWT_SECRET=your_jwt_secret_key_change_in_production
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

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
- `disconnect` - Client disconnects from the server

## Architecture Decisions

- **Modular Structure**: The codebase is organized into modules by feature, making it easy to maintain and extend.
- **Middleware Pattern**: Authentication and error handling are implemented as middleware for clean, reusable code.
- **Real-time Communication**: Socket.io is used for real-time messaging between clients and the server.
- **MongoDB with Mongoose**: Provides a flexible schema and easy integration with Node.js.
- **JWT Authentication**: Secure, stateless authentication that works well with RESTful APIs.

## Error Handling

The application includes a centralized error handling middleware that processes different types of errors:
- Validation errors
- Duplicate key errors
- JWT errors
- General server errors

## Future Improvements

- Add rate limiting
- Implement refresh tokens
- Add unit and integration tests
- Add logging service
- Implement message pagination
