const express = require('express');
const { 
  getMessages, 
  createMessage, 
  markAsRead, 
  deleteMessage 
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all messages for a user
router.get('/', getMessages);

// Create a new message
router.post('/', createMessage);

// Mark messages as read
router.put('/read', markAsRead);

// Delete a message
router.delete('/:id', deleteMessage);

module.exports = router;
