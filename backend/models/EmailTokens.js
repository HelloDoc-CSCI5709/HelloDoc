const mongoose = require('mongoose');
const { EMAIL } = require('../config/Constants');

const emailTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: EMAIL.VERIFICATION_EXPIRATION_SECONDS
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {strict: true});

module.exports = mongoose.model('EmailToken', emailTokenSchema);