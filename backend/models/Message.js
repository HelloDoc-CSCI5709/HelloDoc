// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  senderRole: { type: String, enum: ['patient', 'doctor'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  encryptedMessage: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
