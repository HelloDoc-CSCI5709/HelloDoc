const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600
  },
  verifiedAt: {
    type: Date,
    default: null
  }
});

passwordResetTokenSchema.index({ email: 1, otp: 1 });
passwordResetTokenSchema.index({ userId: 1 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);