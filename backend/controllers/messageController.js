const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const { responseBody } = require('../config/responseBody');

// @desc    Send a new encrypted message
// @route   POST /api/messages/send
// @access  Patient / Doctor
exports.sendMessage = async (req, res) => {
  try {
    const { appointmentId, senderRole, senderId, message } = req.body;

    if (!appointmentId || !senderRole || !senderId || !message) {
      return res.status(400).json(
        responseBody(400, 'Missing required fields')
      );
    }

    const encrypted = encryptMessage(message);

    const newMessage = await Message.create({
      appointmentId,
      senderRole,
      senderId,
      encryptedMessage: encrypted
    });

    return res.status(201).json(
      responseBody(201, 'Message sent successfully', newMessage)
    );
  } catch (err) {
    console.error('Send Message Error:', err);
    return res.status(500).json(
      responseBody(500, 'Internal server error')
    );
  }
};

// @desc    Get all messages for an appointment (decrypted)
// @route   GET /api/messages/:appointmentId
// @access  Patient / Doctor
exports.getMessagesByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const messages = await Message.find({ appointmentId }).sort({ timestamp: 1 });

    const decryptedMessages = messages.map(msg => ({
      _id: msg._id,
      senderRole: msg.senderRole,
      senderId: msg.senderId,
      appointmentId: msg.appointmentId,
      message: decryptMessage(msg.encryptedMessage),
      timestamp: msg.timestamp
    }));

    return res.status(200).json(
      responseBody(200, 'Messages retrieved successfully', decryptedMessages)
    );
  } catch (err) {
    console.error('Fetch Messages Error:', err);
    return res.status(500).json(
      responseBody(500, 'Internal server error')
    );
  }
};

// @desc    Delete a message (optional, admin only)
// @route   DELETE /api/messages/:messageId
// @access  Admin
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deleted = await Message.findByIdAndDelete(messageId);

    if (!deleted) {
      return res.status(404).json(
        responseBody(404, 'Message not found')
      );
    }

    return res.status(200).json(
      responseBody(200, 'Message deleted successfully')
    );
  } catch (err) {
    console.error('Delete Message Error:', err);
    return res.status(500).json(
      responseBody(500, 'Internal server error')
    );
  }
};
