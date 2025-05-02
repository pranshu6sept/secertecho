const Message = require('../models/message.model');

// Reference to io will be set from server.js
let io;

// Function to set io reference
exports.setIo = (socketIo) => {
  io = socketIo;
};

// Get all messages for a user
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// Create a new message
exports.createMessage = async (req, res, next) => {
  try {
    const { content, skipAiResponse } = req.body;
    const userId = req.user.id;

    console.log('Creating message for user:', userId, 'with content:', content);

    // Create user message
    const userMessage = new Message({
      userId,
      sender: 'user',
      content,
      timestamp: new Date()
    });

    await userMessage.save();
    console.log('User message saved:', userMessage._id);
    
    // Emit user message via socket if io is available
    if (io) {
      io.to(userId).emit('message', userMessage);
    }

    // Only create AI response if not skipped
    let aiMessage = null;
    if (!skipAiResponse) {
      // Create AI response (in a real app, this would be handled by an AI service)
      const aiResponse = generateAIResponse();
      
      aiMessage = new Message({
        userId,
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date(Date.now() + 1000) // 1 second later
      });

      await aiMessage.save();
      console.log('AI message saved:', aiMessage._id);
      
      // Emit AI message via socket immediately to ensure clients receive it
      if (io) {
        io.to(userId).emit('message', aiMessage);
        console.log('AI message emitted via socket:', aiMessage._id);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    next(error);
  }
};

// Mark messages as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of message IDs'
      });
    }

    // Filter out message IDs that don't match MongoDB ObjectId pattern
    const validObjectIds = messageIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    
    if (validObjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `0 messages marked as read - no valid message IDs provided`
      });
    }

    const result = await Message.updateMany(
      { 
        _id: { $in: validObjectIds },
        userId: userId
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} messages marked as read`
    });
  } catch (error) {
    next(error);
  }
};

// Delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    // Check if the ID is a valid MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(messageId)) {
      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully (client-side only ID)'
      });
    }

    const message = await Message.findOne({ _id: messageId, userId });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate AI responses
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
